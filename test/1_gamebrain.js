const { expect } = require("chai");
const { ethers, web3 } = require("hardhat");
var abi = require('ethereumjs-abi');
var bn = require('../bignumber')
async function signPayment(recipient, amountUser, amountHouse, nonce, contractAddress, signerAccount) {
    // console.log(amountUser)
    // console.log(amountHouse)
    var hash = "0x" + abi.soliditySHA3(
        ["address", "uint256", "uint256", "uint256", "address"],
        [recipient, amountUser, amountHouse, nonce, contractAddress]
    ).toString("hex");
    return await web3.eth.sign(hash, signerAccount.address)
}

describe("HOT DOG FACE TOKEN AND GAME", function () {
    it("Should ALLOW USER TO CLAIM TOKENS", async function () {
        const accounts = await hre.ethers.getSigners();

        // constructor(uint256 _price, address _signer) {
        //     owner = msg.sender;
        //     signer = _signer;
        //     price = _price;
        // }

        const TOKENCLAIMPROXY = await ethers.getContractFactory("GAMEBRAINV2");
        const TokenClaimProxy = await TOKENCLAIMPROXY.deploy(1 * 10 ** 9, accounts[0].address)
        await TokenClaimProxy.deployed()
        // transfer tokens to the game 
        var Token = await ethers.getContractFactory("Token");
        //address _gameBrain, uint256 initialTokensPerUser
        token = await Token.deploy(TokenClaimProxy.address)
        await token.deployed()


        await token.setGameBrain(TokenClaimProxy.address)

        await TokenClaimProxy.setAndInitToken(token.address, 1000)


        // await token.transfer(TokenClaimProxy.address, (90 * 10 ** 18).toString(), { from: accounts[0].address })
        //ensure balance is correct 


        //TODO setGameBrain
        // tokenClaimProxy.setGameBrain()

        balanceAfterTransfer = await token.balanceOf(TokenClaimProxy.address)
        //console.log(balanceAfterTransfer.toString())
        //console.log((90 * 10 ** 18).toString())
        // expect(balanceAfterTransfer.toString()).to.equal((90 * 10 ** 18).toString())
        const ONEWEI = 10 ** 10
        const paymentAmount = 1 //* 10 ** 18
        const amountHouse = paymentAmount * 0.2 * ONEWEI
        const amountUser = paymentAmount * 0.8 * ONEWEI
        nonce = 1
        //nonce = await accounts[0].getTransactionCount()

        paymentSig = await signPayment(accounts[3].address, amountUser, amountHouse, nonce, TokenClaimProxy.address, accounts[0])
        //sign a transaction that that says user wins and see his balance 
        txData = TokenClaimProxy.interface.encodeFunctionData("claimTokens", [amountUser, amountHouse, nonce, paymentSig])
        tx = {
            from: accounts[3].address,
            to: TokenClaimProxy.address,
            data: txData,
            gas: "300000",
            gasPrice: (100 * 10 ** 8).toString()
        }

        //  accounts[0].sendTransaction(tx)
        await web3.eth.sendTransaction(tx)
        // await web3.eth.sendTransaction(tx)

        balanceAfterClaim = await token.balanceOf(accounts[3].address)
        //  console.log(balanceAfterClaim)
        expect(balanceAfterClaim.toString()).to.equal(amountUser.toString())
    });

    it("Should ALLOW USER TO CLAIM TOKENS WITH NO HOUSE", async function () {
        const accounts = await hre.ethers.getSigners();

        // constructor(uint256 _price, address _signer) {
        //     owner = msg.sender;
        //     signer = _signer;
        //     price = _price;
        // }

        const TOKENCLAIMPROXY = await ethers.getContractFactory("GAMEBRAINV2");
        const TokenClaimProxy = await TOKENCLAIMPROXY.deploy(1 * 10 ** 9, accounts[0].address)
        await TokenClaimProxy.deployed()
        // transfer tokens to the game 
        var Token = await ethers.getContractFactory("Token");
        //address _gameBrain, uint256 initialTokensPerUser
        token = await Token.deploy(TokenClaimProxy.address)
        await token.deployed()


        await token.setGameBrain(TokenClaimProxy.address)

        await TokenClaimProxy.setAndInitToken(token.address, 1000)


        // await token.transfer(TokenClaimProxy.address, (90 * 10 ** 18).toString(), { from: accounts[0].address })
        //ensure balance is correct 


        //TODO setGameBrain
        // tokenClaimProxy.setGameBrain()

        balanceAfterTransfer = await token.balanceOf(TokenClaimProxy.address)
        //console.log(balanceAfterTransfer.toString())
        //console.log((90 * 10 ** 18).toString())
        // expect(balanceAfterTransfer.toString()).to.equal((90 * 10 ** 18).toString())
        const ONEWEI = 10 ** 10
        const paymentAmount = 1 //* 10 ** 18
        const amountHouse = 0
        const amountUser = paymentAmount * ONEWEI
        nonce = 1
        //nonce = await accounts[0].getTransactionCount()

        paymentSig = await signPayment(accounts[3].address, amountUser, amountHouse, nonce, TokenClaimProxy.address, accounts[0])
        //sign a transaction that that says user wins and see his balance 
        txData = TokenClaimProxy.interface.encodeFunctionData("claimTokens", [amountUser, amountHouse, nonce, paymentSig])
        tx = {
            from: accounts[3].address,
            to: TokenClaimProxy.address,
            data: txData,
            gas: "300000",
            gasPrice: (100 * 10 ** 8).toString()
        }

        //  accounts[0].sendTransaction(tx)
        await web3.eth.sendTransaction(tx)
        // await web3.eth.sendTransaction(tx)

        balanceAfterClaim = await token.balanceOf(accounts[3].address)
        //   console.log(balanceAfterClaim)
        expect(balanceAfterClaim.toString()).to.equal(amountUser.toString())
    });


    it("Should NOT ALLOW WRONG USER TO CLAIM TOKENS ", async function () {
        const accounts = await hre.ethers.getSigners();

        // constructor(uint256 _price, address _signer) {
        //     owner = msg.sender;
        //     signer = _signer;
        //     price = _price;
        // }

        const TOKENCLAIMPROXY = await ethers.getContractFactory("GAMEBRAINV2");
        const TokenClaimProxy = await TOKENCLAIMPROXY.deploy(1 * 10 ** 9, accounts[0].address)
        await TokenClaimProxy.deployed()
        // transfer tokens to the game 
        var Token = await ethers.getContractFactory("Token");
        //address _gameBrain, uint256 initialTokensPerUser
        token = await Token.deploy(TokenClaimProxy.address)
        await token.deployed()


        await token.setGameBrain(TokenClaimProxy.address)

        await TokenClaimProxy.setAndInitToken(token.address, 1000)


        // await token.transfer(TokenClaimProxy.address, (90 * 10 ** 18).toString(), { from: accounts[0].address })
        //ensure balance is correct 


        //TODO setGameBrain
        // tokenClaimProxy.setGameBrain()

        balanceAfterTransfer = await token.balanceOf(TokenClaimProxy.address)
        //console.log(balanceAfterTransfer.toString())
        //console.log((90 * 10 ** 18).toString())
        // expect(balanceAfterTransfer.toString()).to.equal((90 * 10 ** 18).toString())
        const ONEWEI = 10 ** 10
        const paymentAmount = 1 //* 10 ** 18
        const amountHouse = 0
        const amountUser = paymentAmount * ONEWEI
        nonce = 1
        //nonce = await accounts[0].getTransactionCount()

        paymentSig = await signPayment(accounts[4].address, amountUser, amountHouse, nonce, TokenClaimProxy.address, accounts[0])
        //sign a transaction that that says user wins and see his balance 
        txData = TokenClaimProxy.interface.encodeFunctionData("claimTokens", [amountUser, amountHouse, nonce, paymentSig])
        tx = {
            from: accounts[3].address,
            to: TokenClaimProxy.address,
            data: txData,
            gas: "300000",
            gasPrice: (100 * 10 ** 8).toString()
        }

        //  accounts[0].sendTransaction(tx)
        // await web3.eth.sendTransaction(tx)
        // await web3.eth.sendTransaction(tx)
        try {
            await web3.eth.sendTransaction(tx)
        } catch (e) {
            expect(e.message).to.equal("VM Exception while processing transaction: reverted with reason string 'Signature Not Authentic.'")
        }

        //     await ethers.provider.sendTransaction(tx)
        balanceAfterClaim = await token.balanceOf(accounts[3].address)
        //   console.log(balanceAfterClaim)
        expect(balanceAfterClaim.toString()).to.equal((0).toString())
    });


    it("Should NOT ALLOW ANY ONE TO JUST SIGN ", async function () {
        const accounts = await hre.ethers.getSigners();

        // constructor(uint256 _price, address _signer) {
        //     owner = msg.sender;
        //     signer = _signer;
        //     price = _price;
        // }

        const TOKENCLAIMPROXY = await ethers.getContractFactory("GAMEBRAINV2");
        const TokenClaimProxy = await TOKENCLAIMPROXY.deploy(1 * 10 ** 9, accounts[0].address)
        await TokenClaimProxy.deployed()
        // transfer tokens to the game 
        var Token = await ethers.getContractFactory("Token");
        //address _gameBrain, uint256 initialTokensPerUser
        token = await Token.deploy(TokenClaimProxy.address)
        await token.deployed()


        await token.setGameBrain(TokenClaimProxy.address)

        await TokenClaimProxy.setAndInitToken(token.address, 1000)


        // await token.transfer(TokenClaimProxy.address, (90 * 10 ** 18).toString(), { from: accounts[0].address })
        //ensure balance is correct 


        //TODO setGameBrain
        // tokenClaimProxy.setGameBrain()

        balanceAfterTransfer = await token.balanceOf(TokenClaimProxy.address)
        //console.log(balanceAfterTransfer.toString())
        //console.log((90 * 10 ** 18).toString())
        // expect(balanceAfterTransfer.toString()).to.equal((90 * 10 ** 18).toString())
        const ONEWEI = 10 ** 10
        const paymentAmount = 1 //* 10 ** 18
        const amountHouse = 0
        const amountUser = paymentAmount * ONEWEI
        nonce = 1
        //nonce = await accounts[0].getTransactionCount()

        paymentSig = await signPayment(accounts[3].address, amountUser, amountHouse, nonce, TokenClaimProxy.address, accounts[3])
        //sign a transaction that that says user wins and see his balance 
        txData = TokenClaimProxy.interface.encodeFunctionData("claimTokens", [amountUser, amountHouse, nonce, paymentSig])
        tx = {
            from: accounts[3].address,
            to: TokenClaimProxy.address,
            data: txData,
            gas: "300000",
            gasPrice: (100 * 10 ** 8).toString()
        }

        //  accounts[0].sendTransaction(tx)
        // await web3.eth.sendTransaction(tx)
        // await web3.eth.sendTransaction(tx)
        try {
            await web3.eth.sendTransaction(tx)
        } catch (e) {
            expect(e.message).to.equal("VM Exception while processing transaction: reverted with reason string 'Signature Not Authentic.'")
        }

        //     await ethers.provider.sendTransaction(tx)
        balanceAfterClaim = await token.balanceOf(accounts[3].address)
        //   console.log(balanceAfterClaim)
        expect(balanceAfterClaim.toString()).to.equal((0).toString())
    });



    it("Price Is Correct", async function () {
        const accounts = await hre.ethers.getSigners();

        // constructor(uint256 _price, address _signer) {
        //     owner = msg.sender;
        //     signer = _signer;
        //     price = _price;
        // }


        const ONEWEI = 10 ** 9
        //  const price = 1 * 10 ** 9;
        const price = ethers.utils.parseEther("0.04").div("1000")

        const TOKENCLAIMPROXY = await ethers.getContractFactory("GAMEBRAINV2");
        const TokenClaimProxy = await TOKENCLAIMPROXY.deploy(price, accounts[0].address)
        await TokenClaimProxy.deployed()
        // transfer tokens to the game 
        var Token = await ethers.getContractFactory("Token");
        //address _gameBrain, uint256 initialTokensPerUser
        token = await Token.deploy(TokenClaimProxy.address)
        await token.deployed()


        await token.setGameBrain(TokenClaimProxy.address)

        await TokenClaimProxy.setAndInitToken(token.address, 1000)
        const amountToBuy = 1000;
        await TokenClaimProxy.buyTokens(amountToBuy, { value: (price.mul(amountToBuy)).toString() })



        //        expect(balanceAfterClaim.toString()).to.equal((0).toString())


    });


});
