const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {

    let buyer, seller, inspector, lender
    let realEstateNFTInstance, escrowInstance

    beforeEach(async () => {
        const signers = await ethers.getSigners() //vraća signer, ne address
        buyer = signers[0]
        seller = signers[1]
        inspector = signers[2]
        lender = signers[3]

        //Deployanje
        const RealEstateNFT = await ethers.getContractFactory("RealEstateNFT")
        realEstateNFTInstance = await RealEstateNFT.deploy();

        //Mintanje
        let transaction = await realEstateNFTInstance.connect(seller).mint("test")
        await transaction.wait();

        const Escrow = await ethers.getContractFactory("Escrow")
        escrowInstance = await Escrow.deploy(realEstateNFTInstance.address, seller.address, inspector.address, lender.address)

        //Approve property
        transaction = await realEstateNFTInstance.connect(seller).approve(escrowInstance.address, 1)
        await transaction.wait()

        //List property
        transaction = await escrowInstance.connect(seller).list(1, buyer.address, tokens(10), tokens(5))
        await transaction.wait()
    })

    describe("Deployment", () => {

        it("returns NFT address", async () => {
            const result = await escrowInstance.nftAddress();
            expect(result).to.be.equal(realEstateNFTInstance.address)
        })

        it("returns seller address", async () => {

            const result = await escrowInstance.seller();
            expect(result).to.be.equal(seller.address)
        })

        it("returns inspector address", async () => {
            const result = await escrowInstance.inspector();
            expect(result).to.be.equal(inspector.address)
        })

        it("returns lender address", async () => {
            const result = await escrowInstance.lender();
            expect(result).to.be.equal(lender.address)
        })
    })

    describe("Listing", () => {

        it("updates as listed", async () => {
            expect(await escrowInstance.isListed(1)).to.be.equal(true)
        })

        it("updates ownership", async () => {
            //promjeni vlasništvo NFT-a od sellera na escrow contract
            expect(await realEstateNFTInstance.ownerOf(1)).to.be.equal(escrowInstance.address)
        })

        it("updates buyer", async () => {
            expect(await escrowInstance.buyer(1)).to.be.equal(buyer.address)
        })

        it("updates ownership", async () => {
            // vlasništvo NFT-a od sellera na escrow contract
            expect(await escrowInstance.purchasePrice(1)).to.be.equal(tokens(10))
        })

        it("returns escrow amount", async () => {
            expect(await escrowInstance.escrowAmount(1)).to.be.equal(tokens(5))
        })
    })

    describe("Listing", () => {

    })

    describe("Deposits", () => {
        it("Updates contract balance", async() => {
            const transaction = await escrowInstance.connect(buyer).depositEarnest(1, {value: tokens(5)})
            await transaction.wait()

            const result = await escrowInstance.getBalance()
            expect(result).to.be.equal(tokens(5))
        })
    })

    describe("Inspection", () => {
        it("Updates inspection status", async() => {
            const transaction = await escrowInstance.connect(inspector).updateInspectionStatus(1, true)
            await transaction.wait()

            const result = await escrowInstance.inspectionPassed(1)
            expect(result).to.be.equal(true)
        })
    })

    describe("Approval", () => {
        it("Updates approval status", async() => {
            let transaction = await escrowInstance.connect(buyer).approveSale(1)
            await transaction.wait()

            transaction = await escrowInstance.connect(seller).approveSale(1)
            await transaction.wait()

            transaction = await escrowInstance.connect(lender).approveSale(1)
            await transaction.wait()

            expect(await escrowInstance.approval(1, buyer.address)).to.be.equal(true)
            expect(await escrowInstance.approval(1, seller.address)).to.be.equal(true)
            expect(await escrowInstance.approval(1, lender.address)).to.be.equal(true)
        })
    })

    describe("Sale", async () => {

        beforeEach(async() => {
            let transaction = await escrowInstance.connect(buyer).depositEarnest(1, {value:tokens(5)})
            await transaction.wait()

            transaction = await escrowInstance.connect(inspector).updateInspectionStatus(1, true)
            await transaction.wait()

            transaction = await escrowInstance.connect(buyer).approveSale(1)
            await transaction.wait()

            transaction = await escrowInstance.connect(seller).approveSale(1)
            await transaction.wait()

            transaction = await escrowInstance.connect(lender).approveSale(1)
            await transaction.wait()

            await lender.sendTransaction({to: escrowInstance.address, value: tokens(5)})

            transaction = await escrowInstance.connect(seller).finalizeSale(1)
            await transaction.wait()

        })

        it("Updates ownership", async() => {
            expect(await realEstateNFTInstance.ownerOf(1)).to.be.equal(buyer.address)
        })

        it("Updates balance", async() => {
            expect(await escrowInstance.getBalance()).to.be.equal(0)
        })
        
    })





})
