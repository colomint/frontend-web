import { Button, Modal } from "antd";
import React, { useState } from "react";
// import { utils } from "ethers";
// import { SyncOutlined } from "@ant-design/icons";

import { Account, Address, Balance, TokenBalance } from "../components";
import { useContractFunction, useCall } from "@usedapp/core";
import { ethers } from "ethers";
export default function Lottery({
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
  jackPotBalance,
  colorModifiersAddress,
  colorModifiersContract,
  colorNFTContract,
  colorsNFTAddress

}) {
  //   const [newPurpose, setNewPurpose] = useState("loading...");



  const { send: mintERC721Send } = useContractFunction(colorNFTContract, "mint")
  const { send: mintERC1155Send } = useContractFunction(colorModifiersContract, "mint", userSigner)

  // FOR using paint to modify nft colors
  const { send: safeTransferFromSend } = useContractFunction(colorModifiersContract, "safeTransferFrom", userSigner)


  function useTotalWhitePaint() {
    const { value, error } = useCall(colorModifiersAddress && {
      contract: colorModifiersContract,
      method: 'getBalanceWhitePaint',
      args: [address],
    }) ?? {}
    if (error) {
      console.error(error.message)
      return undefined
    }
    return value?.[0]
  }

  function useTotalDarkPaint() {
    const { value, error } = useCall(colorModifiersAddress && {
      contract: colorModifiersContract,
      method: 'getBalanceWhitePaint',
      args: [address],
    }) ?? {}
    if (error) {
      console.error(error.message)
      return undefined
    }
    return value?.[0]
  }


  const TotalWhitePaintInt = parseInt(useTotalWhitePaint()?._hex, 16)

  const TotalDarkPaintInt = parseInt(useTotalDarkPaint()?._hex, 16)


  const [showModal, setShowModal] = useState(false);

  const modalHandle = () => {
    setShowModal(true);
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  function getPaint() {
    return mintERC1155Send();
  }

  function mintERC721() {
    let valueInEther = ethers.utils.parseEther("" + 0.001);
    return mintERC721Send({ value: valueInEther });
  }


  return (
    <div style={{ border: "1px solid #cccccc", padding: 16, margin: "auto", height: "100vh", backgroundBlendMode: "gradient", background: 'url("Backgroud.jpeg")', backgroundRepeat: "no-repeat", backgroundSize: "cover", }}>
      <div style={{ textAlign: "right" }}>
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

      <section style={{ display: "flex", justifyContent: "space-around" }}>
        <div>
          <div>
            <h1 style={{ fontFamily: "monospace", fontSize: "34px" }}>ColoMint Jackpot</h1>

            <h1 style={{ fontFamily: "cursive", fontSize: "30px" }}>Today's Jackpot</h1>
            {/* placeholder amount */}
            <p style={{ fontFamily: "fantasy", fontSize: "56px", marginBottom: "5px" }}>

              <Balance
                balance={jackPotBalance}
                price={price}
              />

            </p>

            <h3 style={{ fontFamily: "sans-serif", color: "white", fontSize: "20px" }}>Every Jackpot has a WINNER</h3>

            <div style={{ backgroundColor: "black", color: "yellow", height: "90px", borderRadius: "12px", padding: "5px", width: "70%", margin: "auto" }}>
              {/* placeholder amount */}
              <p>JOIN DRAW : #331 </p>

            </div>
          </div>

          <div style={{ border: "1px solid grey", borderRadius: "10px", marginTop: "15px", padding: "12px", background: "#1918185c" }}>
            <h2>Connected Wallet: {address && <Address address={address} ensProvider={mainnetProvider} />} </h2>
            {/* <h2>MATIC Balance: <Balance address={address} provider={localProvider} price={price} /> </h2> */}

            {/* paint bought */}
            <h2>Black Paint:{TotalDarkPaintInt}  </h2>
            {/* paint bought */}
            <h2>White Paint: {TotalWhitePaintInt} </h2>

            <Button onClick={modalHandle} style={{ width: "auto", backgroundColor: "#95a8cc", fontSize: "20px", height: "auto", boxShadow: "2px 4px" }}>
              Play the game of painting your NFT
            </Button>
          </div>

        </div>

        <div style={{ width: "300px", marginTop: "10px" }}>

          <img width="100%" height="400px" marginTop="10px" marginBottom="10px" src="Frame 1.png" alt="ColoMint" />

          <div style={{ backgroundColor: "#bd99dc", marginTop: "16px", border: "1px solid #bd99dc", padding: "16px", borderRadius: "4px" }}>
            {/* placeholder cost */}
            <p style={{ fontSize: "16px", textAlign: "left" }}>Cost:</p>
            {/* trigger minting */}
            <Button style={{ width: "134px", backgroundColor: "#85cc85", fontSize: "20px", height: "auto", boxShadow: "2px 4px #3a553a9c", color: "black" }} onClick={mintERC721}>
              Mint
            </Button>
            <Button style={{ width: "134px", backgroundColor: "#85cc85", fontSize: "20px", height: "auto", boxShadow: "2px 4px #3a553a9c", color: "black" }} onClick={getPaint}>
              Get paint
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
