'use client';

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import SignInButton from '@/components/SignInButton';
import Dashboard from '@/components/Dashboard';
import ContractInteraction from '@/components/ContractInteraction';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('home');
  const [authToken, setAuthToken] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for stored token
    const token = localStorage.getItem('wallet2fa_token');
    if (token) {
      setAuthToken(token);
      setActiveTab('dashboard');
    }
  }, []);

  useEffect(() => {
    if (isConnected && authToken) {
      setActiveTab('dashboard');
    }
  }, [isConnected, authToken]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-purple-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-blue-500 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 p-4 md:p-6 flex flex-col md:flex-row justify-between items-center backdrop-blur-sm bg-gray-900/20 border-b border-purple-500/20"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-3 mb-4 md:mb-0"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-3xl md:text-4xl"
          >
            🔐
          </motion.div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Wallet2FA</h1>
        </motion.div>
        <div className="scale-90 md:scale-100">
          <ConnectButton />
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8 md:py-16 max-w-7xl">
        {/* Navigation Tabs */}
        {isConnected && authToken && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 md:gap-4 mb-8 md:mb-12 justify-center"
          >
            {['home', 'dashboard', 'contract'].map((tab) => (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab)}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold transition-all text-sm md:text-base ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-800/50 text-gray-400 hover:text-white border border-gray-700'
                }`}
              >
                {tab === 'home' && '🏠 Home'}
                {tab === 'dashboard' && '📊 Dashboard'}
                {tab === 'contract' && '⛓️ Contract'}
              </motion.button>
            ))}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Hero Section */}
              <div className="text-center mb-12 md:mb-16">
                <motion.h1
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"
                >
                  Decentralized 2FA
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg md:text-xl text-gray-300 mb-4"
                >
                  Replace SMS and email 2FA with secure wallet signatures
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto px-4"
                >
                  Authenticate with your crypto wallet using Sign-In with Ethereum (SIWE), 
                  with privacy-enhanced zero-knowledge proofs and on-chain authentication logs
                </motion.p>
              </div>

              {/* Authentication Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-gray-800/50 to-purple-900/30 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-6 md:p-8 shadow-2xl mb-8 md:mb-12 max-w-2xl mx-auto"
              >
                <h2 className="text-xl md:text-2xl font-semibold text-white mb-4 md:mb-6 text-center">
                  {isConnected ? '🎯 Sign In to Continue' : '👋 Get Started'}
                </h2>
                
                {isConnected ? (
                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-4"
                    >
                      <p className="text-blue-300 text-sm">
                        Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                      </p>
                    </motion.div>
                    <SignInButton />
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <p className="text-gray-300 mb-4 text-sm md:text-base">Connect your wallet to get started</p>
                    <ConnectButton.Custom>
                      {({ openConnectModal }) => (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={openConnectModal}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 md:py-4 px-6 md:px-8 rounded-xl hover:from-purple-700 hover:to-blue-700 shadow-lg text-sm md:text-base"
                        >
                          🦊 Connect Wallet
                        </motion.button>
                      )}
                    </ConnectButton.Custom>
                  </div>
                )}
              </motion.div>

              {/* Features Grid */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12"
              >
                {[
                  { icon: '🔒', title: 'No SMS Required', desc: 'Eliminate SIM swap attacks and SMS vulnerabilities. Your wallet is your 2FA.' },
                  { icon: '⚡', title: 'Instant Auth', desc: 'Sign once and authenticate instantly. No codes, no waiting, just sign and verify.' },
                  { icon: '🎭', title: 'ZK Privacy', desc: 'Zero-knowledge proofs keep your authentication private while maintaining security.' },
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    whileHover={{ scale: 1.05, borderColor: 'rgba(139, 92, 246, 0.5)' }}
                    className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 md:p-6 transition-all"
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="text-2xl md:text-3xl mb-2 md:mb-3"
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="text-base md:text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-xs md:text-sm">{feature.desc}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Info Section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4 md:p-6 max-w-2xl mx-auto"
              >
                <h3 className="text-base md:text-lg font-semibold text-white mb-3">🚀 How it works</h3>
                <ol className="text-gray-300 text-xs md:text-sm space-y-2 list-decimal list-inside">
                  <li>Connect your wallet (MetaMask, WalletConnect, Coinbase Wallet, etc.)</li>
                  <li>Sign a SIWE message to prove wallet ownership</li>
                  <li>Backend verifies signature and generates JWT token</li>
                  <li>Zero-knowledge proof generated for privacy</li>
                  <li>Authentication logged on Sepolia testnet</li>
                  <li>Earn NFT rewards every 10 successful logins!</li>
                </ol>
              </motion.div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center mt-8 md:mt-12 text-gray-500 text-xs md:text-sm px-4"
              >
                <p>Built with Wagmi v2, RainbowKit, SIWE, and Hardhat</p>
                <p className="mt-2">Network: Sepolia Testnet</p>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  href={`https://sepolia.etherscan.io/address/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 mt-2 inline-block"
                >
                  View Contract on Etherscan →
                </motion.a>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'dashboard' && authToken && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 text-center"
              >
                📊 Your Dashboard
              </motion.h2>
              <Dashboard token={authToken} />
            </motion.div>
          )}

          {activeTab === 'contract' && authToken && (
            <motion.div
              key="contract"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto"
            >
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 text-center"
              >
                ⛓️ Smart Contract Interaction
              </motion.h2>
              <ContractInteraction />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}