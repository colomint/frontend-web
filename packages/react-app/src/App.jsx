import "antd/dist/antd.css";
import {
  useBalance,
  useContractLoader,
  useContractReader,
  useGasPrice,
  useOnBlock,
  useUserProviderAndSigner,
} from "eth-hooks";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import React, { useCallback, useEffect, useState } from "react";
import { Switch, useLocation } from "react-router-dom";
import "./App.css";
import {
  Account,
  NetworkSwitch,
} from "./components";
import { NETWORKS, ALCHEMY_KEY } from "./constants";
import externalContracts from "./contracts/external_contracts";
// contracts
import deployedContracts from "./contracts/hardhat_contracts.json";
import { Transactor, Web3ModalSetup } from "./helpers";
import { Lottery } from "./views";
import { useStaticJsonRPC } from "./hooks";


import ColorsNFT from "./contracts/ColorsNFT.json";
import ColorsModifiers from "./contracts/ColorModifiers.json";
import { Contract as ContractEthers } from "@ethersproject/contracts";
import { useEthers, useContractFunction, DAppProvider, Rinkeby } from "@usedapp/core"
import { constants, utils } from "ethers"



////

const { ethers } = require("ethers");

/// 📡 What chain are your contracts deployed to?
const initialNetwork = NETWORKS.rinkeby; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 😬 Sorry for all the console logging
const DEBUG = true;
const NETWORKCHECK = true;
const USE_BURNER_WALLET = true; // toggle burner wallet feature
const USE_NETWORK_SELECTOR = false;

const web3Modal = Web3ModalSetup();


