const hre = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {
  let buyer, seller, inspector, lender
  let realEstateNFTInstance, escrowInstance

  const signers = await ethers.getSigners() //vraća signer, ne address
  buyer = signers[0]
  seller = signers[1]
  inspector = signers[2]
  lender = signers[3]

  //Deployanje
  const RealEstateNFT = await ethers.getContractFactory("RealEstateNFT")
  realEstateNFTInstance = await RealEstateNFT.deploy();

  console.log(`Deployed RealEstateNFT Contract at: ${realEstateNFTInstance.address}`)
  console.log(`Minting 3 properties...`)

  //Mintanje
  for (let i = 1; i <= 3; i++) {
    const transaction = await realEstateNFTInstance.connect(seller).mint(`https://gateway.pinata.cloud/ipfs/QmScS36uHD4UGTQf6gdvUeRsdkCsV3389XWNKBnBrf9xcq/${i}.json`)
    await transaction.wait();
  }

  const Escrow = await ethers.getContractFactory("Escrow")
  escrowInstance = await Escrow.deploy(realEstateNFTInstance.address, seller.address, inspector.address, lender.address)
  await escrowInstance.deployed()

  console.log(`Deployed Escrow Contract at: ${escrowInstance.address}`)

  for (let i = 1; i <= 3; i++) {
    //Approve properties...
    let transaction = await realEstateNFTInstance.connect(seller).approve(escrowInstance.address, i)
    await transaction.wait()
  }

  //Listing properties u svrhu popunjavanja stranice kada tek dođemo na nju 

  transaction = await escrowInstance.connect(seller).list(1,buyer.address, tokens(20), tokens(10))
  await transaction.wait()

  transaction = await escrowInstance.connect(seller).list(2,buyer.address, tokens(40), tokens(20))
  await transaction.wait()

  transaction = await escrowInstance.connect(seller).list(3,buyer.address, tokens(100), tokens(50))
  await transaction.wait()

  console.log(`Finished!`)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
