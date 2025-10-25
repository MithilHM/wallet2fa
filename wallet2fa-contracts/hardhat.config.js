import '@nomicfoundation/hardhat-ethers';
import '@nomicfoundation/hardhat-verify';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const config = {
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
      url: process.env.RPC_URL || '',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || '',
  },
  sourcify: {
    enabled: false,
  },
};

export default config;
