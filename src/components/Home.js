import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

import close from '../assets/close.png';

//1.) BUYER 
//2.) SELLER 
//3.) INSPECTOR 
//4.) LENDER
const Home = ({ home, provider, account, escrowInstance, togglePop }) => {

    const [hasBought, setHasBought] = useState(false)
    const [hasLended, setHasLended] = useState(false)
    const [hasInspected, setHasInspected] = useState(false)
    const [hasSold, setHasSold] = useState(false)

    const [buyer, setBuyer] = useState(null)
    const [lender, setLender] = useState(null)
    const [inspector, setInspector] = useState(null)
    const [seller, setSeller] = useState(null)
    const [owner, setOwner] = useState(null)

    const fetchDetails = async () => {
        //--Buyer
        const buyer = await escrowInstance.buyer(home.id)
        setBuyer(buyer)

        const hasBought = await escrowInstance.approval(home.id, buyer)
        setHasBought(hasBought)

        //--Seller
        const seller = await escrowInstance.seller()
        setSeller(seller)

        const hasSold = await escrowInstance.approval(home.id, seller)
        setHasSold(hasSold)

        //--Lender
        const lender = await escrowInstance.lender()
        setLender(lender)

        const hasLended = await escrowInstance.approval(home.id, seller)
        setHasLended(hasLended)

        //--Inspector
        const inspector = await escrowInstance.inspector()
        setInspector(inspector)

        const hasInspected = await escrowInstance.inspectionPassed(home.id)
        setHasInspected(hasInspected)
    }

    const fetchOwner = async () => {
        if (await escrowInstance.isListed(home.id)) return

        const owner = await escrowInstance.buyer(home.id)
        setOwner(owner)
    }

    const buyHandler = async () => {
        const escrowAmount = await escrowInstance.escrowAmount(home.id)
        const signer = await provider.getSigner() //account koji je spojen na metamask

        //Buyer deposita kaparu
        let transaction = await escrowInstance.connect(signer).depositEarnest(home.id, { value: escrowAmount })
        await transaction.wait()

        //Buyer approvea
        transaction = await escrowInstance.connect(signer).approveSale(home.id)
        await transaction.wait()

        setHasBought(true)
    }

    const inspectHandler = async () => {
        const signer = await provider.getSigner()

        //Inspector updates status
        const transaction = await escrowInstance.connect(signer).updateInspectionStatus(home.id, true)
        await transaction.wait();

        setHasInspected(true)
    }

    const lendHandler = async () => {
        const signer = await provider.getSigner()

        //Lender approvea
        const transaction = await escrowInstance.connect(signer).approveSale(home.id)
        await transaction.wait()

        //Lender šalje crypto na contract
        const purchasePrice = await escrowInstance.purchasePrice(home.id)
        const escrowAmount = await escrowInstance.escrowAmount(home.id);

        const lendAmount = (purchasePrice - escrowAmount);
        await signer.sendTransaction({ to: escrowInstance.address, value: lendAmount.toString(), gasLimit: 60000 })

        setHasLended(true)
    }

    const sellHandler = async () => {
        const signer = await provider.getSigner()

        //Seller approves
        const transaction = await escrowInstance.connect(signer).approveSale(home.id)
        await transaction.wait()

        //Seller finalizira prodaju
        transaction = await escrowInstance.connect(signer).finalizeSale(home.id)
        await transaction.wait()

        setHasSold(true)
    }

    useEffect(() => {
        fetchDetails()
        fetchOwner()
    }, [hasSold]) //ako se hasSold promjeni onda se također zovu ove funkcije iznad

    return (
        //klasa home napravi overlay sive boje
        <div className="home">
            <div className='home__details'>
                <div className='home__image'>
                    <img src={home.image} alt="home" />
                </div>
                <div className='home__overview'>
                    <h1>{home.name}</h1>
                    <p>
                        <strong>{home.attributes[2].value}</strong> bds |
                        <strong>{home.attributes[3].value}</strong> ba |
                        <strong>{home.attributes[4].value}</strong> sqft
                    </p>
                    <p>{home.address}</p>
                    <h2>{home.attributes[0].value} ETH</h2>

                    {owner ? (
                        <div className='home__owned'>
                            Owned by {owner.slice(0, 6) + "..." + owner.slice(38, 42)}
                        </div>

                    ) : (
                        <div>
                            {(account === inspector) ? (
                                <button className='home__buy' onClick={inspectHandler} disabled={hasInspected}>
                                    Approve Inspection
                                </button>
                            ) : (account === lender) ? (
                                <button className='home__buy' onClick={lendHandler} disabled={hasLended}>
                                    Approve & Lend
                                </button>
                            ) : (account === seller) ? (
                                <button className='home__buy' onClick={sellHandler} disabled={hasSold}>
                                    Approve & Sell
                                </button>
                            ) : (
                                <button className='home__buy' onClick={buyHandler} disabled={hasBought}>
                                    Buy
                                </button>
                            )}

                        </div>
                    )}

                    <hr />
                    <h2>Overview</h2>
                    <p>
                        {home.description}
                    </p>
                    <hr />
                    <h2>Facts and features</h2>
                    <ul>
                        {home.attributes.map((attribute, index) => (
                            <li key={index}><strong>{attribute.trait_type}</strong> : {attribute.value}</li>
                        ))}
                    </ul>
                </div>
                <button onClick={togglePop} className="home__close">
                    <img src={close} alt="Close" />
                </button>
            </div>
        </div >
    );
}

export default Home;
