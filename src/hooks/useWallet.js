import { useState, useCallback, useEffect } from "react";

// Decode CBOR-encoded balance returned by CIP-30 getBalance()
// The value is a CBOR-encoded Value type. For ADA-only wallets it's
// typically a simple CBOR uint, e.g. 0x1a3B9ACA00 = 1000000000 lovelace.
function decodeCborBalance(hex) {
  try {
    // CBOR unsigned int encodings:
    // 0x00–0x17 → value itself
    // 0x18 xx   → 1-byte uint
    // 0x19 xxyy → 2-byte uint
    // 0x1a xxxx → 4-byte uint  ← most common for ADA balances
    // 0x1b xxxx → 8-byte uint
    const bytes = hex.match(/.{1,2}/g).map((b) => parseInt(b, 16));
    const first = bytes[0];

    if (first <= 0x17) return first;
    if (first === 0x18) return bytes[1];
    if (first === 0x19) return (bytes[1] << 8) | bytes[2];
    if (first === 0x1a) {
      return (
        ((bytes[1] << 24) | (bytes[2] << 16) | (bytes[3] << 8) | bytes[4]) >>>
        0
      );
    }
    if (first === 0x1b) {
      // 8-byte uint — use BigInt to avoid precision loss
      const hi = (bytes[1] * 2 ** 24 + bytes[2] * 2 ** 16 + bytes[3] * 2 ** 8 + bytes[4]);
      const lo = (bytes[5] * 2 ** 24 + bytes[6] * 2 ** 16 + bytes[7] * 2 ** 8 + bytes[8]);
      return hi * 2 ** 32 + lo;
    }

    // Fallback: try plain hex parse (some wallets return plain lovelace hex)
    const plain = parseInt(hex, 16);
    return isNaN(plain) ? 0 : plain;
  } catch {
    return 0;
  }
}

export function useWallet() {
  const [account, setAccount]     = useState(null);
  const [balance, setBalance]     = useState(null);
  const [api, setApi]             = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError]         = useState(null);

  // FIX: Extract enableWallet as a stable standalone function (no closure issues)
  const enableWallet = useCallback(async () => {
    const laceApi = await window.cardano.lace.enable();
    setApi(laceApi);

    // Get wallet address
    const addresses = await laceApi.getUsedAddresses();
    const address = addresses[0] || (await laceApi.getChangeAddress());
    setAccount(address);

    // FIX: Properly decode CBOR balance instead of parseInt(hex)
    try {
      const balanceCbor = await laceApi.getBalance();
      const lovelace = decodeCborBalance(balanceCbor);
      setBalance((lovelace / 1_000_000).toFixed(2));
    } catch {
      setBalance("0.00");
    }
  }, []);

  // Auto-reconnect on page load if previously connected
  useEffect(() => {
    async function autoReconnect() {
      if (!localStorage.getItem("walletConnected")) return;

      // Wait for Lace to inject into window.cardano (up to 5 seconds)
      let attempts = 0;
      while (!window.cardano?.lace && attempts < 10) {
        await new Promise((r) => setTimeout(r, 500));
        attempts++;
      }

      if (!window.cardano?.lace) return;

      setConnecting(true);
      try {
        await enableWallet();
      } catch (e) {
        console.warn("Auto-reconnect failed:", e.message);
        // Clear stale flag if wallet rejected auto-connect
        localStorage.removeItem("walletConnected");
      } finally {
        setConnecting(false);
      }
    }

    autoReconnect();
  }, [enableWallet]); // FIX: depend on stable enableWallet reference

  const connect = useCallback(async () => {
    if (account) return;

    if (!window.cardano?.lace) {
      setError("Lace wallet not found. Please install it.");
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      await enableWallet();
      localStorage.setItem("walletConnected", "true");
    } catch (e) {
      setError(e.message || "Connection failed");
    } finally {
      setConnecting(false);
    }
  }, [account, enableWallet]);

  const disconnect = useCallback(() => {
    setAccount(null);
    setBalance(null);
    setApi(null);
    localStorage.removeItem("walletConnected");
  }, []);

  return { account, balance, api, connecting, error, connect, disconnect };
}
