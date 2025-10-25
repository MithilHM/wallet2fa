import '@nomicfoundation/hardhat-ethers';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

export default {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    sepolia: {
      type: 'http',
      url: process.env.RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || '',
  },
};
