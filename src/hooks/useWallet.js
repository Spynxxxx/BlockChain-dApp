import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

export function useWallet() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const getBalance = async (web3Provider, address) => {
    try {
      const wei = await web3Provider.getBalance(address);
      const eth = ethers.formatEther(wei);
      setBalance(parseFloat(eth).toFixed(4));
    } catch (e) {
      setBalance("0.0000");
    }
  };

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError("MetaMask not found. Please install it.");
      return;
    }
    setConnecting(true);
    setError(null);
    try {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await web3Provider.send(
        "eth_requestAccounts", []
      );
      const web3Signer = await web3Provider.getSigner();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(accounts[0]);
      await getBalance(web3Provider, accounts[0]);
    } catch (e) {
      setError(e.message || "Connection failed");
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
    setBalance(null);
    setProvider(null);
    setSigner(null);
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        connect();
      }
    });

    window.ethereum.on("chainChanged", () => {
      connect();
    });
  }, [connect, disconnect]);

  return {
    account,
    balance,
    provider,
    signer,
    connecting,
    error,
    connect,
    disconnect,
  };
}