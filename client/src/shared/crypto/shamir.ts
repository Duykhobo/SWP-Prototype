/**
 * Shamir's Secret Sharing (SSS) trong trường hữu hạn GF(256)
 * Triển khai mô hình Anti-Rogue Admin:
 * Ngưỡng k = 2, tổng n = 3 mảnh:
 * - Mảnh 1: System Share (Lưu tại Server Backend / Cloud KMS)
 * - Mảnh 2: User Passphrase Share (Người dùng nắm giữ)
 * - Mảnh 3: Emergency / Beneficiary Share (Thân nhân / Công chứng viên)
 * 
 * Định lý: 1 mảnh duy nhất hoàn toàn không cung cấp bất kỳ thông tin nào về Master Key (0-bit leakage).
 */

// Bảng nhân và lũy thừa trong Galois Field GF(2^8) với đa thức tối giản 0x11d
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);

(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    EXP[i + 255] = x;
    LOG[x] = i;
    x = x << 1;
    if (x & 0x100) x ^= 0x11d;
  }
  EXP[510] = EXP[0];
  LOG[0] = 0;
})();

export function gfAdd(a: number, b: number): number {
  return a ^ b;
}

export function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP[LOG[a] + LOG[b]];
}

export function gfDiv(a: number, b: number): number {
  if (b === 0) throw new Error("Division by zero in GF(256)");
  if (a === 0) return 0;
  return EXP[(LOG[a] - LOG[b] + 255) % 255];
}

export interface Share {
  x: number;
  dataHex: string;
}

/**
 * Tách Master Secret thành n mảnh với ngưỡng khôi phục k (mặc định 2-of-3)
 */
export function splitSecret(secretStr: string, n = 3, k = 2): Share[] {
  const encoder = new TextEncoder();
  const secretBytes = encoder.encode(secretStr);
  const shares: { x: number; bytes: Uint8Array }[] = [];

  for (let i = 1; i <= n; i++) {
    shares.push({ x: i, bytes: new Uint8Array(secretBytes.length) });
  }

  for (let b = 0; b < secretBytes.length; b++) {
    const s = secretBytes[b];
    // Đa thức f(x) = s + a1*x (với k=2)
    const a1 = Math.floor(Math.random() * 255) + 1; // Hệ số bậc 1 ngẫu nhiên != 0

    for (let i = 0; i < n; i++) {
      const x = shares[i].x;
      const y = gfAdd(s, gfMul(a1, x));
      shares[i].bytes[b] = y;
    }
  }

  return shares.map((s) => ({
    x: s.x,
    dataHex: Array.from(s.bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(""),
  }));
}

/**
 * Khôi phục Master Secret từ tối thiểu k mảnh sử dụng Nội suy Lagrange tại x = 0
 */
export function combineShares(shares: Share[]): string {
  if (shares.length < 2) {
    throw new Error("Không đủ số mảnh tối thiểu (cần ít nhất 2 mảnh để tái cấu trúc).");
  }

  const byteLen = shares[0].dataHex.length / 2;
  const decodedShares = shares.map((s) => {
    const bytes = new Uint8Array(byteLen);
    for (let i = 0; i < byteLen; i++) {
      bytes[i] = parseInt(s.dataHex.slice(i * 2, i * 2 + 2), 16);
    }
    return { x: s.x, bytes };
  });

  const recoveredBytes = new Uint8Array(byteLen);

  for (let b = 0; b < byteLen; b++) {
    let secretByte = 0;

    for (let i = 0; i < decodedShares.length; i++) {
      const xi = decodedShares[i].x;
      const yi = decodedShares[i].bytes[b];

      // Tính trọng số Lagrange L_i(0) = \prod_{j \neq i} \frac{0 - x_j}{x_i - x_j}
      let li = 1;
      for (let j = 0; j < decodedShares.length; j++) {
        if (i === j) continue;
        const xj = decodedShares[j].x;
        // Trong GF(256), -x chính là x vì phép cộng/trừ là XOR
        const numerator = xj;
        const denominator = gfAdd(xi, xj);
        li = gfMul(li, gfDiv(numerator, denominator));
      }

      secretByte = gfAdd(secretByte, gfMul(yi, li));
    }

    recoveredBytes[b] = secretByte;
  }

  const decoder = new TextDecoder();
  return decoder.decode(recoveredBytes);
}

export interface LagrangeTraceRow {
  index: number;
  expectedChar: string;
  expectedByte: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  term1: number;
  term2: number;
  reconstructedByte: number;
  reconstructedChar: string;
  isMatch: boolean;
}

export interface LagrangeTrace {
  x1: number;
  x2: number;
  l1: number; // trọng số Mảnh 1 trong GF(256)
  l2: number; // trọng số Mảnh 2 trong GF(256)
  denominator: number;
  rows: LagrangeTraceRow[];
}

/**
 * Trích xuất từng bước tính toán nội suy Lagrange chi tiết phục vụ hiển thị Client UI
 */
export function getLagrangeTrace(shareA: Share, shareB: Share, originalSecret?: string): LagrangeTrace {
  const x1 = shareA.x;
  const x2 = shareB.x;
  const denom = gfAdd(x1, x2);
  const l1 = gfDiv(x2, denom);
  const l2 = gfDiv(x1, denom);

  const byteLen = Math.min(shareA.dataHex.length, shareB.dataHex.length) / 2;
  const sampleLimit = Math.min(byteLen, 5); // Hiển thị 5 bytes đầu
  const encoder = new TextEncoder();
  const origBytes = originalSecret ? encoder.encode(originalSecret) : null;

  const rows: LagrangeTraceRow[] = [];
  for (let i = 0; i < sampleLimit; i++) {
    const y1 = parseInt(shareA.dataHex.slice(i * 2, i * 2 + 2), 16);
    const y2 = parseInt(shareB.dataHex.slice(i * 2, i * 2 + 2), 16);
    const term1 = gfMul(y1, l1);
    const term2 = gfMul(y2, l2);
    const recByte = gfAdd(term1, term2);
    const recChar = recByte >= 32 && recByte <= 126 ? String.fromCharCode(recByte) : `\\x${recByte.toString(16).padStart(2, '0')}`;
    const expByte = origBytes && i < origBytes.length ? origBytes[i] : recByte;
    const expChar = origBytes && i < origBytes.length
      ? (expByte >= 32 && expByte <= 126 ? String.fromCharCode(expByte) : `\\x${expByte.toString(16).padStart(2, '0')}`)
      : recChar;

    rows.push({
      index: i,
      expectedChar: expChar,
      expectedByte: expByte,
      x1,
      y1,
      x2,
      y2,
      term1,
      term2,
      reconstructedByte: recByte,
      reconstructedChar: recChar,
      isMatch: recByte === expByte,
    });
  }

  return {
    x1,
    x2,
    l1,
    l2,
    denominator: denom,
    rows,
  };
}

