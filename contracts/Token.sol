//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

//import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    address public afterMarket;
    address public owner;
    address public gamebrain;

    constructor(address _gameBrain) ERC20("HOTDOG FACE", "HDF") {
        owner = msg.sender;
        gamebrain = _gameBrain;
    }

    function setAfterMarket(address _afterMarket) public {
        require(msg.sender == owner);
        afterMarket = _afterMarket;
    }

    function setGameBrain(address _gameBrain) public {
        require(msg.sender == owner, "Not Authorized");
        gamebrain = _gameBrain;
    }

    function changeOwner(address newOwner) public {
        require(msg.sender == owner);
        owner = newOwner;
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    //allows afterMarket Contract Or Owner to automatically mint
    function mintTokens(address to, uint256 amount) public {
        require(
            msg.sender == afterMarket ||
                msg.sender == owner ||
                msg.sender == gamebrain,
            "Not Authorized"
        );
        _mint(to, amount);
    }
}