// 🛰 providers
const providers = [
  "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
  `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
  "https://rpc.scaffoldeth.io:48544",
];

function App(props) {
  // specify all the chains your app is available on. Eg: ['localhost', 'mainnet', ...otherNetworks ]
  // reference './constants.js' for other networks
  const networkOptions = [initialNetwork.name, "rinkeby", "kovanOptimism"];

  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();
  const [selectedNetwork, setSelectedNetwork] = useState(networkOptions[0]);
  const location = useLocation();

  const targetNetwork = NETWORKS[selectedNetwork];

  // 🔭 block explorer URL
  const blockExplorer = targetNetwork.blockExplorer;

  // load all your providers
  const localProvider = useStaticJsonRPC([
    process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : targetNetwork.rpcUrl,
  ]);
  const mainnetProvider = useStaticJsonRPC(providers);


  // 🛰 providers

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProviderAndSigner = useUserProviderAndSigner(injectedProvider, localProvider, USE_BURNER_WALLET);
  const userSigner = userProviderAndSigner.signer;



  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
      }
    }
    getAddress();
  }, [userSigner]);



  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId =
    userSigner && userSigner.provider && userSigner.provider._network && userSigner.provider._network.chainId;

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userSigner, gasPrice);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);

  // const contractConfig = useContractConfig();

  const contractConfig = { deployedContracts: deployedContracts || {}, externalContracts: externalContracts || {} };


  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider, contractConfig);

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:
  const writeContracts = useContractLoader(userSigner, contractConfig, localChainId);

  // EXTERNAL CONTRACT EXAMPLE:
  //
  // If you want to bring in the mainnet DAI contract it would look like:
  // const mainnetContracts = useContractLoader(mainnetProvider, contractConfig);

  // If you want to call a function on a new block
  useOnBlock(mainnetProvider, () => {
    console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`);
  });


  // // keep track of a variable from the contract in the local React state:
  // const purpose = useContractReader(readContracts, "YourContract", "randomHash");
  // // keep track of white paint
  // const whitePaint = useContractReader(readContracts, "ColorsNFT", "balanceOf");
  // console.log("whitePaint", whitePaint);
  // // dark paint
  // const darkPaint = useContractReader(readContracts, "ColorModifiers", "balanceOf", ["0x990Ae48efDD87Ba85dEf8fb6633d0B7155539720", 0]);

  // const darkPaint = useContractReader(readContracts, "ColorModifiers", "getBalanceDarkPaint", [
  //   address,
  // ]);


  // const whitePaint = useContractReader(readContracts, "ColorModifiers", "getBalanceWhitePaint", [address]);


  // const listOfTokensPerUser = useContractReader(readContracts, "ColorsNFT", "getColorsByOwner", [address,]);

  // const colorTokenList = useContractReader(readContracts, "ColorsNFT", "_colorTokenList");

  // console.log(colorTokenList);
  // const userTables = 0;

  ///// 
  const colorModifiersAddress = useContractReader(readContracts, "Jackpot", "colorModifiersAddress");



  const colorsNFTAddress = useContractReader(readContracts, "Jackpot", "colorsNFTAddress");
  const ColorsModifiersABI = ColorsModifiers.abi;


  const ColorsModifiersInterface = new utils.Interface(ColorsModifiersABI);
  let colorModifiersContract
  if (colorModifiersAddress) {
    colorModifiersContract = new ContractEthers(colorModifiersAddress, ColorsModifiersInterface, userSigner)
  }

  const ColorsNFTABI = ColorsNFT.abi;

  const ColorsNFTInterface = new utils.Interface(ColorsNFTABI);
  let colorNFTContract
  if (colorsNFTAddress) {
    colorNFTContract = new ContractEthers(colorsNFTAddress, ColorsNFTInterface, userSigner);
  }

  const jackPotBalance = useContractReader(readContracts, "Jackpot", "getBalance")

  console.log(colorsNFTAddress, colorModifiersAddress);
  console.log(jackPotBalance);








  // const darkPaint = readContracts["ColorModifiers"]?.balanceOf("0x990Ae48efDD87Ba85dEf8fb6633d0B7155539720", 0);


  // const whitePaint = readContracts["ColorModifiers"]?.balanceOf("0x990Ae48efDD87Ba85dEf8fb6633d0B7155539720", 1);


  /*
  const addressFromENS = useResolveName(mainnetProvider, "austingriffith.eth");
  console.log("🏷 Resolved austingriffith.eth as:",addressFromENS)
  */


  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", chainId => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();

    });
    // eslint-disable-next-line
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  // const faucetAvailable = localProvider && localProvider.connection && targetNetwork.name.indexOf("local") !== -1;

  /// userdapp 


  const { activateBrowserWallet, deactivate, account } = useEthers()
  ///
  console.log(account, "account");


  useEffect(() => {
    if (userSigner) {
      activateBrowserWallet();
    }
  }, [activateBrowserWallet, userSigner]);


  return (

    <div className="App">
      <Switch>
        {/* <Route path="/exampleui">
          <BuyAndModifyColor
            address={address}
            userSigner={userSigner}
            mainnetProvider={mainnetProvider}
            localProvider={localProvider}
            yourLocalBalance={yourLocalBalance}
            price={price}
            tx={tx}
            writeContracts={writeContracts}
            readContracts={readContracts}
            purpose={purpose}
            whitePaint={whitePaint}
            darkPaint={darkPaint}
            userTables={userTables}
            listOfTokensPerUser={listOfTokensPerUser}
            colorTokenList={colorTokenList}
            colorModifiersContract={colorModifiersContract}
            colorModifiersAddress={colorModifiersAddress}
            colorNFTContract={colorNFTContract}
            colorsNFTAddress={colorsNFTAddress}
          />
        </Route>  */}
      </Switch>


      {!(web3Modal.cachedProvider) ?
        <div style={{ border: "1px solid #cccccc", padding: 16, margin: "auto", height: "100vh", backgroundBlendMode: "gradient", background: 'url("Backgroud.jpeg")', backgroundRepeat: "no-repeat", backgroundSize: "cover", opacity: 0.6 }}>
          <div style={{ margin: 40 }}>
            <div style={{ color: "black", fontSize: "60px" }}>Welcome to ColoMint</div>
            <div style={{ color: "blue", fontSize: "36px" }}>A JackPot that will always have a winner</div>
            <h4 style={{ color: "White", fontSize: "64px" }}>MinT it 2 Win iT</h4>
            {/* <div style={{padding: 10 }}> */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              {USE_NETWORK_SELECTOR && (
                <div style={{ marginRight: 20 }}>
                  <NetworkSwitch
                    networkOptions={networkOptions}
                    selectedNetwork={selectedNetwork}
                    setSelectedNetwork={setSelectedNetwork}
                  />
                </div>
              )}
              <Account
                useBurner={USE_BURNER_WALLET}
                address={address}
                localProvider={localProvider}
                userSigner={userSigner}
                mainnetProvider={mainnetProvider}
                price={price}
                web3Modal={web3Modal}
                loadWeb3Modal={loadWeb3Modal}
                logoutOfWeb3Modal={logoutOfWeb3Modal}
                blockExplorer={blockExplorer}
              />
            </div>
          </div>
        </div>
        :
        <Lottery
          web3Modal={web3Modal}
          address={address}
          userSigner={userSigner}
          loadWeb3Modal={loadWeb3Modal}
          mainnetProvider={mainnetProvider}
          localProvider={localProvider}
          yourLocalBalance={yourLocalBalance}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          price={price}
          tx={tx}
          writeContracts={writeContracts}
          readContracts={readContracts}
          jackPotBalance={jackPotBalance}
          colorModifiersContract={colorModifiersContract}
          colorModifiersAddress={colorModifiersAddress}
          colorNFTContract={colorNFTContract}
          colorsNFTAddress={colorsNFTAddress}
        />
      }


    </div>
  );
}

export default App;
