import { useState } from "react";
import * as CSL from "@emurgo/cardano-serialization-lib-browser";

const BLOCKFROST_KEY = import.meta.env.VITE_BLOCKFROST_KEY;
const BLOCKFROST_URL = import.meta.env.VITE_BLOCKFROST_URL;

async function fetchBlockfrost(endpoint) {
  const res = await fetch(`${BLOCKFROST_URL}${endpoint}`, {
    headers: { project_id: BLOCKFROST_KEY },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Blockfrost error ${res.status}`);
  }
  return res.json();
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2)
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  return bytes;
}

async function buildAndSignTx({ laceApi, toAddress, lovelace }) {
  const utxosCbor = await laceApi.getUtxos();
  const changeAddr = await laceApi.getChangeAddress();

  if (!utxosCbor || utxosCbor.length === 0)
    throw new Error("Insufficient ADA. Your wallet appears to be empty.");

  const params = await fetchBlockfrost("/epochs/latest/parameters");
  const tip = await fetchBlockfrost("/blocks/latest");

  const coinsPerUtxoByte =
    params.coins_per_utxo_size ?? params.coins_per_utxo_word ?? "4310";

  const txBuilderCfg = CSL.TransactionBuilderConfigBuilder.new()
    .fee_algo(
      CSL.LinearFee.new(
        CSL.BigNum.from_str(String(params.min_fee_a)),
        CSL.BigNum.from_str(String(params.min_fee_b)),
      ),
    )
    .pool_deposit(CSL.BigNum.from_str(String(params.pool_deposit)))
    .key_deposit(CSL.BigNum.from_str(String(params.key_deposit)))
    .max_value_size(Number(params.max_val_size ?? 5000))
    .max_tx_size(Number(params.max_tx_size ?? 16384))
    .coins_per_utxo_byte(CSL.BigNum.from_str(String(coinsPerUtxoByte)))
    .build();

  const txBuilder = CSL.TransactionBuilder.new(txBuilderCfg);

  for (const utxoCbor of utxosCbor) {
    const utxo = CSL.TransactionUnspentOutput.from_hex(utxoCbor);
    txBuilder.add_regular_input(
      utxo.output().address(),
      utxo.input(),
      utxo.output().amount(),
    );
  }

  txBuilder.add_output(
    CSL.TransactionOutput.new(
      CSL.Address.from_bech32(toAddress),
      CSL.Value.new(CSL.BigNum.from_str(lovelace)),
    ),
  );

  txBuilder.set_ttl_bignum(CSL.BigNum.from_str(String(tip.slot + 7200)));

  txBuilder.add_change_if_needed(CSL.Address.from_hex(changeAddr));

  const unsignedTx = txBuilder.build_tx();
  const unsignedTxHex = bytesToHex(unsignedTx.to_bytes());

  const witnessHex = await laceApi.signTx(unsignedTxHex, true);

  const signedTx = CSL.Transaction.new(
    unsignedTx.body(),
    CSL.TransactionWitnessSet.from_hex(witnessHex),
    unsignedTx.auxiliary_data(),
  );

  return bytesToHex(signedTx.to_bytes());
}

function Transaction() {
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [loading, setLoading] = useState(false);

  async function sendTransaction() {
    try {
      if (!window.cardano?.lace) {
        setStatus({ type: "error", msg: "Lace wallet not found!" });
        return;
      }
      if (!toAddress.trim() || !amount) {
        setStatus({ type: "error", msg: "Please fill in all fields." });
        return;
      }
      if (!toAddress.trim().startsWith("addr_test1")) {
        setStatus({
          type: "error",
          msg: "Address must start with addr_test1...",
        });
        return;
      }

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount < 1) {
        setStatus({ type: "error", msg: "Minimum send amount is 1 ADA." });
        return;
      }

      setLoading(true);
      setTxHash(null);

      setStatus({ type: "info", msg: "Connecting to Lace wallet..." });
      const laceApi = await window.cardano.lace.enable();

      const networkId = await laceApi.getNetworkId();
      if (networkId !== 0) {
        setStatus({
          type: "error",
          msg: "Please switch Lace to Preview network.",
        });
        setLoading(false);
        return;
      }

      try {
        const usedAddresses = await laceApi.getUsedAddresses();
        const walletAddr = usedAddresses?.[0];
        if (walletAddr) {
          const info = await fetchBlockfrost(`/addresses/${walletAddr}`);
          const lovelaceBal = parseInt(
            info.amount?.find((a) => a.unit === "lovelace")?.quantity ?? "0",
          );
          const balAda = lovelaceBal / 1_000_000;
          if (balAda < parsedAmount + 0.5) {
            setStatus({
              type: "error",
              msg: `Insufficient balance. You have ${balAda.toFixed(2)} ADA (need ${parsedAmount} + ~0.5 for fees).`,
            });
            setLoading(false);
            return;
          }
        }
      } catch {}

      setStatus({ type: "info", msg: "Building transaction..." });
      const lovelace = Math.floor(parsedAmount * 1_000_000).toString();
      const signedTxHex = await buildAndSignTx({
        laceApi,
        toAddress: toAddress.trim(),
        lovelace,
      });

      setStatus({ type: "info", msg: "Submitting to blockchain..." });
      const submitRes = await fetch(`${BLOCKFROST_URL}/tx/submit`, {
        method: "POST",
        headers: {
          project_id: BLOCKFROST_KEY,
          "Content-Type": "application/cbor",
        },
        body: hexToBytes(signedTxHex),
      });

      if (!submitRes.ok) {
        const errData = await submitRes.json().catch(() => ({}));
        throw new Error(errData.message || "Transaction submission failed.");
      }

      const hash = (await submitRes.text()).replace(/"/g, "");

      setTxHash(hash);
      setStatus({ type: "success", msg: "Transaction confirmed! ✅" });
      setToAddress("");
      setAmount("");
    } catch (err) {
      console.error("Transaction Error:", err);

      let msg = "Transaction failed.";
      if (err?.message) {
        if (
          err.message.includes("Insufficient") ||
          err.message.includes("UTxO")
        ) {
          msg = "Insufficient ADA balance (include ~0.5 ADA for fees).";
        } else if (err.message.toLowerCase().includes("declined")) {
          msg = "Transaction rejected in wallet.";
        } else {
          msg = err.message;
        }
      }
      setStatus({ type: "error", msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tx-section">
      <div className="tx-card">
        <h2 className="tx-title">💸 Send ADA</h2>
        <p className="tx-sub">Send ADA using Cardano Preview Network</p>

        <div className="tx-field">
          <label>Recipient Address</label>
          <input
            type="text"
            placeholder="addr_test1..."
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="tx-field">
          <label>Amount (ADA)</label>
          <input
            type="number"
            placeholder="1"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
          />
        </div>

        {status && (
          <div className={`tx-status ${status.type}`}>{status.msg}</div>
        )}

        {txHash && (
          <div className="tx-hash">
            <span>Tx Hash:</span>
            <a
              href={`https://preview.cardanoscan.io/transaction/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {txHash.slice(0, 16)}...{txHash.slice(-8)}
            </a>
          </div>
        )}

        <button
          className="btn-send"
          onClick={sendTransaction}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Transaction"}
        </button>
      </div>
    </div>
  );
}

export default Transaction;
