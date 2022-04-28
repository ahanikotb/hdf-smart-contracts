const { expect, assert } = require("chai");
const { ethers } = require("hardhat");


// function mint_tokens() {

// }


const zero_address = "0x0000000000000000000000000000000000000001"

describe("AFTERMARKETV2", function () {
  tokenPrice = 1 * 10 ** 9; // a token is one gwei
  ToWEI = "000000000000000000"
  it("Should DEPLOY CORRECTLY", async function () {
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy(zero_address);
    const P2PFUNGIBLEEXCHANGE = await ethers.getContractFactory("AFTERMARKETV2");
    const pfe = await P2PFUNGIBLEEXCHANGE.deploy(await token.address, tokenPrice, 18, 5);
    await pfe.deployed();
  });



  it("Should Supply Token Correctly", async function () {
    const users = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy(zero_address);
    await token.mintTokens(users[0].address, ("100" + ToWEI)).toString();
    //assert(await token.balanceOf(users[0].address) == "100" + ToWEI);

    const P2PFUNGIBLEEXCHANGE = await ethers.getContractFactory("AFTERMARKETV2");
    const pfe = await P2PFUNGIBLEEXCHANGE.deploy(await token.address, tokenPrice, 18, 5);
    await pfe.deployed();
    await token.mintTokens(users[1].address, ("100" + ToWEI).toString());
    await token.connect(users[1]).approve(await pfe.address, "1000000000000" + ToWEI);
    await pfe.connect(users[1]).supplyToken("10" + ToWEI);
    s = await pfe.currentSupply()
    assert(Number(s) == Number("10"));

  });



  it("Should Allow users to buy full supply", async function () {
    const users = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy(zero_address);
    await token.mintTokens(users[0].address, ("100" + ToWEI).toString());
    // console.log(await token.balanceOf(users[0].address));
    assert(await token.balanceOf(users[0].address) == "100" + ToWEI, "EROOR");
    const P2PFUNGIBLEEXCHANGE = await ethers.getContractFactory("AFTERMARKETV2");
    const pfe = await P2PFUNGIBLEEXCHANGE.deploy(await token.address, tokenPrice, 18, 5);
    await pfe.deployed();
    await token.mintTokens(users[1].address, ("100" + ToWEI).toString());
    await token.connect(users[1]).approve(await pfe.address, "1000000000000" + ToWEI);
    await pfe.connect(users[1]).supplyToken("10" + ToWEI);
    s = await pfe.currentSupply()
    await pfe.connect(users[3]).fullFillOrderWithFallBack("10" + ToWEI, { value: (tokenPrice * 10).toString() })

  });


  it("Should Allow users to buy  half supply", async function () {
    const users = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy(zero_address);
    await token.mintTokens(users[0].address, ("100" + ToWEI).toString());
    assert(await token.balanceOf(users[0].address) == "100" + ToWEI);
    const P2PFUNGIBLEEXCHANGE = await ethers.getContractFactory("AFTERMARKETV2");
    const pfe = await P2PFUNGIBLEEXCHANGE.deploy(await token.address, tokenPrice, 18, 5);
    await pfe.deployed();
    await token.mintTokens(users[1].address, ("150" + ToWEI).toString());
    await token.connect(users[1]).approve(await pfe.address, "1000000000000" + ToWEI);
    await pfe.connect(users[1]).supplyToken("15" + ToWEI);
    s = await pfe.currentSupply()
    await pfe.connect(users[3]).fullFillOrderWithFallBack("10" + ToWEI, { value: (tokenPrice * 10).toString() })
    await pfe.connect(users[4]).fullFillOrderWithFallBack("5" + ToWEI, { value: (tokenPrice * 5).toString() })
    //await pfe.connect(users[4]).fullFillOrderWithFallBack("5"+ToWEI,{value:(tokenPrice*5).toString()})
  });


  it("Should Allow Multiple suppliers and multiple users to buy", async function () {
    const users = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy(zero_address);
    await token.mintTokens(users[0].address, ("100" + ToWEI).toString());
    assert(await token.balanceOf(users[0].address) == "100" + ToWEI);
    const P2PFUNGIBLEEXCHANGE = await ethers.getContractFactory("AFTERMARKETV2");
    const pfe = await P2PFUNGIBLEEXCHANGE.deploy(await token.address, tokenPrice, 18, 5);
    await pfe.deployed();
    await token.mintTokens(users[1].address, ("150" + ToWEI).toString());
    await token.connect(users[1]).approve(await pfe.address, "1000000000000" + ToWEI);
    await pfe.connect(users[1]).supplyToken("150" + ToWEI);
    await token.mintTokens(users[9].address, ("110" + ToWEI).toString());
    await token.connect(users[9]).approve(await pfe.address, "1000000000000" + ToWEI);
    await pfe.connect(users[9]).supplyToken("110" + ToWEI);
    await token.mintTokens(users[7].address, ("100" + ToWEI).toString());
    await token.connect(users[7]).approve(await pfe.address, "1000000000000" + ToWEI);
    await pfe.connect(users[7]).supplyToken("100" + ToWEI);
    s = await pfe.currentSupply()

    await pfe.connect(users[6]).fullFillOrderWithFallBack("100" + ToWEI, { value: (tokenPrice * 100).toString() })

    await pfe.connect(users[4]).fullFillOrderWithFallBack("50" + ToWEI, { value: (tokenPrice * 50).toString() })

    await pfe.connect(users[8]).fullFillOrderWithFallBack("100" + ToWEI, { value: (tokenPrice * 100).toString() })
    await pfe.connect(users[2]).fullFillOrderWithFallBack("100" + ToWEI, { value: (tokenPrice * 100).toString() })
    // s = await pfe.currentSupply()  
    await pfe.connect(users[2]).fullFillOrderWithFallBack("10" + ToWEI, { value: (tokenPrice * 10).toString() })

    //await pfe.connect(users[4]).fullFillOrderWithFallBack("50",{value:(tokenPrice*50).toString()})
    // await pfe.connect(users[8]).fullFillOrderWithFallBack("100",{value:(tokenPrice*100).toString()})
    // await pfe.connect(users[2]).fullFillOrderWithFallBack("100",{value:(tokenPrice*100).toString()})
    // make sure suppliers are payed correctly
  });




  it("Make Sure Suppliers get payed correctly", async function () {
    const users = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy(zero_address);
    await token.mintTokens(users[0].address, ("100" + ToWEI).toString());
    assert(await token.balanceOf(users[0].address) == "100" + ToWEI);
    const P2PFUNGIBLEEXCHANGE = await ethers.getContractFactory("AFTERMARKETV2");
    const pfe = await P2PFUNGIBLEEXCHANGE.deploy(await token.address, tokenPrice, 18, 5);
    await pfe.deployed();

    await token.mintTokens(users[1].address, ("150000" + ToWEI).toString());
    //  await token.connect(users[1]).approve(await pfe.address, "1000000000000" + ToWEI);
    // await pfe.connect(users[1]).supplyToken("50" + ToWEI);


    await token.connect(users[1]).transfer(users[4].address, "50" + ToWEI)
    await token.connect(users[4]).approve(await pfe.address, "1000000000000" + ToWEI);
    await pfe.connect(users[4]).supplyToken("50" + ToWEI);

    await token.connect(users[1]).transfer(users[5].address, "50" + ToWEI)
    await token.connect(users[5]).approve(await pfe.address, "1000000000000" + ToWEI);
    await pfe.connect(users[5]).supplyToken("50" + ToWEI);


    await token.connect(users[1]).transfer(users[6].address, "50" + ToWEI)
    await token.connect(users[6]).approve(await pfe.address, "1000000000000" + ToWEI);
    await pfe.connect(users[6]).supplyToken("50" + ToWEI);




    // amountSupplied = await pfe.connect(users[1]).amountSupplied()
    //assert(amountSupplied.toString() == "150" + ToWEI)

    beforeBalance1 = await ethers.provider.getBalance(await users[4].address)
    beforeBalance1 = Number(beforeBalance1.toString())

    beforeBalance2 = await ethers.provider.getBalance(await users[5].address)
    beforeBalance2 = Number(beforeBalance2.toString())

    beforeBalance3 = await ethers.provider.getBalance(await users[6].address)
    beforeBalance3 = Number(beforeBalance3.toString())
    //console.log(await pfe.getSuppliersAmount())

    await pfe.connect(users[8]).fullFillOrderWithFallBack("150" + ToWEI, { value: (tokenPrice * 150).toString() })

    //console.log(await pfe.getSuppliersAmount())

    afterBalance1 = await ethers.provider.getBalance(await users[4].address)
    afterBalance1 = Number(afterBalance1.toString())

    afterBalance2 = await ethers.provider.getBalance(await users[5].address)
    afterBalance2 = Number(afterBalance2.toString())

    afterBalance3 = await ethers.provider.getBalance(await users[6].address)
    afterBalance3 = Number(afterBalance3.toString())


    paymentAmount1 = afterBalance1 - beforeBalance1
    paymentAmount2 = afterBalance2 - beforeBalance2
    paymentAmount3 = afterBalance3 - beforeBalance3
    // console.log(paymentAmount1)
    // console.log(paymentAmount2)
    // console.log(paymentAmount3)


    // await pfe.connect(users[8]).fullFillOrderWithFallBack("150", { value: (tokenPrice * 150).toString() }) 

    // afterBalance = await ethers.provider.getBalance(await users[3].address)
    // afterBalance = Number(afterBalance.toString())

    // paymentAmount = afterBalance - beforeBalance

    // console.log((tokenPrice) * 150)
    // console.log(paymentAmount)







    //assert(paymentAmount==(tokenPrice*10 * 150))













    //  await token.connect(users[9]).mint(("110" + ToWEI).toString());
    //  await token.connect(users[9]).approve(await pfe.address,"1000000000000"+ ToWEI);
    //  await pfe.connect(users[9]).supplyToken("110" + ToWEI);


    //  await token.connect(users[7]).mint(("100" + ToWEI).toString());
    //  await token.connect(users[7]).approve(await pfe.address,"1000000000000"+ ToWEI);
    //  await pfe.connect(users[7]).supplyToken("100" + ToWEI);

    //   s = await pfe.currentSupply()


    //   await pfe.connect(users[6]).fullFillOrderWithFallBack("100" , { value: (tokenPrice * 100).toString() })

    //   await pfe.connect(users[4]).fullFillOrderWithFallBack("50", { value: (tokenPrice * 50).toString() })

    //   await pfe.connect(users[8]).fullFillOrderWithFallBack("100",{value:(tokenPrice*100).toString()})
    //   await pfe.connect(users[2]).fullFillOrderWithFallBack("100", { value: (tokenPrice * 100).toString() })
    //      // s = await pfe.currentSupply()  
    //   await pfe.connect(users[2]).fullFillOrderWithFallBack("10", { value: (tokenPrice * 10).toString() })

    //await pfe.connect(users[4]).fullFillOrderWithFallBack("50",{value:(tokenPrice*50).toString()})
    // await pfe.connect(users[8]).fullFillOrderWithFallBack("100",{value:(tokenPrice*100).toString()})
    // await pfe.connect(users[2]).fullFillOrderWithFallBack("100",{value:(tokenPrice*100).toString()})
    // make sure suppliers are payed correctly
  });




  it("Should Allow suppliers to withdraw", async function () {
    const users = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy(zero_address);
    await token.mintTokens(users[0].address, ("100" + ToWEI).toString());
    assert(await token.balanceOf(users[0].address) == "100" + ToWEI);
    const P2PFUNGIBLEEXCHANGE = await ethers.getContractFactory("AFTERMARKETV2");
    const pfe = await P2PFUNGIBLEEXCHANGE.deploy(await token.address, tokenPrice, 18, 5);
    await pfe.deployed();
    await token.mintTokens(users[1].address, ("100" + ToWEI).toString());
    await token.connect(users[1]).approve(await pfe.address, "1000000000000" + ToWEI);
    await pfe.connect(users[1]).supplyToken("10" + ToWEI);
    await pfe.connect(users[1]).withdrawToken("10" + ToWEI);
    s = await pfe.currentSupply()
    await pfe.connect(users[1]).supplyToken("10" + ToWEI);
    //await pfe.connect(users[3]).fullFillOrderWithFallBack("10",{value:(tokenPrice*10).toString()})

  });

  it("Should Not Mix Supplier Funds", async function () {
    const users = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy(zero_address);
    await token.mintTokens(users[0].address, ("100" + ToWEI).toString());
    assert(await token.balanceOf(users[0].address) == "100" + ToWEI);
    const P2PFUNGIBLEEXCHANGE = await ethers.getContractFactory("AFTERMARKETV2");
    const pfe = await P2PFUNGIBLEEXCHANGE.deploy(await token.address, tokenPrice, 18, 5);
    await pfe.deployed();

    await token.mintTokens(users[1].address, ("150000" + ToWEI).toString());
    //  await token.connect(users[1]).approve(await pfe.address, "1000000000000" + ToWEI);
    // await pfe.connect(users[1]).supplyToken("50" + ToWEI);


    await token.connect(users[1]).transfer(users[4].address, "100" + ToWEI)
    await token.connect(users[4]).approve(await pfe.address, "1000000000000" + ToWEI);
    await pfe.connect(users[4]).supplyToken("100" + ToWEI);

    await token.connect(users[1]).transfer(users[5].address, "500" + ToWEI)
    await token.connect(users[5]).approve(await pfe.address, "1000000000000" + ToWEI);
    await pfe.connect(users[5]).supplyToken("500" + ToWEI);


    await token.connect(users[1]).transfer(users[6].address, "900" + ToWEI)
    await token.connect(users[6]).approve(await pfe.address, "1000000000000" + ToWEI);
    await pfe.connect(users[6]).supplyToken("900" + ToWEI);



    // console.log("USER4 BALANCE", await pfe.connect(users[5]).amountSupplied())
    // amountSupplied = await pfe.connect(users[1]).amountSupplied()
    //assert(amountSupplied.toString() == "150" + ToWEI)

    beforeBalance1 = await ethers.provider.getBalance(await users[4].address)
    beforeBalance1 = Number(beforeBalance1.toString())

    beforeBalance2 = await ethers.provider.getBalance(await users[5].address)
    beforeBalance2 = Number(beforeBalance2.toString())

    beforeBalance3 = await ethers.provider.getBalance(await users[6].address)
    beforeBalance3 = Number(beforeBalance3.toString())
    //console.log(await pfe.getSuppliersAmount())

    await pfe.connect(users[8]).fullFillOrderWithFallBack("150" + ToWEI, { value: (tokenPrice * 150).toString() })

    //console.log(await pfe.getSuppliersAmount())

    afterBalance1 = await ethers.provider.getBalance(await users[4].address)
    afterBalance1 = Number(afterBalance1.toString())

    afterBalance2 = await ethers.provider.getBalance(await users[5].address)
    afterBalance2 = Number(afterBalance2.toString())
    //console.log("USER4 BALANCE", await pfe.connect(users[5]).amountSupplied())

    afterBalance3 = await ethers.provider.getBalance(await users[6].address)
    afterBalance3 = Number(afterBalance3.toString())


    paymentAmount1 = afterBalance1 - beforeBalance1
    paymentAmount2 = afterBalance2 - beforeBalance2
    paymentAmount3 = afterBalance3 - beforeBalance3
  });

});
