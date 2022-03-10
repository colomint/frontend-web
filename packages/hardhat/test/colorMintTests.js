const { ethers, waffle } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("Tests Colormint", function () {
  let jackpotContract;
  let colorModifierAddress;
  let colorsNFTAddress;
  let colorNFTContract;
  let deployer;
  let user2;
  let user3;

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
    [deployer, user2, user3] = await getAccounts();
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

      it("Should start the lottery", async function () {
        await jackpotContract.startLottery();

        const lotteryStatus = 0; // OPEN

        expect(await jackpotContract.lottery_state()).to.equal(lotteryStatus);
      });

      it("User 3 should be the winner and jackpot should be empty after distribution", async function () {
        const colorsNFTCFactory = await ethers.getContractFactory("ColorsNFT");

        colorNFTContract = await colorsNFTCFactory.attach(colorsNFTAddress);

        const provider = waffle.provider;

        const txWinnerBuy = await colorNFTContract.connect(user3.signer).mint(1, 1, 1, { value: ethers.utils.parseEther("0.00001") })
        // for testings the winner value is 1 1 1 
        const txLoserBuy = await colorNFTContract.connect(user2.signer).mint(10, 10, 10, { value: ethers.utils.parseEther("0.00001") })

        const txWinner = await jackpotContract.fullFillRandomnessTests();
        const jackPotBalancePost = await provider.getBalance(jackpotContract.address);


        const balanceWinner = await ethers.provider.getBalance(user3.address);
        const balanceLoser = await ethers.provider.getBalance(user2.address);

        expect(parseInt(balanceLoser['_hex'], 16)).to.below(parseInt(balanceWinner['_hex'], 16));
        expect(parseInt(jackPotBalancePost['_hex'], 16)).to.equal(0);

      });
    });

    describe("rgb integer conversion", async function () {
      /* eslint-disable prettier/prettier */
      const testValues = [
        [16777215, [255, 255, 255]],
        [16711680, [255,   0,   0]],
        [   65280, [  0, 255,   0]],
        [     255, [  0,   0, 255]],
        [       0, [  0,   0,   0]],
        [ 8069635, [123,  34,   3]],
        [12614096, [192, 121, 208]],
        [ 4607087, [ 70,  76, 111]],
        [14661978, [223, 185,  90]],
      ];
      /* eslint-enable prettier/prettier */

      it("converts colors to integers", async function () {
        for (const testVal of testValues) {
          // eslint-disable-next-line no-await-in-loop
          const result = await colorNFTContract.rgbToInt(...testVal[1]);
          expect(result).to.equal(testVal[0]);
        }
      });
    });
  });
});
