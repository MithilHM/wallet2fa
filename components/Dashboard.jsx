'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useContractStats } from '@/hooks/useContract'
import { motion } from 'framer-motion'

export default function Dashboard({ token }) {
  const { address } = useAccount()
  const { stats, isRegistered, loading } = useContractStats()
  const [authHistory, setAuthHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    async function fetchHistory() {
      if (!token) return
      
      setLoadingHistory(true)
      try {
        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()
        setAuthHistory(data.recentLogins || [])
      } catch (err) {
        console.error('Error fetching history:', err)
      } finally {
        setLoadingHistory(false)
      }
    }

    fetchHistory()
  }, [token])

  if (!address) return null

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="🔐"
          title="Total Logins"
          value={stats?.totalLogins || 0}
          loading={loading}
          gradient="from-purple-500 to-pink-500"
        />
        <StatCard
          icon="⭐"
          title="Reputation Score"
          value={stats?.reputationScore || 0}
          loading={loading}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          icon="🎨"
          title="NFT Badges"
          value={stats?.nftBalance || 0}
          loading={loading}
          gradient="from-green-500 to-emerald-500"
        />
        <StatCard
          icon={isRegistered ? '✅' : '❌'}
          title="Registration"
          value={isRegistered ? 'Active' : 'Inactive'}
          loading={loading}
          gradient="from-orange-500 to-red-500"
        />
      </div>

      {/* Authentication History */}
      <div className="bg-gradient-to-br from-gray-800/50 to-purple-900/30 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <span className="mr-2">📜</span>
          Recent Authentication History
        </h3>
        {loadingHistory ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          </div>
        ) : authHistory.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No authentication history yet</p>
        ) : (
          <div className="space-y-3">
            {authHistory.map((auth, idx) => (
              <motion.div
                key={auth.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-purple-500/50 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-medium">Authentication #{authHistory.length - idx}</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {new Date(auth.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                      Verified
                    </span>
                  </div>
                </div>
                {auth.zkProof && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-500 mb-1">ZK Proof Hash:</p>
                    <p className="text-xs text-purple-400 font-mono break-all">
                      {auth.zkProof.commitment?.slice(0, 32)}...
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, title, value, loading, gradient }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`bg-gradient-to-br ${gradient} p-[2px] rounded-xl`}
    >
      <div className="bg-gray-900 rounded-xl p-6 h-full">
        <div className="flex items-center justify-between mb-2">
          <span className="text-3xl">{icon}</span>
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
        </div>
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        <p className="text-white text-2xl font-bold">{value}</p>
      </div>
    </motion.div>
  )
}
