//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ColorModifiers is ERC1155, Ownable {
    uint256 public constant DARKPAINT = 0;
    uint256 public constant WHITEPAINT = 1;

    struct RGB {
        uint256 R;
        uint256 G;
        uint256 B;
    }

    constructor() ERC1155("https://game.example/api/item{id}.json") {
        _mint(msg.sender, DARKPAINT, 2000, "");
        _mint(msg.sender, WHITEPAINT, 2000, "");
    }

    function name() public pure returns (string memory) {
        return "ColorModifiers";
    }

    function symbol() public pure returns (string memory) {
        return "CLRMODIF";
    }

    function getBalanceDarkPaint(address owner) public view returns (uint256) {
        return balanceOf(owner, 0);
    }

    function getBalanceWhitePaint(address owner) public view returns (uint256) {
        return balanceOf(owner, 1);
    }

    function mint() public {
        _mint(msg.sender, DARKPAINT, 100, "");
        _mint(msg.sender, WHITEPAINT, 100, "");
    }
}
