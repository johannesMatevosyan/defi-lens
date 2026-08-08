// src/components/TransferForm.tsx
'use client';

import { useToastStore } from '@/lib/stores/toast-store';
import { useTransactionStore } from '@/lib/stores/transaction-store';
import { TRANSACTION_CHAIN_ID } from '@/lib/transactions/constants';
import { estimateTransferGas, type GasEstimate } from '@/lib/transactions/estimate-gas';
import { parseTransactionError } from '@/lib/transactions/parse-error';
import { simulateErc20Transfer } from '@/lib/transactions/simulate-transfer';
import { validateRecipientAddress } from '@/lib/transactions/validate-address';
import { wagmiConfig } from '@/lib/wagmi-config';
import { useEffect, useState } from 'react';
import { encodeFunctionData, erc20Abi, formatUnits, parseUnits } from 'viem';
import { useAccount, useBalance, useWriteContract } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { GasEstimateDisplay } from './GasEstimateDisplay';

const TOKEN_DECIMALS = 18;
const TOKEN_SYMBOL = 'DLT';

interface TransferFormProps {
  tokenAddress: `0x${string}`;
}

type FormStage = 'input' | 'simulating' | 'ready' | 'sending';

export function TransferForm({ tokenAddress }: TransferFormProps) {
    const { address } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const startTransaction = useTransactionStore((state) => state.startTransaction);
    const updateStatus = useTransactionStore((state) => state.updateStatus);
    const addToast = useToastStore((state) => state.addToast);

    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [stage, setStage] = useState<FormStage>('input');
    const [simulationError, setSimulationError] = useState<string | null>(null);
    const [gasEstimate, setGasEstimate] = useState<GasEstimate | null>(null);


    const { data: balance } = useBalance({
        address,
        token: tokenAddress,
        chainId: TRANSACTION_CHAIN_ID,
    });

    let displayAmountBigInt: bigint;
    try {
        displayAmountBigInt = amount ? parseUnits(amount, TOKEN_DECIMALS) : BigInt(0);
    } catch {
        displayAmountBigInt = BigInt(0);
    }

    const hasSufficientBalance = balance ? balance.value >= displayAmountBigInt : false;
    const addressCheck = validateRecipientAddress(recipient);

    // Re-simulate whenever the recipient or amount actually changes —
    // this is what re-checks "would this succeed?" live, as the user types.
    useEffect(() => {
        if (!address || !recipient || !amount) {
            return;
        }

        const check = validateRecipientAddress(recipient);
        if (!check.valid) return;

        let parsedAmount: bigint;
        try {
            parsedAmount = parseUnits(amount, TOKEN_DECIMALS);
        } catch {
            return; // invalid number typed, e.g. "abc" or "1.2.3"
        }

        if (parsedAmount <= BigInt(0)) return;
        if (!balance || balance.value < parsedAmount) return;

        let cancelled = false;

        setStage('simulating');
        setSimulationError(null);

        simulateErc20Transfer({
            tokenAddress,
            fromAddress: address,
            toAddress: recipient as `0x${string}`,
            amount: parsedAmount,
        }).then(async (result) => {
            if (cancelled) return;

            if (!result.success) {
                setSimulationError(result.revertReason ?? 'This transfer would fail');
                setStage('input');
                return;
            }

        try {
        const transferData = encodeFunctionData({
            abi: erc20Abi,
            functionName: 'transfer',
            args: [recipient as `0x${string}`, parsedAmount],
        });

        const estimate = await estimateTransferGas({
            from: address,
            to: tokenAddress, // the TOKEN contract itself is the "to" — that's who gets called
            data: transferData, // now genuinely describes "transfer parsedAmount to recipient"
        });

        if (cancelled) return;
            setGasEstimate(estimate);
            setStage('ready');
        } catch {
            if (cancelled) return;
            setSimulationError('Could not estimate gas for this transfer');
            setStage('input');
        }
        });

        return () => {
            cancelled = true;
        };
    }, [recipient, amount, address, balance, tokenAddress]);

    async function handleConfirm() {
        if (!address) return;
        setStage('sending');

        const id = startTransaction({
            chainId: TRANSACTION_CHAIN_ID,
            description: `Send ${amount} ${TOKEN_SYMBOL} to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`,
        });

        try {
            const hash = await writeContractAsync({
                address: tokenAddress,
                abi: erc20Abi,
                functionName: 'transfer',
                args: [recipient as `0x${string}`, displayAmountBigInt],
                chainId: TRANSACTION_CHAIN_ID,
            });

            updateStatus(id, 'pending', { hash });
            addToast('Transaction sent — waiting for confirmation.', 'info');

            // This is what was missing — actually wait for the network to
            // mine this transaction and tell us whether it succeeded or reverted.
            const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });

            if (receipt.status === 'success') {
                updateStatus(id, 'confirmed');
                addToast('Transfer confirmed!', 'success');
                setRecipient('');
                setAmount('');
                setStage('input');
                setGasEstimate(null);
            } else {
                updateStatus(id, 'failed', { errorMessage: 'Transaction reverted on-chain' });
                addToast('Transfer failed on-chain.', 'error');
                setStage('input');
            }
        } catch (error) {
            const friendlyMessage = parseTransactionError(error);
            updateStatus(id, 'failed', { errorMessage: friendlyMessage });
            addToast(friendlyMessage, 'error');
            setStage('input');
        }
    }

    return (
        <div className="space-y-4 rounded-lg border p-4">
            <div>
                <h3 className="text-lg font-semibold mb-2">My Address {address}</h3>
                <label id='recipient-address' className="text-sm font-medium">Recipient address</label>
                <input
                    id="recipient-address"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="0x..."
                    className="mt-1 w-full rounded border px-3 py-2 text-sm"
                />
                {recipient && !addressCheck.valid && (
                    <p className="mt-1 text-xs text-red-600">{addressCheck.error}</p>
                )}
            </div>

            <div>
                <label id='amount' htmlFor="amount" className="text-sm font-medium">
                    Amount ({TOKEN_SYMBOL})
                    {balance && (
                        <span className="ml-2 text-xs text-zinc-500">
                        Balance: {formatUnits(balance.value, TOKEN_DECIMALS)}
                        </span>
                    )}
                </label>
                <input
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    className="mt-1 w-full rounded border px-3 py-2 text-sm"
                />
                {amount && !hasSufficientBalance && (
                    <p className="mt-1 text-xs text-red-600">Insufficient balance</p>
                )}
            </div>

            {stage === 'simulating' && (
                <p className="text-sm text-zinc-500">Checking this transfer would succeed…</p>
            )}

            {simulationError && (
                <p className="text-sm text-red-600">{simulationError}</p>
            )}

            {stage === 'ready' && gasEstimate && (
                <>
                    <div className="rounded-lg bg-zinc-50 p-3 text-sm dark:bg-zinc-900">
                        <p>
                            You're about to send <strong>{amount} {TOKEN_SYMBOL}</strong> to{' '}
                            <strong>{recipient.slice(0, 6)}...{recipient.slice(-4)}</strong>.
                        </p>
                    </div>
                    <GasEstimateDisplay
                        from={address!}
                        to={tokenAddress}
                        data={encodeFunctionData({
                            abi: erc20Abi,
                            functionName: 'transfer',
                            args: [recipient as `0x${string}`, displayAmountBigInt],
                        })}
                        ethPriceUsd={null}
                    />
                    <button
                        onClick={handleConfirm}
                        disabled={stage !== 'ready'}
                        className="w-full rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
                    >
                        Confirm Transfer
                    </button>
                </>
            )}

            {stage === 'sending' && (
                <p className="text-sm text-zinc-500">Waiting for confirmation…</p>
            )}
        </div>
    );
}
