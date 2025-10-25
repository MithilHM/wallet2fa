# 🔐 Wallet2FA - Decentralized Two-Factor Authentication

> **Hackathon Submission**  
> URL: https://wallet2fa.vercel.app
> Demo: https://www.youtube.com/watch?v=Ctlg-MLn1ZE
> Smart Contract: [`0xbd1A9b9E574D57162Ecc499e3BeA28144273d4F9`](https://sepolia.etherscan.io/address/0xbd1A9b9E574D57162Ecc499e3BeA28144273d4F9)

---

## 💡 What is Wallet2FA?

**Wallet2FA** is a fully decentralized, production-ready alternative to SMS/email 2FA. It uses Ethereum wallet signatures (EIP-4361 / SIWE) and logs authentication on-chain, making 2FA truly secure and privacy-preserving. Along with secure account access, Wallet2FA supports zero-knowledge authentication, NFT reward gamification, and a modern UI/UX.

---

## 🚀 Main Features

- **Web3 Wallet 2FA**: Authenticate using MetaMask, WalletConnect, or any EVM-compatible wallet.
- **SIWE Protocol (EIP-4361)**: Industry-standard, phishing-proof authentication messages.
- **On-Chain Audit Trail**: Records authentication events on the Sepolia Ethereum testnet.
- **Mock Zero-Knowledge Proofs**: Ready to extend for private authentication (zk-SNARK architecture).
- **Gamified Security**: NFT rewards for achieving authentication milestones (e.g. every 10 logins).
- **JWT Session Tokens**: Standard web tokens for accessing protected API routes.
- **Production-Ready Full Stack**: Next.js 14 frontend, scalable REST API backend.
- **User-Centric UI**: Built with RainbowKit and TailwindCSS; fully responsive, light/dark mode.

---

## 🛠 Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, TailwindCSS, RainbowKit, Wagmi v2, Viem
- **Backend:** Next.js API Routes (Node.js), SIWE, JWT, MongoDB Atlas
- **Smart Contracts:** Solidity 0.8.20, Hardhat
- **Blockchain:** Ethereum Sepolia Testnet
- **On-Chain Explorer:** [Etherscan Link](https://sepolia.etherscan.io/address/0xbd1A9b9E574D57162Ecc499e3BeA28144273d4F9)
- **Deployment:** Vercel

---

## ⚡️ Quickstart - Run Locally

### 1. **Clone the repo**

git clone https://github.com/MithilHM/Wallet-2-Factor-Authentication
cd Wallet-2-Factor-Authentication


### 2. **Install dependencies**

npm install
cd wallet2fa-contracts
npm install
cd ..


### 3. **Set environment variables**

Copy and fill in your API keys and secrets (see [sample.env](.env.example)):

MongoDB (free at MongoDB Atlas)
MONGO_URL=your_mongodb_connection_uri
DB_NAME=wallet2fa

JWT secret
JWT_SECRET=your_jwt_secret

Web3
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_CONTRACT_ADDRESS=0xbd1A9b9E574D57162Ecc499e3BeA28144273d4F9
NEXT_PUBLIC_WALLETCONNECT_ID=your_walletconnect_id

Blockchain deployment
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_alchemy_api_key
PRIVATE_KEY=your_sepolia_private_key
CHAIN_ID=11155111


### 4. **Run the development server**

npm run dev


Then open [http://localhost:3000](http://localhost:3000).

---

## ✍️ How to Contribute

- **Fork this repository**
- **Create a new branch:**  
  `git checkout -b feature/your-cool-feature`
- **Commit and push:**  
  `git commit -m "Add amazing feature"`  
  `git push origin feature/your-cool-feature`
- **Open a Pull Request**  
- **Describe your changes clearly**

**We welcome code, docs, UI ideas, and bug reports! 🔥**

---

## 🙏 Credits

- [RainbowKit](https://rainbowkit.com/) for wallet UX
- [Wagmi](https://wagmi.sh/) for Web3 React hooks
- [SIWE](https://login.xyz/) for open authentication standards
- [Hardhat](https://hardhat.org/) for Ethereum developer tooling
- [OpenZeppelin](https://openzeppelin.com/) for secure contract patterns
- [Vercel](https://vercel.com/) for deployment

---

## 📄 License

MIT License — free for personal, research, and hackathon use.

---

