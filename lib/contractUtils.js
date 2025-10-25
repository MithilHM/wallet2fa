import { ethers } from 'ethers'
import Wallet2FA_ABI from './Wallet2FA-abi.json'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS

/**
 * Get contract instance
 */
export function getContract(signerOrProvider) {
  return new ethers.Contract(CONTRACT_ADDRESS, Wallet2FA_ABI, signerOrProvider)
}

/**
 * Register user on contract
 */
export async function registerUser(signer) {
  const contract = getContract(signer)
  const tx = await contract.registerUser()
  await tx.wait()
  return tx
}

/**
 * Log authentication on contract
 */
export async function logAuthentication(signer, service, sessionHash) {
  const contract = getContract(signer)
  const tx = await contract.logAuthentication(service, sessionHash)
  await tx.wait()
  return tx
}

/**
 * Get user stats from contract
 */
export async function getUserStats(provider, address) {
  const contract = getContract(provider)
  const stats = await contract.getUserStats(address)
  return {
    totalLogins: Number(stats[0]),
    lastLogin: Number(stats[1]),
    reputationScore: Number(stats[2]),
    nftBalance: Number(stats[3])
  }
}

/**
 * Check if user is registered
 */
export async function isUserRegistered(provider, address) {
  const contract = getContract(provider)
  return await contract.isUserRegistered(address)
}

/**
 * Get active sessions
 */
export async function getActiveSessions(provider, address) {
  const contract = getContract(provider)
  return await contract.getActiveSessions(address)
}

/**
 * Revoke a session
 */
export async function revokeSession(signer, sessionHash) {
  const contract = getContract(signer)
  const tx = await contract.revokeSession(sessionHash)
  await tx.wait()
  return tx
}

export { CONTRACT_ADDRESS }
