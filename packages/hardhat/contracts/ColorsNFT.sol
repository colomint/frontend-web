//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract ColorsNFT is ERC721, ERC1155Holder, Ownable {
    // ERC721 variables
    uint256 public mintPrice = 0.00001 ether;
    uint256 public totalSupply;
    uint256 public maxSupply;
    bool public isMintEnabled = true;
    mapping(address => uint256) public mintedTokens;
    mapping(uint256 => RGB) public tokenToColor;
    mapping(RGB => uint256) public colorToToken;
    mapping(address => uint256[]) public ownerToTokens;
    mapping(uint256 => address) public tokenToOwner;
    RGB[] public colorTokenList;

    struct RGB {
        uint256 R;
        uint256 G;
        uint256 B;
    }

    event RGBChanged(uint256 tokenId, RGB newRGB);

    // ERC1155 mapping (how much of each color modifier it has)

    mapping(uint256 => mapping(uint256 => uint256))
        private supplyAmountsForColor;

    uint256 public constant DARKPAINT = 0;
    uint256 public constant WHITEPAINT = 1;

    //Constructor and functions

    constructor() payable ERC721("Colomint", "COLO") {
        maxSupply = 10 * 16;
    }

    function toggleIsMintenabled() external onlyOwner {
        isMintEnabled = !isMintEnabled;
    }

    function setMaxSupply(uint256 maxSupply_) external onlyOwner {
        maxSupply = maxSupply_;
    }

    function mint(
        uint256 _r,
        uint256 _g,
        uint256 _b
    ) external payable {
        require(isMintEnabled, "minting not enabled");
        require(mintedTokens[msg.sender] < 5, "exceeds max per wallet");
        require(msg.value == mintPrice, "wrong value");
        require(maxSupply > totalSupply, "sold out");

        mintedTokens[msg.sender]++;
        totalSupply++;
        uint256 tokenId = totalSupply;
        _safeMint(msg.sender, tokenId);

        //Color and Tokens relations
        tokenToColor[tokenId - 1] = RGB(_r, _g, _b);
        colorToToken[RGB(_r, _g, _b)] = tokenId - 1;

        // owner and Tokens relations
        ownerToTokens[msg.sender].push(tokenId - 1);
        tokenToOwner[tokenId - 1] = msg.sender;

        // list of nfts with their colors
        colorTokenList.push(RGB(_r, _g, _b));
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155Receiver, ERC721)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // receiving a color paint modifier
    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) public override returns (bytes4) {
        uint256 colorNFTId = toUint256(data); // check this
        supplyAmountsForColor[colorNFTId][id] += value;

        console.log("colorNFTId", colorNFTId);
        console.log("tokenID", id);

        if (id == DARKPAINT) {
            tokenToColor[colorNFTId].R = (tokenToColor[colorNFTId].R * 1) / 3;
            tokenToColor[colorNFTId].G = (tokenToColor[colorNFTId].G * 1) / 3;
            tokenToColor[colorNFTId].B = (tokenToColor[colorNFTId].B * 1) / 3;
        } else {
            tokenToColor[colorNFTId].R = (tokenToColor[colorNFTId].R * 3) / 2;
            tokenToColor[colorNFTId].G = (tokenToColor[colorNFTId].G * 3) / 2;
            tokenToColor[colorNFTId].B = (tokenToColor[colorNFTId].B * 3) / 2;
        }

        console.log(tokenToColor[colorNFTId].R);

        colorTokenList[colorNFTId] = RGB(
            tokenToColor[colorNFTId].R,
            tokenToColor[colorNFTId].G,
            tokenToColor[colorNFTId].B
        );
        emit RGBChanged(colorNFTId, tokenToColor[colorNFTId]);
        return
            bytes4(
                bytes4(
                    keccak256(
                        "onERC1155Received(address,address,uint256,uint256,bytes)"
                    )
                )
            );
    }

    function toUint256(bytes memory _bytes)
        internal
        pure
        returns (uint256 value)
    {
        assembly {
            value := mload(add(_bytes, 0x20))
        }
    }

    function getColorsByOwner(address _owner)
        external
        view
        returns (uint256[] memory)
    {
        return ownerToTokens[_owner];
    }

    function _colorTokenList() public view returns (RGB[] memory) {
        return colorTokenList;
    }
}
