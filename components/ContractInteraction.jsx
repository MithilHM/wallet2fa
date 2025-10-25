'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useContractStats } from '@/hooks/useContract'
import { motion } from 'framer-motion'
import { ethers } from 'ethers'
import Wallet2FA_ABI from '@/lib/Wallet2FA-abi.json'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS

export default function ContractInteraction() {
  const { address } = useAccount()
  const { isRegistered, stats, loading } = useContractStats()
  const [registering, setRegistering] = useState(false)
  const [loggingAuth, setLoggingAuth] = useState(false)
  const [message, setMessage] = useState('')

  const handleRegister = async () => {
    if (!window.ethereum) return
    
    setRegistering(true)
    setMessage('')
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, Wallet2FA_ABI, signer)
      
      const tx = await contract.registerUser()
      await tx.wait()
      
      setMessage('✅ Successfully registered on-chain!')
      setTimeout(() => {
        setMessage('')
        window.location.reload() // Refresh to update stats
      }, 2000)
    } catch (error) {
      console.error('Registration error:', error)
      setMessage('❌ Registration failed: ' + (error.reason || error.message))
    } finally {
      setRegistering(false)
    }
  }

  const handleLogAuth = async () => {
    if (!window.ethereum) return
    
    setLoggingAuth(true)
    setMessage('')
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, Wallet2FA_ABI, signer)
      
      const sessionHash = ethers.keccak256(ethers.toUtf8Bytes(`${address}-${Date.now()}`))
      const tx = await contract.logAuthentication('wallet2fa', sessionHash)
      await tx.wait()
      
      setMessage('✅ Authentication logged on-chain!')
      setTimeout(() => {
        setMessage('')
        window.location.reload() // Refresh to update stats
      }, 2000)
    } catch (error) {
      console.error('Log auth error:', error)
      setMessage('❌ Failed to log authentication: ' + (error.reason || error.message))
    } finally {
      setLoggingAuth(false)
    }
  }

  if (!address) return null

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-blue-900/30 backdrop-blur-lg border border-blue-500/30 rounded-2xl p-6">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
        <span className="mr-2">⛓️</span>
        On-Chain Interactions
      </h3>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-400 mt-2">Loading contract data...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Registration Status */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white font-medium">Registration Status</p>
                <p className="text-gray-400 text-sm mt-1">
                  {isRegistered ? 'You are registered on the contract' : 'Register to start logging authentications'}
                </p>
              </div>
              <span className={`text-2xl ${isRegistered ? 'animate-bounce' : ''}`}>
                {isRegistered ? '✅' : '⚠️'}
              </span>
            </div>
            
            {!isRegistered && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRegister}
                disabled={registering}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {registering ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Registering...
                  </span>
                ) : (
                  '📝 Register on Contract'
                )}
              </motion.button>
            )}
          </div>

          {/* Log Authentication */}
          {isRegistered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/50 border border-gray-700 rounded-lg p-4"
            >
              <p className="text-white font-medium mb-2">Log Authentication Event</p>
              <p className="text-gray-400 text-sm mb-3">
                Record your authentication on Sepolia testnet
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogAuth}
                disabled={loggingAuth}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loggingAuth ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Logging...
                  </span>
                ) : (
                  '📝 Log Authentication'
                )}
              </motion.button>
            </motion.div>
          )}

          {/* Contract Stats */}
          {isRegistered && stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900/50 border border-gray-700 rounded-lg p-4"
            >
              <p className="text-white font-medium mb-3">Your On-Chain Stats</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-400 text-xs">Total Logins</p>
                  <p className="text-white text-xl font-bold">{stats.totalLogins}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">NFT Badges</p>
                  <p className="text-white text-xl font-bold">{stats.nftBalance} 🎨</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Reputation</p>
                  <p className="text-white text-xl font-bold">{stats.reputationScore} ⭐</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Last Login</p>
                  <p className="text-white text-sm">
                    {stats.lastLogin > 0 ? new Date(stats.lastLogin * 1000).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg ${
                message.includes('✅')
                  ? 'bg-green-500/20 border border-green-500/50 text-green-300'
                  : 'bg-red-500/20 border border-red-500/50 text-red-300'
              }`}
            >
              {message}
            </motion.div>
          )}

          {/* Contract Info */}
          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-1">Contract Address:</p>
            <p className="text-purple-400 text-xs font-mono break-all">
              {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}
            </p>
            <a
              href={`https://sepolia.etherscan.io/address/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-xs mt-2 inline-block"
            >
              View on Etherscan →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
