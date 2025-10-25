import hre from 'hardhat';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('🚀 Deploying Wallet2FA contract...');

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log('📝 Deploying with account:', deployer.address);

  // Get balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log('💰 Account balance:', hre.ethers.formatEther(balance), 'ETH');

  // Deploy contract
  const Wallet2FA = await hre.ethers.getContractFactory('Wallet2FA');
  const wallet2fa = await Wallet2FA.deploy();

  await wallet2fa.waitForDeployment();

  const contractAddress = await wallet2fa.getAddress();
  console.log('✅ Wallet2FA deployed to:', contractAddress);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
  };

  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log('📄 Deployment info saved to deployments/' + hre.network.name + '.json');
  console.log('\n🔍 Verify with:');
  console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
