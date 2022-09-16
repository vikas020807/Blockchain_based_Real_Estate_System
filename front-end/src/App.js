import React, {useState, useEffect} from 'react';
import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import emblem from './images/emblem.svg';
import Web3 from 'web3';
import detectEtherumProvider from '@metamask/detect-provider';
import {loadContract} from './utils/loadContract';
import SuperAdmin from './components/SuperAdmin';
import Admin from './components/Admin';
import UserProfile from './components/UserProfile';
import Typed from 'react-typed'

function App() {

  const [web3Api, setWeb3Api] = useState({
    provider: null,
    web3: null,
    contract: null
    })

  const [account, setAccount] = useState(null);
  let navigate = useNavigate();


  const connectToEthereum = async () =>{

    const provider = await detectEtherumProvider();  
    const contract = await loadContract('Registry', provider);
    
    if(provider){              // provider = metamask detected.
        console.log("provider:",provider);
        await provider.request({method:'eth_requestAccounts'}); // calling this method trigger a user interface(metamask) 
                                                            // that allow user to approve/reject account access for a dapp.      
        setWeb3Api({
            web3: new Web3(provider),
            provider,
            contract
        })
    }
    else{
        alert('😔Please install metamask!');  // metamask not detected.
    }


}

useEffect(() => {
    const getAccount = async () =>{
      const {web3, contract} = web3Api;  
      const accounts = await web3.eth.getAccounts();  // returns the list of accounts you can access.

      setAccount(accounts[0]);

    }
    web3Api.web3 && getAccount();
}, [web3Api]);


useEffect(() =>{
    
    const checkAccount = async () =>{
        const {web3, contract} = web3Api; 
        const superAdmin = await contract.superAdmin();
        console.log(account);
        if(account === superAdmin){
            navigate('/superadmin');
        }
        else if(await contract.isAdmin({from: account})){
            navigate('/admin');
        }
        else{
            navigate('./userprofile')
        }
        
    }
    account && checkAccount();
}, [web3Api, account])

// const animation = async ()=>{
//   var content = 'Connect, View, Transfer, Buy, Sell, Land, all at one place.';

//   var ele = '<span>' + content.split('').join('</span><span>') + '</span>';
  
  
//   (ele).hide().appendTo('welcome-p').each(function (i) {
//       (this).delay(100 * i).css({
//           display: 'inline',
//           opacity: 0
//       }).animate({
//           opacity: 1
//       }, 100);
//   });
// }
  return (
    <Routes>

      <Route path='/superadmin' element={<SuperAdmin myWeb3Api={web3Api} account={account} />} />
      <Route path='/admin/*' element={<Admin myWeb3Api={web3Api} account={account} />} />
      <Route path='/userprofile/*' element={<UserProfile myWeb3Api={web3Api} account={account} />} />
      <Route path='/' element= 
      {
      <div className="App">
          <div className='container mainDiv'>
                <div className='landingPage-heading-div'>
                    <img src={emblem} alt="emblem" className="emblem-" />
                    <h1 className='title'>BlockState<h6>Blockchain Based Real Estate</h6></h1>
                </div>

                <div className='welcome-box'>
                  <p className='welcome-p'>
                    <Typed
          strings={[
            "Connect, View, Transfer,",
            "Buy, Sell Land,",
            "all at one place."
          ]}
          typeSpeed={100}
          backSpeed={10}
          loop
        /></p>
                </div>
                <div className='button-container-div'>  
                  <button className='landingPage-btn' onClick={connectToEthereum}>Connect Wallet</button>
                </div>           
            </div>
        </div>
      }/>
    </Routes>
  );
}

export default App;
