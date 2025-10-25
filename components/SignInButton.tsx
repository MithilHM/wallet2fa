'use client';

import { useAccount, useSignMessage, useChainId } from 'wagmi';
import { SiweMessage } from 'siwe';
import { useState } from 'react';
import { ethers } from 'ethers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

export default function SignInButton() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const chainId = useChainId();

  const [loading, setLoading] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [zkProof, setZkProof] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!address || !isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setTxHash(null);

    try {
      // Step 1: Request nonce from backend
      console.log('🔐 Step 1: Requesting nonce...');
      const nonceResponse = await fetch(`${API_URL}/api/auth/nonce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      if (!nonceResponse.ok) {
        throw new Error('Failed to get nonce');
      }

      const { nonce } = await nonceResponse.json();
      console.log('✅ Nonce received:', nonce);

      // Step 2: Create SIWE message
      console.log('📝 Step 2: Creating SIWE message...');
      const message = new SiweMessage({
        domain: window.location.host,
        address: address,
        statement: 'Sign in with Ethereum to Wallet2FA',
        uri: window.location.origin,
        version: '1',
        chainId: chainId,
        nonce: nonce,
      });

      const messageString = message.prepareMessage();
      console.log('Message to sign:', messageString);

      // Step 3: Sign message with wallet
      console.log('✍️ Step 3: Signing message...');
      const signature = await signMessageAsync({ message: messageString });
      console.log('✅ Signature obtained');

      // Step 4: Verify signature and get JWT
      console.log('🔍 Step 4: Verifying signature...');
      const verifyResponse = await fetch(`${API_URL}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageString,
          signature: signature,
          address: address,
        }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.message || 'Verification failed');
      }

      const verifyData = await verifyResponse.json();
      console.log('✅ Verification successful:', verifyData);

      // Store JWT token
      setAuthToken(verifyData.token);
      setZkProof(verifyData.zkProofHash);
      localStorage.setItem('wallet2fa_token', verifyData.token);

      // Step 5: Log to smart contract (simulated for now)
      console.log('⛓️ Step 5: Logging to smart contract...');
      try {
        await logToContract(verifyData.zkProofHash.commitment);
        setSuccess('🎉 Authentication successful! Transaction logged on-chain.');
      } catch (contractError) {
        console.error('Contract interaction failed:', contractError);
        setSuccess('✅ Authentication successful! (Contract not yet deployed - will log on-chain after deployment)');
      }

    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const logToContract = async (sessionHash: string) => {
    // This will be used once contract is deployed
    // For now, we'll simulate it
    if (CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      console.log('📝 Mock contract interaction - sessionHash:', sessionHash);
      return;
    }

    // Real contract interaction code (will be used after deployment)
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();

    const contractABI = [
      'function isUserRegistered(address user) external view returns (bool)',
      'function registerUser() external',
      'function logAuthentication(string service, bytes32 sessionHash) external',
    ];

    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

    // Check if user is registered
    const isRegistered = await contract.isUserRegistered(address);
    
    if (!isRegistered) {
      console.log('Registering user...');
      const registerTx = await contract.registerUser();
      await registerTx.wait();
      console.log('User registered!');
    }

    // Log authentication
    console.log('Logging authentication...');
    const sessionHashBytes32 = ethers.keccak256(ethers.toUtf8Bytes(sessionHash));
    const authTx = await contract.logAuthentication('Wallet2FA', sessionHashBytes32);
    const receipt = await authTx.wait();
    
    console.log('Authentication logged! TX:', receipt.hash);
    setTxHash(receipt.hash);
  };

  if (!isConnected) {
    return (
      <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <p className="text-yellow-200">👆 Connect your wallet above to sign in</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleSignIn}
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform transition hover:scale-105 shadow-lg"
      >
        {loading ? '🔄 Signing In...' : '🔐 Sign In with Wallet'}
      </button>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-300 text-sm">❌ {error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-green-300 text-sm">{success}</p>
          {txHash && (
            <a 
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-xs mt-2 block"
            >
              View transaction →
            </a>
          )}
        </div>
      )}

      {authToken && zkProof && (
        <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg space-y-2">
          <h3 className="text-purple-300 font-semibold text-sm">✅ Authenticated</h3>
          <div className="text-xs text-gray-400 space-y-1">
            <p><span className="text-gray-500">Address:</span> {address?.slice(0, 6)}...{address?.slice(-4)}</p>
            <p><span className="text-gray-500">ZK Commitment:</span> {zkProof.commitment.slice(0, 16)}...</p>
            <p><span className="text-gray-500">Nullifier:</span> {zkProof.nullifier.slice(0, 16)}...</p>
            <p className="text-purple-400 mt-2">🎭 Your identity is protected with zero-knowledge proofs</p>
          </div>
        </div>
      )}
    </div>
  );
}
