// src/lib/transactions/parse-error.ts
export function parseTransactionError(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes('insufficient funds')) {
        return "You don't have enough ETH to pay for this transaction's gas fee.";
    }

    if (message.includes('User rejected') || message.includes('User denied')) {
        return 'You cancelled the transaction in your wallet.';
    }

    if (message.includes('revert')) {
        return 'This transaction would fail on-chain — nothing was sent.';
    }

    return 'Something went wrong with this transaction. Please try again.';
}
