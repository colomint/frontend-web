//SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "./ColorsNFT.sol";
import "./ColorModifiers.sol";

contract Jackpot is VRFConsumerBase, Ownable {
    //VRF variables
    bytes32 internal keyHash;
    uint256 internal fee;

    uint256 public randomness;
    bytes32 public randomHash;
    uint256 public randomBytes;

    address payable[] public minters;
    address payable admin;

    enum LOTTERY_STATE {
        OPEN,
        CLOSED,
        CALCULATING_WINNER
    }

    // countdown to finish lottery
    uint256 deadline;

    LOTTERY_STATE public lottery_state;

    //Addresses of subcontracts

    address public colorsNFTAddress;
    address public colorModifiersAddress;

    //Contracts

    ColorModifiers colorModifiers;
    ColorsNFT colorsNFT;

    constructor()
        VRFConsumerBase(
            0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B, // VRF Coordinator
            0x01BE23585060835E02B77ef475b0Cc51aA1e0709 // LINK Token
        )
    {
        // admin = payable(msg.sender);
        keyHash = 0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311;
        fee = 0.1 * 10**18; // 0.1 LINK

        // Define and deploy subcontracts

        colorModifiers = new ColorModifiers();
        colorModifiersAddress = address(colorModifiers);

        //TD need to define a way that colorsNFT only accepts the ERC1155 tokens from colorModifiersAddress
        colorsNFT = new ColorsNFT();
        colorsNFTAddress = address(colorsNFT);
        lottery_state = LOTTERY_STATE.OPEN;
        // startLottery() could be here or not depending of definition I would say not tbd
    }

    // Owner functions to start restart Lottery

    function startLottery() public onlyOwner {
        // start count down.. when it is done you can execute end lottery
        require(
            lottery_state == LOTTERY_STATE.OPEN,
            "Can't start if it is not closed"
        );
        deadline = block.timestamp + 2 minutes;
    }

    function restartLottery() public onlyOwner {
        require(
            lottery_state == LOTTERY_STATE.CLOSED,
            "Can't restart until finished"
        );
        colorModifiers = new ColorModifiers();
        colorModifiersAddress = address(colorModifiers);

        //TD need to define a way that colorsNFT only accepts the ERC1155 tokens from colorModifiersAddress
        colorsNFT = new ColorsNFT();
        colorsNFTAddress = address(colorsNFT);
        lottery_state = LOTTERY_STATE.OPEN;
        startLottery(); // I think start lottery here is ok instead of waiting owner to do it again .. tbd)
    }

    function getBalance() public returns (uint256) {
        return address(this).balance;
    }

    function endLottery() public {
        require(block.timestamp >= deadline, "Countdown has not finished!");
        lottery_state = LOTTERY_STATE.CALCULATING_WINNER;
        getRandomNumber();
    }

    // function pickWinner() public {
    //     require(admin == msg.sender, "You are not the owner");
    //     require(minters.length >= 5, "Not enough minters participating");
    //     address payable winner;
    //     // winner = minters[random() % minters.length];
    //     //get random rgb with chainlink

    //     // check who has the nft closest

    // }

    function getRandomNumber() public returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK");
        return requestRandomness(keyHash, fee);
    }

    function fulfillRandomness(bytes32 requestId, uint256 _randomness)
        internal
        override
    {
        randomness = _randomness;

        randomHash = keccak256(abi.encodePacked(_randomness));

        //transform _randomness into RGB named winnerRGB and comment next line TD

        // lets say RGB is 1 1 1 considering C = 256^2*R +256 *G +B; maximum rgb (255,255,255) would be 16,777,216

        uint256 winnerRGB = 256**2 + 256 + 1;

        // Get the list of all the ColorNFT tokens

        uint256[] memory listOfNFTS = colorsNFT._colorTokenList();

        uint256 tokenIdFromWinner;

        address payable winner;

        for (uint256 i = 0; i < listOfNFTS.length; i++) {
            if (listOfNFTS[i] == winnerRGB) {
                tokenIdFromWinner = colorsNFT.colorToToken(winnerRGB);
                winner = colorsNFT.tokenToOwner(tokenIdFromWinner);
                lottery_state = LOTTERY_STATE.CLOSED;
                winner.transfer(address(this).balance);
                return;
            } else {
                //nobody has the exact color do color range aumentation here TD..
            }
        }
    }
}
