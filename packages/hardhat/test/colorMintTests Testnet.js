const { ethers, waffle } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("Tests ColoMint", function () {
  let jackpotContract;
  let colorModifierAddress;
  let colorsNFTAddress;
  let colorNFTContract;
  let colorModifierContract;
  let deployer;
  let user2;
  let user3;
  let user4;
  let user5;

  before(async function () {
    const getAccounts = async function () {
      const accounts = [];
      let signers = [];
      signers = await ethers.getSigners();
      for (const signer of signers) {
        // eslint-disable-next-line no-await-in-loop
        accounts.push({ signer, address: await signer.getAddress() });
      } // populates the accounts array with addresses.
      return accounts;
    };

    // REFACTOR
    [deployer, user2, user3, user4, user5] = await getAccounts();



    await deployer.signer.sendTransaction({
      to: user2.address,
      value: ethers.utils.parseEther("0.005"), // Sends exactly 1.0 ether
    });


    await deployer.signer.sendTransaction({
      to: user3.address,
      value: ethers.utils.parseEther("0.005"), // Sends exactly 1.0 ether
    });



    await deployer.signer.sendTransaction({
      to: user4.address,
      value: ethers.utils.parseEther("0.005"), // Sends exactly 1.0 ether
    });



    await deployer.signer.sendTransaction({
      to: user5.address,
      value: ethers.utils.parseEther("0.005"), // Sends exactly 1.0 ether
    });




  });

  before((done) => {
    setTimeout(done, 2000);


  });

  describe("Standard path", function () {
    it("Should deploy Jackpot", async function () {


      const jackpotFactory = await ethers.getContractFactory("Jackpot");

      jackpotContract = await jackpotFactory.deploy();

      const linkTokenFactory = await ethers.getContractFactory("LinkToken");

      linkTokenContract = await linkTokenFactory.attach("0x01BE23585060835E02B77ef475b0Cc51aA1e0709");

      await linkTokenContract.transfer(jackpotContract.address, ethers.utils.parseEther("0.1"))
    });

    describe("getContracts()", function () {
      it("Should make two contracts", async function () {
        const count = [];

        colorModifierAddress = await jackpotContract.colorModifiersAddress();
        count.push(colorModifierAddress);

        colorsNFTAddress = await jackpotContract.colorsNFTAddress();
        count.push(colorsNFTAddress);

        expect(count.length).to.equal(2);
      });

      it("Should start the lottery after being deployed", async function () {

        const lotteryStatus = 0; // OPEN

        expect(await jackpotContract.lottery_state()).to.equal(lotteryStatus);
      });

      it("Should send money from ERC721 and ERC1155 to Jackpot, should be empty after distribution", async function () {


        const colorsNFTCFactory = await ethers.getContractFactory("ColorsNFT");
        const colorModifiersFactory = await ethers.getContractFactory("ColorModifiers");

        colorNFTContract = await colorsNFTCFactory.attach(colorsNFTAddress);
        colorModifierContract = await colorModifiersFactory.attach(colorModifierAddress);

        const buyERC721 = await colorNFTContract.mint({
          value: ethers.utils.parseEther("0.001")
        })

        await buyERC721.wait(1);


        const buyERC1155 = await colorModifierContract.mintPayable(0, 1, {
          value: ethers.utils.parseEther("0.00001")
        })

        await buyERC1155.wait(1);

        const jackPotBalancePreDistribution = await jackpotContract.provider.getBalance(jackpotContract.address);
        console.log(jackPotBalancePreDistribution, "jackPotBalancePreDistribution");
        const txDistributeWinnings = await jackpotContract.distributeWinnings(1)

        await txDistributeWinnings.wait(1);


        const jackPotBalancePostDistribution = await jackpotContract.provider.getBalance(jackpotContract.address);


        expect(parseInt(jackPotBalancePreDistribution['_hex'], 16)).to.equal(ethers.utils.parseEther("0.00101"));
        expect(parseInt(jackPotBalancePostDistribution['_hex'], 16)).to.equal(0);

      });


      it("Should restart lottery, end the lottery and have a winner", async function () {

        const colorsNFTCFactory = await ethers.getContractFactory("ColorsNFT");
        const colorModifiersFactory = await ethers.getContractFactory("ColorModifiers");

        //restart lottery 

        const tx1 = await jackpotContract.restartLottery();

        await tx1.wait(1);

        colorModifierAddress = await jackpotContract.colorModifiersAddress();

        colorsNFTAddress = await jackpotContract.colorsNFTAddress();

        colorNFTContract = await colorsNFTCFactory.attach(colorsNFTAddress);
        colorModifierContract = await colorModifiersFactory.attach(colorModifierAddress);

        const tx2 = await colorNFTContract.connect(user2.signer).mint({
          value: ethers.utils.parseEther("0.001")
        })

        await tx2.wait(1);

        const tx3 = await colorNFTContract.connect(user3.signer).mint({
          value: ethers.utils.parseEther("0.001")
        })

        await tx3.wait(1);

        const balanceUser2Pre = await ethers.provider.getBalance(user2.address);
        const balanceUser3Pre = await ethers.provider.getBalance(user3.address);


        // await network.provider.send("evm_increaseTime", [3600])
        const tx4 = await jackpotContract.endLottery();

        await tx4.wait(1);


        // wait for chainlink node to send response
        await new Promise(r => setTimeout(r, 200000));


        const balanceUser2Post = await ethers.provider.getBalance(user2.address);
        const balanceUser3Post = await ethers.provider.getBalance(user3.address);

        const winningsUser2 = ethers.utils.formatEther(
          balanceUser2Post
            .sub(balanceUser2Pre)
        )


        const winningsUser3 = ethers.utils.formatEther(
          balanceUser3Post
            .sub(balanceUser3Pre)
        )




        console.log(winningsUser3, winningsUser2)

        expect(winningsUser2).to.not.equal(winningsUser3)


      });

      it("User 3 should be the winner exact value ", async function () {

        const tx1 = await colorNFTContract.connect(user2.signer).mint({
          value: ethers.utils.parseEther("0.001")
        })

        await tx1.wait(1);


        const tx2 = await colorNFTContract.connect(user2.signer).mint({
          value: ethers.utils.parseEther("0.001")
        })

        await tx2.wait(1);

        const winnerTx = await colorNFTContract.connect(user3.signer).mintInternal(150)

        await winnerTx.wait(1);

        const txDistributeWinnings = await jackpotContract.distributeWinnings(150)

        await txDistributeWinnings.wait(1);
        const balanceWinner = await ethers.provider.getBalance(user3.address);
        const balanceLoser = await ethers.provider.getBalance(user2.address);
        expect(parseInt(balanceLoser['_hex'], 16)).to.below(parseInt(balanceWinner['_hex'], 16));

      });

      it("User 3 should be the winner distance ", async function () {

        const colorsNFTCFactory = await ethers.getContractFactory("ColorsNFT");
        const colorModifiersFactory = await ethers.getContractFactory("ColorModifiers");

        //restart lottery 

        const starttx = await jackpotContract.restartLottery();

        await starttx.wait(1);

        colorModifierAddress = await jackpotContract.colorModifiersAddress();

        colorsNFTAddress = await jackpotContract.colorsNFTAddress();

        colorNFTContract = await colorsNFTCFactory.attach(colorsNFTAddress);
        colorModifierContract = await colorModifiersFactory.attach(colorModifierAddress);

        const intRGBW = await colorNFTContract.rgbToInt(6, 6, 6);

        const winnerRGB = await colorNFTContract.rgbToInt(5, 5, 5);


        const tx1 = await colorNFTContract.connect(user2.signer).mint({
          value: ethers.utils.parseEther("0.001")
        })

        await tx1.wait(1)

        const tx2 = await colorNFTContract.connect(user2.signer).mint({
          value: ethers.utils.parseEther("0.001")
        })

        await tx2.wait(1)

        const winnerTx = await colorNFTContract.connect(user3.signer).mintInternal(intRGBW)

        await winnerTx.wait(1)

        const txDistributeWinnings = await jackpotContract.distributeWinnings(winnerRGB)


        await txDistributeWinnings.wait(1)

        const balanceWinner = await ethers.provider.getBalance(user3.address);
        const balanceLoser = await ethers.provider.getBalance(user2.address);

        expect(parseInt(balanceLoser['_hex'], 16)).to.below(parseInt(balanceWinner['_hex'], 16));

      });

      it("User 4 and 5 both winners with the same amount won exact value ", async function () {


        const colorsNFTCFactory = await ethers.getContractFactory("ColorsNFT");
        const colorModifiersFactory = await ethers.getContractFactory("ColorModifiers");

        //restart lottery 

        console.log("test1")
        const starttx = await jackpotContract.restartLottery();

        await starttx.wait(1);
        console.log("test2")
        colorModifierAddress = await jackpotContract.colorModifiersAddress();

        colorsNFTAddress = await jackpotContract.colorsNFTAddress();

        colorNFTContract = await colorsNFTCFactory.attach(colorsNFTAddress);
        colorModifierContract = await colorModifiersFactory.attach(colorModifierAddress);

        console.log("test3")
        const tx1 = await colorNFTContract.mint({
          value: ethers.utils.parseEther("0.001")
        })
        await tx1.wait(1)
        console.log("test4")
        const tx2 = await colorNFTContract.mint({
          value: ethers.utils.parseEther("0.001")
        })
        await tx2.wait(1)

        const winnerTx = await colorNFTContract.connect(user3.signer).mintInternal(150)
        await winnerTx.wait(1)
        console.log("test5")
        const winnerTx2 = await colorNFTContract.connect(user2.signer).mintInternal(150)
        await winnerTx2.wait(1)
        console.log("test6")
        const balanceUser4Pre = await ethers.provider.getBalance(user3.address);
        const balanceUser5Pre = await ethers.provider.getBalance(user2.address);

        const txDistributeWinnings = await jackpotContract.distributeWinnings(150)
        await txDistributeWinnings.wait(1)
        console.log("test7")
        const balanceUser4Post = await ethers.provider.getBalance(user3.address);
        const balanceUser5Post = await ethers.provider.getBalance(user2.address);

        console.log("test8")
        const winningsUser4 = ethers.utils.formatEther(
          balanceUser4Post
            .sub(balanceUser4Pre)
        )

        const winningsUser5 = ethers.utils.formatEther(
          balanceUser5Post
            .sub(balanceUser5Pre)
        )


        expect(winningsUser4).to.be.equal(winningsUser5)

      });

      it("User 4 and 5 both winners with the same amount won same distance ", async function () {


        const colorsNFTCFactory = await ethers.getContractFactory("ColorsNFT");
        const colorModifiersFactory = await ethers.getContractFactory("ColorModifiers");

        //restart lottery 


        const starttx = await jackpotContract.restartLottery();

        await starttx.wait(1);

        colorModifierAddress = await jackpotContract.colorModifiersAddress();

        colorsNFTAddress = await jackpotContract.colorsNFTAddress();

        colorNFTContract = await colorsNFTCFactory.attach(colorsNFTAddress);
        colorModifierContract = await colorModifiersFactory.attach(colorModifierAddress);

        // lets consider winner rgb 5,5,5 1 winner at 4,4,4 and the other at 6,6,6

        const intRGBW1 = await colorNFTContract.rgbToInt(4, 4, 4);

        const intRGBW2 = await colorNFTContract.rgbToInt(6, 6, 6);

        const winnerRGB = await colorNFTContract.rgbToInt(5, 5, 5);


        const tx1 = await colorNFTContract.mint({
          value: ethers.utils.parseEther("0.001")
        })
        await tx1.wait(1)

        const tx2 = await colorNFTContract.mint({
          value: ethers.utils.parseEther("0.001")
        })
        await tx2.wait(1)

        const winnerTx = await colorNFTContract.connect(user4.signer).mintInternal(intRGBW1)
        await winnerTx.wait(1)

        const winnerTx2 = await colorNFTContract.connect(user5.signer).mintInternal(intRGBW2)
        await winnerTx2.wait(1)

        const balanceUser4Pre = await ethers.provider.getBalance(user4.address);
        const balanceUser5Pre = await ethers.provider.getBalance(user5.address);

        const txDistributeWinnings = await jackpotContract.distributeWinnings(winnerRGB)
        await txDistributeWinnings.wait(1)

        const balanceUser4Post = await ethers.provider.getBalance(user4.address);
        const balanceUser5Post = await ethers.provider.getBalance(user5.address);


        const winningsUser4 = ethers.utils.formatEther(
          balanceUser4Post
            .sub(balanceUser4Pre)
        )

        const winningsUser5 = ethers.utils.formatEther(
          balanceUser5Post
            .sub(balanceUser5Pre)
        )

        expect(winningsUser4).to.be.equal(winningsUser5)

      });

      it("Should win using paint", async function () {
        const colorsNFTCFactory = await ethers.getContractFactory("ColorsNFT");
        const colorModifiersFactory = await ethers.getContractFactory("ColorModifiers");

        //restart lottery 

        const tx1 = await jackpotContract.restartLottery();
        await tx1.wait(1)
        console.log("test1")
        colorModifierAddress = await jackpotContract.colorModifiersAddress();

        colorsNFTAddress = await jackpotContract.colorsNFTAddress();

        colorNFTContract = await colorsNFTCFactory.attach(colorsNFTAddress);
        colorModifierContract = await colorModifiersFactory.attach(colorModifierAddress);
        console.log("test2")
        const winnerTx = await colorNFTContract.connect(user4.signer).mintInternal(150)
        await winnerTx.wait(1)
        console.log("test3")
        const loserTx = await colorNFTContract.connect(user3.signer).mintInternal(150)
        await loserTx.wait(1)
        console.log("test4")
        const loserTx2 = await colorNFTContract.mintInternal(49)
        await loserTx2.wait(1)

        const winnerTxERC1155 = await colorModifierContract.connect(user4.signer).mintPayable(0, 1, {
          value: ethers.utils.parseEther("0.00001")
        });
        await winnerTxERC1155.wait(1)
        console.log("test5")

        const tokenList = await colorNFTContract.getColorsByOwner(user4.address);
        console.log("test6")
        const tokenId = tokenList[0];

        const byteNumber = "0x" + ("0".repeat(64) + tokenId).slice(-64) + "";

        const usePaint = await colorModifierContract.connect(user4.signer).safeTransferFrom(user4.address, colorsNFTAddress, 0, 1, byteNumber)
        await usePaint.wait(1)

        const balanceUser4Pre = await ethers.provider.getBalance(user4.address);
        const balanceJackpotPre = await ethers.provider.getBalance(jackpotContract.address);
        console.log("test7")
        /// applying dark paint will make 150 divided by 3 => 50
        const txDistributeWinnings = await jackpotContract.distributeWinnings(50)
        await txDistributeWinnings.wait(1)

        console.log("test8")
        const balanceUser4Post = await ethers.provider.getBalance(user4.address);
        expect(ethers.utils.formatEther(balanceUser4Post)).to.equal(ethers.utils.formatEther(balanceUser4Pre.add(balanceJackpotPre)));
      });

    });

    describe("rgb integer conversion", async function () {
      /* eslint-disable prettier/prettier */
      const testValues = [
        [16777215, [255, 255, 255]],
        [16711680, [255, 0, 0]],
        [65280, [0, 255, 0]],
        [255, [0, 0, 255]],
        [0, [0, 0, 0]],
        [8069635, [123, 34, 3]],
        [12614096, [192, 121, 208]],
        [4607087, [70, 76, 111]],
        [14661978, [223, 185, 90]],
      ];
      /* eslint-enable prettier/prettier */

      it("converts colors to integers", async function () {
        for (const testVal of testValues) {
          // eslint-disable-next-line no-await-in-loop
          const result = await colorNFTContract.rgbToInt(...testVal[1]);
          expect(result).to.equal(testVal[0]);
        }
      });

      it("converts integers to colors", async function () {
        function hexToArray(rgbHex) {
          return [
            parseInt(rgbHex.r["_hex"], 16),
            parseInt(rgbHex.g["_hex"], 16),
            parseInt(rgbHex.b["_hex"], 16),
          ];
        }

        for (const testVal of testValues) {
          // eslint-disable-next-line no-await-in-loop
          const result = await colorNFTContract.intToRgb(testVal[0]);
          hexToArray(result);
          expect(hexToArray(result)).to.eql(testVal[1]);
        }
      });
    });

    describe("rgb color distance calculation", async function () {
      /* eslint-disable prettier/prettier */
      const testValues = [
        [16777215, 16711680, 510],
        [16711680, 65280, 510],
        [16777215, 16777215, 0],
        [0, 0, 0],
        [8069635, 0, 160],
        [4607087, 14661978, 283],
      ];
      /* eslint-enable prettier/prettier */

      it("calculates color distance correctly", async function () {
        for (const testVal of testValues) {
          // eslint-disable-next-line no-await-in-loop
          const result = await colorNFTContract.colorDistance(
            testVal[0],
            testVal[1]
          );
          // eslint-disable-next-line no-await-in-loop
          const resultInverted = await colorNFTContract.colorDistance(
            testVal[1],
            testVal[0]
          );
          expect(parseInt(result["_hex"], 16)).to.equal(testVal[2]);
          expect(parseInt(resultInverted["_hex"], 16)).to.equal(testVal[2]);
        }
      });
    });
  });
});
