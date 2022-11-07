# Simple_nft_real_estate_agency
Simple real estate agency website with NFTs listed as properties made using react, solidity, hardhat, and ethers.js. Idea is to simulate the selling of the property using 4 roles with 4 different addresses -> buyer, seller, inspector, and lender for the loan. 

## How to use
- Connect to the dapp with metamask with the account that is first in the hardhat list, choose a property, and press "Buy". When you press "Buy" you give earnest which is 50% of the total price
- Connect to the dapp with metamask with the account that is third in the hardhat list, it represents the Inpection of the property and press "Approve inspection on selected property", it will allow the property to be sold because it "passed inspection"
- Connect to the dapp with metamask with the account that is fourth in the hardhat list, it represents the lender of the remaining 50% of the total price, and press "Approve & lend" on the selected property, it will transfer the remaining 50% needed to the contract
- Connect to the dapp with metamask with the account that is second in the hardhat list, it represents the seller, and once you click "Approve & sell" with seller, property is then sold and ether is tranferred to the seller's wallet and NFT to buyers wallet
- If you did everything right once you refresh the page instead of the button saying "Buy" now it should say "Owned by {buyerAddress}"

## Technologies
- Javascript
- NodeJS
- Solidity version ^0.8.0
- Ethers.js
- Hardhat
- IPFS (Pinata.cloud)
- React
- Metamask
- OpenZeppelin
- Chai for testing

## Requirements for the first Setup
- NodeJS
- Hardhat
- Metamask

## Setting up
- Clone repository
- Install dependencies with "npm install"
- Run "npx hardhat node" in cmd
- Add Hardhat network to Metamask and the first 4 accounts from the list of accounts you get from "npx hardhat node"
- Run "npm run deploy" in another cmd
- Run "npm run start"
- Connect to the website using metamask and start using the dapp

## Running tests
- To run test in cmd run "npx run test"
