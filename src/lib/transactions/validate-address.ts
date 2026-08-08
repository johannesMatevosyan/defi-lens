// src/lib/transactions/validate-address.ts
import { getAddress, isAddress } from 'viem';

export function validateRecipientAddress(input: string): { valid: boolean; error?: string } {
    if (!input) {
        return { valid: false, error: 'Enter a recipient address' };
    }

    if (!isAddress(input)) {
        return { valid: false, error: 'This is not a valid address' };
    }

    const checksummed = getAddress(input);
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

    if (checksummed === ZERO_ADDRESS) {
        return { valid: false, error: 'Cannot send to the zero address — this would burn your tokens permanently' };
    }

    return { valid: true };
}
