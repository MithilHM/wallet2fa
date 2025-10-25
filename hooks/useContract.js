import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { ethers } from 'ethers'
import Wallet2FA_ABI from '@/lib/Wallet2FA-abi.json'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS

export function useContractStats() {
  const { address } = useAccount()
  const [stats, setStats] = useState(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchStats() {
      if (!address || !window.ethereum) return
      
      setLoading(true)
      setError(null)
      
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const contract = new ethers.Contract(CONTRACT_ADDRESS, Wallet2FA_ABI, provider)
        
        // Check registration
        const registered = await contract.isUserRegistered(address)
        setIsRegistered(registered)
        
        // Get stats if registered
        if (registered) {
          const userStats = await contract.getUserStats(address)
          setStats({
            totalLogins: Number(userStats[0]),
            lastLogin: Number(userStats[1]),
            reputationScore: Number(userStats[2]),
            nftBalance: Number(userStats[3])
          })
        }
      } catch (err) {
        console.error('Error fetching contract stats:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [address])

  return { stats, isRegistered, loading, error, refetch: () => {} }
}

export function useActiveSessions() {
  const { address } = useAccount()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchSessions() {
      if (!address || !window.ethereum) return
      
      setLoading(true)
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const contract = new ethers.Contract(CONTRACT_ADDRESS, Wallet2FA_ABI, provider)
        const activeSessions = await contract.getActiveSessions(address)
        setSessions(activeSessions)
      } catch (err) {
        console.error('Error fetching sessions:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [address])

  return { sessions, loading }
}
