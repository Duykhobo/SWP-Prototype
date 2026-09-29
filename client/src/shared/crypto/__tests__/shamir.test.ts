import { describe, it, expect } from 'vitest';
import {
  splitSecret,
  combineShares,
  getLagrangeTrace,
  splitSecretWithUserPassphrase,
} from '../shamir';

describe('Shamir Secret Sharing (SSS) GF(256) Unit Tests', () => {
  it('should split secret into 3 shares with threshold 2', () => {
    const secret = 'LegacyVault_2026_MasterKey_Test';
    const shares = splitSecret(secret, 3, 2);

    expect(shares).toHaveLength(3);
    expect(shares[0].x).toBe(1);
    expect(shares[1].x).toBe(2);
    expect(shares[2].x).toBe(3);
  });

  it('should reconstruct master secret from Share 1 and Share 2', () => {
    const secret = 'LegacyVault_TopSecret_Passphrase_123';
    const shares = splitSecret(secret, 3, 2);

    const recovered = combineShares([shares[0], shares[1]]);
    expect(recovered).toBe(secret);
  });

  it('should reconstruct master secret from Share 1 and Share 3 (Beneficiary recovery)', () => {
    const secret = 'LegacyVault_Beneficiary_Recovery_Key';
    const shares = splitSecret(secret, 3, 2);

    const recovered = combineShares([shares[0], shares[2]]);
    expect(recovered).toBe(secret);
  });

  it('should fail if less than threshold shares provided', () => {
    const secret = 'Secret';
    const shares = splitSecret(secret, 3, 2);

    expect(() => combineShares([shares[0]])).toThrowError();
  });

  it('should compute exact Lagrange weights and match rows in getLagrangeTrace', () => {
    const secret = 'Vault2026';
    const shares = splitSecret(secret, 3, 2);

    // Test with Share 1 and Share 2
    const trace = getLagrangeTrace(shares[0], shares[1], secret);
    expect(trace.x1).toBe(1);
    expect(trace.x2).toBe(2);
    expect(trace.denominator).toBe(3); // 1 ^ 2 = 3
    expect(trace.l1).toBe(245); // 2 / 3 in GF(256) (245 * 3 = 2)
    expect(trace.l2).toBe(244); // 1 / 3 in GF(256) (244 * 3 = 1)
    expect(trace.rows.length).toBeGreaterThan(0);
    expect(trace.rows.every((r) => r.isMatch)).toBe(true);
  });

  it('should allow user to define custom passphrase for Share 2 and reconstruct correctly', async () => {
    const masterSecret = 'SuperSecretMasterKey2026';
    const userPassphrase = 'MyCustomPersonalPassphrase@123';

    // Split with user passphrase
    const { shares } = await splitSecretWithUserPassphrase(masterSecret, userPassphrase);
    expect(shares).toHaveLength(3);

    // Reconstruct with Share 1 (Server) + Share 2 (User Passphrase derived)
    const recoveredWithUser = combineShares([shares[0], shares[1]]);
    expect(recoveredWithUser).toBe(masterSecret);

    // Reconstruct with Share 1 (Server) + Share 3 (Beneficiary emergency)
    const recoveredWithBeneficiary = combineShares([shares[0], shares[2]]);
    expect(recoveredWithBeneficiary).toBe(masterSecret);
  });
});


