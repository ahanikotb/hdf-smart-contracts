//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC20 {
    function transfer(address to, uint256 tokens) external returns (bool);

    function mintTokens(address to, uint256 amount) external;

    function transferFrom(
        address from,
        address to,
        uint256 tokens
    ) external returns (bool);
}

contract AFTERMARKETV2 {
    struct Supply {
        uint256 amount;
        address supplierAddress;
    }
    mapping(address => uint256) public supplierToIndex;
    mapping(uint256 => address) public indexToSupplier;
    uint256[] supplyList;
    uint256 public currentSupply;
    IERC20 immutable targetToken;
    uint256 public price;
    address public manager;
    uint256 private tokenDecimals;
    uint256 private housePercentage;

    constructor(
        address _targetToken,
        uint256 _price,
        uint256 _tokenDecimals,
        uint256 _housePercentage
    ) {
        targetToken = IERC20(_targetToken);
        tokenDecimals = _tokenDecimals;
        price = _price;
        manager = msg.sender;
        housePercentage = _housePercentage;
    }

    modifier onlyManager() {
        require(msg.sender == manager);
        _;
    }

    function amountSupplied() public view returns (uint256) {
        uint256 supplierIndex = supplierToIndex[msg.sender];
        require(
            indexToSupplier[supplierIndex] == msg.sender,
            "You Dont Have Any Tokens Supplied"
        );
        return supplyList[supplierIndex] * 10**tokenDecimals;
    }

    function changeManager(address newManager) public onlyManager {
        manager = newManager;
    }

    function updatePrice(uint256 newPrice) public onlyManager {
        price = newPrice;
    }

    function supplyToken(uint256 supplyAmount) public {
        require(supplyAmount != 0);
        require(
            targetToken.transferFrom(msg.sender, address(this), supplyAmount),
            "TRANSFER FAILED"
        );
        supplyList.push(supplyAmount / 10**tokenDecimals);
        currentSupply += supplyAmount / 10**tokenDecimals;
        supplierToIndex[msg.sender] = (supplyList.length - 1);
        indexToSupplier[(supplyList.length - 1)] = msg.sender;
    }

    function withdrawToken(uint256 withdrawAmount) public {
        uint256 supplierIndex = supplierToIndex[msg.sender];
        require(
            indexToSupplier[supplierIndex] == msg.sender,
            "You Dont Have Any Tokens Supplied"
        );
        require(
            targetToken.transfer(
                indexToSupplier[supplierIndex],
                withdrawAmount
            ),
            "transfer failed"
        );
        supplyList[supplierIndex] -= withdrawAmount / 10**tokenDecimals;
        if (supplyList[supplierIndex] == 0) {
            _removeSupplier(supplierIndex);
        }
        currentSupply -= withdrawAmount / 10**tokenDecimals;
    }

    function _removeSupplier(uint256 index) private {
        for (uint256 i = index; i < supplyList.length - 1; i++) {
            supplyList[i] = supplyList[i + 1];
            indexToSupplier[i] = indexToSupplier[i + 1];
            supplierToIndex[indexToSupplier[i]] = i;
        }
        supplyList.pop();
    }

    function _paySuppliers(uint256 amount) private {
        uint256 fullfilled;
        uint256 i = 0;
        uint256 leftTofullfill = amount;
        while (fullfilled != amount) {
            Supply memory _currentSupplier = Supply(
                supplyList[i],
                indexToSupplier[i]
            );
            if (leftTofullfill < _currentSupplier.amount) {
                uint256 amountNeeded = leftTofullfill;
                currentSupply -= amountNeeded;
                supplyList[i] -= amountNeeded;
                leftTofullfill -= amountNeeded;
                fullfilled += amountNeeded;
                uint256 payout = amountNeeded * price;
                (bool sup, ) = payable(_currentSupplier.supplierAddress).call{
                    value: (payout * housePercentage) / 100
                }("");
                require(sup, "Transfer failed.");
                (bool house, ) = payable(_currentSupplier.supplierAddress).call{
                    value: (payout * (100 - housePercentage)) / 100
                }("");
                require(house, "Transfer failed.");
            } else {
                uint256 amountFullfillable = _currentSupplier.amount;
                leftTofullfill -= _currentSupplier.amount;
                currentSupply -= _currentSupplier.amount;
                _removeSupplier(0);
                fullfilled += _currentSupplier.amount;
                uint256 payout = amountFullfillable * price;

                (bool sup, ) = payable(_currentSupplier.supplierAddress).call{
                    value: (payout * housePercentage) / 100
                }("");
                require(sup, "Transfer failed.");
                (bool house, ) = payable(_currentSupplier.supplierAddress).call{
                    value: (payout * (100 - housePercentage)) / 100
                }("");
                require(house, "Transfer failed.");
            }
        }
    }

    function getSuppliersAmount() public view returns (uint256) {
        return supplyList.length;
    }

    function fullfillOrder(uint256 _amount) private {
        require(_amount <= currentSupply, "not Enough Supply");
        //        require(amount * price >= msg.value, "not Enough Payed");
        require(targetToken.transfer(msg.sender, _amount), "not enough tokens");
        _paySuppliers(_amount);
    }

    //we will always fullfill with this function
    function fullFillOrderWithFallBack(uint256 _amount) public payable {
        uint256 amount = _amount / 10**tokenDecimals;
        require(amount * price == msg.value, "not Enough Payed");
        if (amount <= currentSupply) {
            fullfillOrder(amount);
        } else {
            uint256 externalAmount = amount - currentSupply;
            if (currentSupply != 0) {
                fullfillOrder(currentSupply);
            }
            (bool success, ) = payable(manager).call{
                value: externalAmount * price
            }("");
            require(success, "Transfer failed.");
            targetToken.mintTokens(msg.sender, externalAmount * 10**18);
        }
    }
}
