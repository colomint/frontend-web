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
  });

  before((done) => {
    setTimeout(done, 2000);
  });

  describe("Standard path", function () {
    it("Should deploy Jackpot", async function () {
      const jackpotFactory = await ethers.getContractFactory("Jackpot");

      jackpotContract = await jackpotFactory.deploy();
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


        const provider = waffle.provider;
        const colorsNFTCFactory = await ethers.getContractFactory("ColorsNFT");
        const colorModifiersFactory = await ethers.getContractFactory("ColorModifiers");

        colorNFTContract = await colorsNFTCFactory.attach(colorsNFTAddress);
        colorModifierContract = await colorModifiersFactory.attach(colorModifierAddress);

        const buyERC721 = await colorNFTContract.mint({
          value: ethers.utils.parseEther("0.001")
        })

        const buyERC1155 = await colorModifierContract.mintPayable(0, 1, {
          value: ethers.utils.parseEther("0.00001")
        })

        // const receipt = await buyERC1155.wait()

        const jackPotBalancePreDistribution = await provider.getBalance(jackpotContract.address);
        const txDistributeWinnings = await jackpotContract.distributeWinnings(1)
        const rc = txDistributeWinnings.wait()
        const jackPotBalancePostDistribution = await provider.getBalance(jackpotContract.address);

        expect(parseInt(jackPotBalancePreDistribution['_hex'], 16)).to.equal(ethers.utils.parseEther("0.00101"));
        expect(parseInt(jackPotBalancePostDistribution['_hex'], 16)).to.equal(0);

      });


      it("Should restart lottery, end the lottery and have a winner", async function () {

        const colorsNFTCFactory = await ethers.getContractFactory("ColorsNFT");
        const colorModifiersFactory = await ethers.getContractFactory("ColorModifiers");

        //restart lottery 

        await jackpotContract.restartLottery();

        colorModifierAddress = await jackpotContract.colorModifiersAddress();

        colorsNFTAddress = await jackpotContract.colorsNFTAddress();

        colorNFTContract = await colorsNFTCFactory.attach(colorsNFTAddress);
        colorModifierContract = await colorModifiersFactory.attach(colorModifierAddress);

        const tx1 = await colorNFTContract.connect(user2.signer).mint({
          value: ethers.utils.parseEther("0.001")
        })

        const tx2 = await colorNFTContract.connect(user3.signer).mint({
          value: ethers.utils.parseEther("0.001")
        })

        const balanceUser2Pre = await ethers.provider.getBalance(user2.address);
        const balanceUser3Pre = await ethers.provider.getBalance(user3.address);


        await network.provider.send("evm_increaseTime", [3600])
        await jackpotContract.endLottery();


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

        const tx2 = await colorNFTContract.connect(user2.signer).mint({
          value: ethers.utils.parseEther("0.001")
        })

        const winnerTx = await colorNFTContract.connect(user3.signer).mintInternal(150)

        const txDistributeWinnings = await jackpotContract.distributeWinnings(150)

        const balanceWinner = await ethers.provider.getBalance(user3.address);
        const balanceLoser = await ethers.provider.getBalance(user2.address);

        expect(parseInt(balanceLoser['_hex'], 16)).to.below(parseInt(balanceWinner['_hex'], 16));

      });

      it("User 3 should be the winner distance ", async function () {

        const provider = waffle.provider;
        const colorsNFTCFactory = await ethers.getContractFactory("ColorsNFT");
        const colorModifiersFactory = await ethers.getContractFactory("ColorModifiers");

        //restart lottery 

        await jackpotContract.restartLottery();

        colorModifierAddress = await jackpotContract.colorModifiersAddress();

        colorsNFTAddress = await jackpotContract.colorsNFTAddress();

        colorNFTContract = await colorsNFTCFactory.attach(colorsNFTAddress);
        colorModifierContract = await colorModifiersFactory.attach(colorModifierAddress);

        const intRGBW = await colorNFTContract.rgbToInt(6, 6, 6);

        const winnerRGB = await colorNFTContract.rgbToInt(5, 5, 5);


        const tx1 = await colorNFTContract.connect(user2.signer).mint({
          value: ethers.utils.parseEther("0.001")
        })

        const tx2 = await colorNFTContract.connect(user2.signer).mint({
          value: ethers.utils.parseEther("0.001")
        })

        const winnerTx = await colorNFTContract.connect(user3.signer).mintInternal(intRGBW)

        const txDistributeWinnings = await jackpotContract.distributeWinnings(winnerRGB)

        const balanceWinner = await ethers.provider.getBalance(user3.address);
        const balanceLoser = await ethers.provider.getBalance(user2.address);

        expect(parseInt(balanceLoser['_hex'], 16)).to.below(parseInt(balanceWinner['_hex'], 16));

      });

      it("User 4 and 5 both winners with the same amount won exact value ", async function () {


        const provider = waffle.provider;
        const colorsNFTCFactory = await ethers.getContractFactory("ColorsNFT");
        const colorModifiersFactory = await ethers.getContractFactory("ColorModifiers");

        //restart lottery 

        await jackpotContract.restartLottery();

        colorModifierAddress = await jackpotContract.colorModifiersAddress();

        colorsNFTAddress = await jackpotContract.colorsNFTAddress();

        colorNFTContract = await colorsNFTCFactory.attach(colorsNFTAddress);
        colorModifierContract = await colorModifiersFactory.attach(colorModifierAddress);


        const tx1 = await colorNFTContract.mint({
          value: ethers.utils.parseEther("0.001")
        })

        const tx2 = await colorNFTContract.mint({
          value: ethers.utils.parseEther("0.001")
        })

        const winnerTx = await colorNFTContract.connect(user4.signer).mintInternal(150)

        const winnerTx2 = await colorNFTContract.connect(user5.signer).mintInternal(150)

        const balanceUser4Pre = await ethers.provider.getBalance(user4.address);
        const balanceUser5Pre = await ethers.provider.getBalance(user5.address);

        const txDistributeWinnings = await jackpotContract.distributeWinnings(150)

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

      it("User 4 and 5 both winners with the same amount won same distance ", async function () {


        const provider = waffle.provider;
        const colorsNFTCFactory = await ethers.getContractFactory("ColorsNFT");
        const colorModifiersFactory = await ethers.getContractFactory("ColorModifiers");

        //restart lottery 

        await jackpotContract.restartLottery();

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

        const tx2 = await colorNFTContract.mint({
          value: ethers.utils.parseEther("0.001")
        })

        const winnerTx = await colorNFTContract.connect(user4.signer).mintInternal(intRGBW1)

        const winnerTx2 = await colorNFTContract.connect(user5.signer).mintInternal(intRGBW2)

        const balanceUser4Pre = await ethers.provider.getBalance(user4.address);
        const balanceUser5Pre = await ethers.provider.getBalance(user5.address);

        const txDistributeWinnings = await jackpotContract.distributeWinnings(winnerRGB)

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
        const provider = waffle.provider;
        const colorsNFTCFactory = await ethers.getContractFactory("ColorsNFT");
        const colorModifiersFactory = await ethers.getContractFactory("ColorModifiers");

        //restart lottery 

        await jackpotContract.restartLottery();

        colorModifierAddress = await jackpotContract.colorModifiersAddress();

        colorsNFTAddress = await jackpotContract.colorsNFTAddress();

        colorNFTContract = await colorsNFTCFactory.attach(colorsNFTAddress);
        colorModifierContract = await colorModifiersFactory.attach(colorModifierAddress);

        const winnerTx = await colorNFTContract.connect(user4.signer).mintInternal(150)

        const loserTx = await colorNFTContract.connect(user3.signer).mintInternal(150)

        const loserTx2 = await colorNFTContract.mintInternal(49)

        const winnerTxERC1155 = await colorModifierContract.connect(user4.signer).mintPayable(0, 1, {
          value: ethers.utils.parseEther("0.00001")
        });



        const tokenList = await colorNFTContract.getColorsByOwner(user4.address);

        const tokenId = tokenList[0];

        const byteNumber = "0x" + ("0".repeat(64) + tokenId).slice(-64) + "";

        const usePaint = await colorModifierContract.connect(user4.signer).safeTransferFrom(user4.address, colorsNFTAddress, 0, 1, byteNumber)



        const balanceUser4Pre = await ethers.provider.getBalance(user4.address);
        const balanceJackpotPre = await ethers.provider.getBalance(jackpotContract.address);

        /// applying dark paint will make 150 divided by 3 => 50
        const txDistributeWinnings = await jackpotContract.distributeWinnings(50)

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
