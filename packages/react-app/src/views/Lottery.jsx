import { Button, Modal } from "antd";
import React, { useState } from "react";
// import { utils } from "ethers";
// import { SyncOutlined } from "@ant-design/icons";

import { Account, Address, Balance, TokenBalance } from "../components";

export default function Lottery({
  purpose,
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  loadWeb3Modal,
  logoutOfWeb3Modal,
  userSigner,
  web3Modal,
  price,
  tx,
  readContracts,
  writeContracts,
}) {
//   const [newPurpose, setNewPurpose] = useState("loading...");

const [showModal, setShowModal] = useState(false);

const modalHandle = () => {
    setShowModal(true);
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  return (
    <div style={{ border: "1px solid #cccccc", padding: 16, margin: "auto", height: "100vh", backgroundBlendMode:"gradient", background:'url("Backgroud.jpeg")',backgroundRepeat:"no-repeat", backgroundSize:"cover",}}>
         <div style={{ textAlign: "right"}}>
         <Account
        // useBurner={USE_BURNER_WALLET}
        address={address}
        localProvider={localProvider}
        userSigner={userSigner}
        mainnetProvider={mainnetProvider}
        price={price}
        web3Modal={web3Modal}
        loadWeb3Modal={loadWeb3Modal}
        logoutOfWeb3Modal={logoutOfWeb3Modal}
        // blockExplorer={blockExplorer}
      />
      </div>

      <section style={{ display: "flex", justifyContent: "space-around"}}>
            <div>
                <div>
                    <h1 style={{fontFamily: "monospace", fontSize: "34px"}}>ColoMint Jackpot</h1>

                    <h1 style={{fontFamily: "cursive", fontSize: "30px"}}>Today's Jackpot</h1>
                    {/* placeholder amount */}
                    <p style={{fontFamily: "fantasy", fontSize: "56px", marginBottom: "5px"}}>$25,000</p>

                    <h3 style={{fontFamily: "sans-serif", color: "white", fontSize: "20px"}}>Every Jackpot has a WINNER</h3>

                    <div style={{backgroundColor: "black", color: "yellow", height: "90px", borderRadius: "12px", padding: "5px", width: "70%", margin: "auto"}}>
                        {/* placeholder amount */}
                        <p>JOIN DRAW : #331 </p>

                    </div>  
                </div>
  
                <div style={{border: "1px solid grey", borderRadius: "10px", marginTop: "15px", padding: "12px", background: "#1918185c"}}>
               <h2>Connected Wallet: {address && <Address address={address} ensProvider={mainnetProvider} />} </h2>
               {/* <h2>MATIC Balance: <Balance address={address} provider={localProvider} price={price} /> </h2> */}
               <h2>MATIC Balance: <TokenBalance/> </h2>
               {/* get colomint balance */}
               <h2>ColoMint Balance:  </h2>
               {/* paint bought */}
               <h2>Black Paint:  </h2>
               {/* paint bought */}
               <h2>White Paint:  </h2>
            
               <Button onClick={modalHandle} style={{ width: "auto", backgroundColor: "#95a8cc", fontSize: "20px", height: "auto", boxShadow: "2px 4px" }}>
                   Play the game of painting your NFT
               </Button>
               </div>
              
          </div>

          <div style={{width: "300px", marginTop: "10px"}}>

          <img width="100%" height="200px" marginTop="10px" marginBottom="10px" src="" alt="" />

          <div style={{backgroundColor: "#bd99dc", marginTop: "16px", border: "1px solid #bd99dc", padding: "16px", borderRadius: "4px"}}>
              {/* placeholder cost */}
              <p style={{fontSize: "16px", textAlign: "left"}}>Cost:</p>
              {/* trigger minting */}
              <Button  style={{ width: "134px", backgroundColor: "#85cc85", fontSize: "20px", height: "auto", boxShadow:"2px 4px #3a553a9c", color: "black" }}  onClick={() => console.log("minting")}>
                   Mint
               </Button>
          </div>



            {/* get minted NFTS */}
            
          {/* <div style={{ color: "white",  width: "200px", height: "140px", borderRadius: "8px", margin: "5px 0", padding: "12px", background: "red"}}>
              NFT 1
          </div>

          <div style={{color: "white", width: "200px", height: "140px", borderRadius: "8px", margin: "5px 0", padding: "12px", background: "green"}}>
              NFT 2
          </div> */}

              
          </div>
      </section>


<Modal title="Paint you NFT" visible={showModal} onCancel={handleCancel}>

    contents...
</Modal>


  </div> 
  );
}