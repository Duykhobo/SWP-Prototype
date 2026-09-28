import { describe, it, expect } from 'vitest';
import { splitSecret, combineShares } from '../shamir';

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
});
