import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import { SiweMessage } from 'siwe'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { ZKAuthProof } from '@/utils/zkProof'

// MongoDB connection
let client
let db

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME)
  }
  return db
}

// In-memory nonce storage (use Redis in production)
const nonceStore = new Map()

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// Generate random nonce
function generateNonce() {
  return crypto.randomBytes(16).toString('hex')
}

// Verify JWT token
function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided')
  }
  const token = authHeader.substring(7)
  return jwt.verify(token, process.env.JWT_SECRET)
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// Route handler function
async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    const db = await connectToMongo()

    // Health check - GET /api/health
    if (route === '/health' && method === 'GET') {
      return handleCORS(NextResponse.json({ 
        status: 'ok', 
        timestamp: Date.now(),
        service: 'Wallet2FA Backend'
      }))
    }

    // Root endpoint
    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({ 
        message: "Wallet2FA API",
        version: "1.0.0",
        endpoints: [
          'POST /api/auth/nonce',
          'POST /api/auth/verify',
          'GET /api/user/profile',
          'GET /api/health'
        ]
      }))
    }

    // Generate nonce - POST /api/auth/nonce
    if (route === '/auth/nonce' && method === 'POST') {
      const body = await request.json()
      const { address } = body

      if (!address) {
        return handleCORS(NextResponse.json(
          { error: "Address is required" }, 
          { status: 400 }
        ))
      }

      const nonce = generateNonce()
      const timestamp = Date.now()

      // Store nonce with 5-minute expiration
      nonceStore.set(address.toLowerCase(), { nonce, timestamp })

      // Auto-delete after 5 minutes
      setTimeout(() => {
        nonceStore.delete(address.toLowerCase())
      }, 5 * 60 * 1000)

      return handleCORS(NextResponse.json({ nonce }))
    }

    // Verify signature - POST /api/auth/verify
    if (route === '/auth/verify' && method === 'POST') {
      const body = await request.json()
      const { message, signature, address } = body

      if (!message || !signature || !address) {
        return handleCORS(NextResponse.json(
          { error: "Message, signature, and address are required" }, 
          { status: 400 }
        ))
      }

      try {
        // Parse SIWE message
        const siweMessage = new SiweMessage(message)

        // Verify signature
        const fields = await siweMessage.verify({ signature })

        // Check nonce
        const storedData = nonceStore.get(address.toLowerCase())
        if (!storedData || storedData.nonce !== siweMessage.nonce) {
          return handleCORS(NextResponse.json(
            { success: false, message: "Invalid or expired nonce" }, 
            { status: 401 }
          ))
        }

        // Delete used nonce
        nonceStore.delete(address.toLowerCase())

        // Generate JWT token (24 hour expiration)
        const token = jwt.sign(
          { address: address.toLowerCase(), verified: true },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        )

        // Generate ZK proof
        const zkProof = ZKAuthProof.generateAuthProof(
          address,
          Date.now(),
          'wallet2fa'
        )

        // Store authentication in database
        await db.collection('authentications').insertOne({
          id: uuidv4(),
          address: address.toLowerCase(),
          timestamp: new Date(),
          zkProof: zkProof,
          verified: true
        })

        return handleCORS(NextResponse.json({
          success: true,
          token,
          address: address.toLowerCase(),
          zkProofHash: {
            commitment: zkProof.commitment,
            nullifier: zkProof.nullifier,
            type: zkProof.type
          },
          message: "Authentication successful"
        }))

      } catch (error) {
        console.error('Verification error:', error)
        return handleCORS(NextResponse.json(
          { success: false, message: "Signature verification failed", error: error.message }, 
          { status: 401 }
        ))
      }
    }

    // Get user profile (protected route) - GET /api/user/profile
    if (route === '/user/profile' && method === 'GET') {
      try {
        const authHeader = request.headers.get('Authorization')
        const decoded = verifyToken(authHeader)

        // Get user's authentication history
        const authHistory = await db.collection('authentications')
          .find({ address: decoded.address })
          .sort({ timestamp: -1 })
          .limit(10)
          .toArray()

        return handleCORS(NextResponse.json({
          address: decoded.address,
          authenticated: true,
          totalLogins: authHistory.length,
          lastLogin: authHistory[0]?.timestamp,
          recentLogins: authHistory.map(({ _id, ...rest }) => rest)
        }))

      } catch (error) {
        return handleCORS(NextResponse.json(
          { error: "Unauthorized", message: error.message }, 
          { status: 401 }
        ))
      }
    }

    // Route not found
    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` }, 
      { status: 404 }
    ))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json(
      { error: "Internal server error", message: error.message }, 
      { status: 500 }
    ))
  }
}

// Export all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute