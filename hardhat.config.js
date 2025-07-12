require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
    solidity : {
        version : "0.8.19",
        settings : {
            optimizer : {
                enabled : true,
                runs : 200
            }
        }
    },
    networks : {
        sepolia : {
            url : process.env.SEPOLIA_RPC_URL,
            accounts : [process.env.PRIVATE_KEY],
            chainId : 11155111
        },
        localhost: {
            url : "https//127.0.0.1:8545"
        }
    },
    paths : {
        sources:"./contracts",
        tests: "./test",
        cache : "./cache",
        artifacts: "./artifacts"
    }
};