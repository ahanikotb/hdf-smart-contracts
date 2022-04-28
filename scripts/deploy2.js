// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { assert } = require("chai");
const { hre, ethers } = require("hardhat");
const fs = require("fs-extra")

async function main() {
    // const accounts = await hre.ethers.getSigners();

    const price = ethers.utils.parseEther("84").div("1000")


    const network = await ethers.getDefaultProvider().getNetwork();
    console.log("Network name=", network.name);
    console.log("Network chain id=", network.chainId);

    const signer = new ethers.Wallet("")
    const signer_pv = signer._signingKey().privateKey

    assert(signer.address == (new ethers.Wallet(signer_pv)).address)
    console.log("SIGNING WALLET: ", signer.address)
    console.log("PRIV KEY: ", signer_pv)
    new_owner = "0xf9b8f225c753ebb8915702caa2d4e99811189a53"


    const TOKENCLAIMPROXY = await ethers.getContractFactory("GAMEBRAINV2");
    const TokenClaimProxy = TOKENCLAIMPROXY.attach("0xf76012db611baba20b044c4b033ded829d38cad8")
    //  const TokenClaimProxy = await TOKENCLAIMPROXY.deploy(price.toString(), signer.address)
    //  await TokenClaimProxy.deployed()
    var Token = await ethers.getContractFactory("Token");
    const token = Token.attach("0x286a053cb8457031010cb80b6574e72482c58e65")
    // token = await Token.deploy(TokenClaimProxy.address)
    //await token.deployed()
    //const token = Token.attach("")
    var tx = await token.setGameBrain(TokenClaimProxy.address)
    await tx.wait()
    tx = await TokenClaimProxy.setAndInitToken(token.address, 1000)
    tx.wait()

    //send the ownership to alvaro

    tx = await token.changeOwner(new_owner);
    tx.wait()
    tx = await TokenClaimProxy.changeOwner(new_owner);
    tx.wait()

    console.log("GAMEBRAIN ADDRESS ", TokenClaimProxy.address)
    console.log("TOKEN ADDRESS ", token.address)

    fs.writeJSONSync(`./deployments/${network.name}.json`, {
        network: network.name,
        token: token.address,
        gamebrain: TokenClaimProxy.address,
        signer_priv: signer_pv,
        signer_pub: signer.address,
        new_owner: new_owner,
        price: price.toString()
    }, {
        overwrite: true
    })

}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
