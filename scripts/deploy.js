const { ethers } = require("hardhat");

async function main() {
    console.log("Deploying MyToken contract...");
    
    // Contract factory get karo
    const MyToken = await ethers.getContractFactory("MyToken");
    
    // Contract deploy karo with initial supply (1 million tokens)
    const initialSupply = 1000000; // 1 million tokens
    const myToken = await MyToken.deploy(initialSupply);
    
    await myToken.deployed();
    
    console.log("MyToken deployed to:", myToken.address);
    console.log("Transaction hash:", myToken.deployTransaction.hash);
    
    // Contract details save karo
    const contractInfo = {
        address: myToken.address,
        abi: MyToken.interface.format('json'),
        network: "sepolia",
        deployedAt: new Date().toISOString()
    };
    
    console.log("Contract deployed successfully!");
    console.log("Add this address to your .env file:");
    console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${myToken.address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });