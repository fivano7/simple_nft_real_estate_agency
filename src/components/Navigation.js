import logo from '../assets/logo.png';

//function Navigation({ account, setAccount }) {
const Navigation = ({ account, setAccount }) => {

    const connectHandler = async () => {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        setAccount(accounts[0]);
    }

    return (
        <nav>
            <ul className='nav__links'>
            </ul>

            <div className='nav__brand'>
                <img src={logo} alt="Logo" />
                <h1>NFT Real Estates</h1>
            </div>

            {account ? (
                <button type="button" className='nav__connect'>
                    {account.slice(0, 6) + "..." + account.slice(38, 42)}
                </button>
            ) : (
                <button
                    type='button'
                    className='nav__connect'
                    // ako account nije spojen kada kliknemo connect on zove connectHandler koji loada account, sprema ga u App.js
                    // u component state gdje je useState koji će onda opet taj account proslijediti u Navigation componentu i prikazat će se
                    onClick={connectHandler} 
                >
                    Connect
                </button>
            )}
        </nav>
    )
}

export default Navigation;
