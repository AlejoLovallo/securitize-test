// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { EIP712 } from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import { Address } from "@openzeppelin/contracts/utils/Address.sol";

import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { ISecuritizeMarketplace } from "./interfaces/IMarketplace.sol";

contract SecuritizeMarketplace is ISecuritizeMarketplace, Context, ReentrancyGuard, EIP712 {
    using ECDSA for bytes32;
    using Address for address;

    using EnumerableSet for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.AddressSet;

    // Mapping to store listed items
    mapping(uint256 listId => ListedItem items) public listedItems;
    mapping(address user => Seller seller) public sellers;

    // Items tracker
    uint256 private _currentListId;
    EnumerableSet.UintSet private _itemsSet;

    bytes32 private constant PRE_LIST_TYPEHASH =
        keccak256("Prelist(address tokenAddress,uint256 priceInWei,uint256 amount,uint256 nonce, uint256 deadline)");

    constructor() EIP712("SecuritizeMarketplace", "1") {
        emit Initialized(_msgSender());
    }

    /**************************** GETTERS  ****************************/

    /**************************** INTERFACE  ****************************/

    /**
     * @dev List an item for sale
     * @param token The address of the ERC20 token to be listed
     * @param price The price of the item in WEI
     * @param amount The amount of tokens to list
     */
    function listItem(address token, uint256 price, uint256 amount) external nonReentrant {
        _checkItem(token, price, amount);

        bool success = IERC20(token).transferFrom(_msgSender(), address(this), amount);

        if (!success) {
            revert TokenTransferError(token, amount);
        }

        ListedItem memory item = ListedItem({
            token: token,
            seller: _msgSender(),
            amount: amount,
            price: price,
            active: true
        });
        listedItems[_currentListId] = item;

        // Add the item to the set
        _itemsSet.add(_currentListId);
        // Increment the list ID for the next item
        _currentListId++;

        // Update the seller's information
        if (!sellers[_msgSender()].active) {
            sellers[_msgSender()] = Seller({
                activeListedItems: 1,
                totalListedItems: 1,
                totalSoldItems: 0,
                pendingWithdrawals: 0,
                balance: 0,
                signedNonce: 0,
                active: true
            });
            emit SellerRegistered(_msgSender());
        } else {
            sellers[_msgSender()].activeListedItems++;
            sellers[_msgSender()].totalListedItems++;
        }

        emit ItemListed(token, _msgSender(), amount, price);
    }

    /**
     * @dev List multiple items for sale
     * @param tokens The addresses of the ERC20 tokens to be listed
     * @param prices The prices of the items in WEI
     * @param amounts The amounts of tokens to list
     */
    function listBatchItems(
        address[] memory tokens,
        uint256[] memory prices,
        uint256[] memory amounts
    ) external nonReentrant {
        if (tokens.length != prices.length || tokens.length != amounts.length) {
            revert InvalidListingBatchLengths(tokens.length, prices.length, amounts.length);
        }

        for (uint256 i = 0; i < tokens.length; i++) {
            _checkItem(tokens[i], prices[i], amounts[i]);

            bool success = IERC20(tokens[i]).transferFrom(_msgSender(), address(this), amounts[i]);

            if (!success) {
                revert TokenTransferError(tokens[i], amounts[i]);
            }

            ListedItem memory item = ListedItem({
                token: tokens[i],
                seller: _msgSender(),
                amount: amounts[i],
                price: prices[i],
                active: true
            });
            listedItems[_currentListId] = item;

            // Add the item to the set
            _itemsSet.add(_currentListId);
            // Increment the list ID for the next item
            _currentListId++;

            emit ItemListed(tokens[i], _msgSender(), amounts[i], prices[i]);
        }

        // Update the seller's information
        if (!sellers[_msgSender()].active) {
            sellers[_msgSender()] = Seller({
                activeListedItems: tokens.length,
                totalListedItems: tokens.length,
                totalSoldItems: tokens.length,
                pendingWithdrawals: 0,
                balance: 0,
                signedNonce: 0,
                active: true
            });
            emit SellerRegistered(_msgSender());
        } else {
            sellers[_msgSender()].activeListedItems++;
            sellers[_msgSender()].totalListedItems++;
        }
    }

    /**
     * @dev Purchase an item
     * @param itemId The ID of the item to be purchased
     */
    function purchaseItem(uint256 itemId) external payable nonReentrant {
        _checkBuyer(_msgSender(), itemId);

        ListedItem memory item = listedItems[itemId];

        // Transfer the tokens to the buyer
        bool success = IERC20(item.token).transfer(_msgSender(), item.amount);

        if (!success) {
            revert TokenTransferError(item.token, item.amount);
        }

        // Update the seller's information
        sellers[item.seller].activeListedItems--;
        sellers[item.seller].totalSoldItems++;
        sellers[item.seller].balance += msg.value;
        sellers[item.seller].pendingWithdrawals += msg.value;

        // Mark the item as inactive
        item.active = false;

        emit ItemPurchased(_msgSender(), item.token, item.amount, item.price);
    }

    /**
     * @dev Withdraw funds from the marketplace
     */
    function withdrawFunds() external nonReentrant {
        if (sellers[_msgSender()].pendingWithdrawals == 0) {
            revert NoEarningsToWithdraw(_msgSender());
        }

        uint256 amount = sellers[_msgSender()].pendingWithdrawals;

        (bool success, ) = _msgSender().call{ value: amount }("");
        if (!success) {
            revert EarningsTransferError(_msgSender(), amount);
        }

        emit FundsWithdrawn(_msgSender(), amount);
    }

    /**
     * @dev Pre-list an item for sale
     * @param signature The signature of the seller
     * @param seller The address of the seller
     * @param token The address of the ERC20 token to be listed
     * @param amount The amount of tokens to list
     * @param price The price of the item in WEI
     * @param deadline The deadline of the pre-listing
     */
    function preListItem(
        bytes calldata signature,
        address seller,
        address token,
        uint256 amount,
        uint256 price,
        uint256 deadline
    ) external {
        _checkItem(token, price, amount);

        if (!sellers[seller].active) {
            sellers[seller] = Seller({
                activeListedItems: 0,
                totalSoldItems: 0,
                totalListedItems: 0,
                pendingWithdrawals: 0,
                balance: 0,
                signedNonce: 0,
                active: true
            });
            emit SellerRegistered(seller);
        }

        if (deadline < block.timestamp) {
            revert InvalidPreListDeadline(deadline);
        }

        uint256 nonce = sellers[seller].signedNonce;

        _verifySignature(seller, token, amount, price, nonce, deadline, signature);

        sellers[seller].signedNonce++;

        bool success = IERC20(token).transferFrom(_msgSender(), address(this), amount);

        if (!success) {
            revert TokenTransferError(token, amount);
        }

        ListedItem memory item = ListedItem({
            token: token,
            seller: seller,
            amount: amount,
            price: price,
            active: true
        });
        listedItems[_currentListId] = item;

        // Add the item to the set
        _itemsSet.add(_currentListId);
        // Increment the list ID for the next item
        _currentListId++;

        sellers[seller].activeListedItems++;
        sellers[seller].totalListedItems++;

        emit ItemListed(token, seller, amount, price);
    }

    // View domain separator
    function getDomainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    /**************************** INTERNAL  ****************************/

    /**
     * @dev Check if the token to sold is valid
     * @param token The address of the ERC20 token to be listed
     * @param price The price of the item in WEI
     * @param amount The amount of tokens to list
     */
    function _checkItem(address token, uint256 price, uint256 amount) internal view {
        _checkERC20(token);

        if (price == 0) {
            revert InvalidItemPrice(token, price);
        }
        if (amount == 0) {
            revert InvalidItemAmount(token, amount);
        }
    }

    /**
     * @dev Check if the token is a valid ERC20 token
     * @param token The address of the ERC20 token to be listed
     */
    function _checkERC20(address token) internal view {
        bytes4[2] memory selectors = [
            bytes4(keccak256("transfer(address,uint256)")),
            bytes4(keccak256("transferFrom(address,address,uint256)"))
        ];

        for (uint i = 0; i < selectors.length; i++) {
            (bool success, ) = token.staticcall(abi.encodeWithSelector(selectors[i], address(0), 0));
            if (!success) {
                revert InvalidToken(token);
            }
        }
    }

    /**
     * @dev Check if the buyer is valid
     * @param buyer The address of the buyer
     * @param listingId The ID of the item to be purchased
     */
    function _checkBuyer(address buyer, uint256 listingId) internal view {
        if (listingId >= _currentListId) {
            revert InvalidItemId(listingId);
        }

        ListedItem memory item = listedItems[listingId];

        if (!item.active) {
            revert InactiveItem(listingId, item.token);
        }

        if (msg.value != item.price) {
            revert InvalidPayment(item.token, item.price, msg.value);
        }
        if (item.seller == buyer) {
            revert InvalidBuyer(buyer, item.token);
        }
    }

    /**
     * @dev Verify pre listing signature
     * @param seller The address of the seller
     * @param token The address of the ERC20 token to be listed
     * @param amount The amount of tokens to list
     * @param price The price of the item in WEI
     * @param nonce The nonce of the seller
     * @param deadline The deadline of the pre listing
     */
    function _verifySignature(
        address seller,
        address token,
        uint256 amount,
        uint256 price,
        uint256 nonce,
        uint256 deadline,
        bytes calldata signature
    ) internal view {
        bytes32 structHash = keccak256(abi.encode(PRE_LIST_TYPEHASH, seller, token, amount, price, nonce, deadline));
        bytes32 digest = _hashTypedDataV4(structHash);

        address signer = ECDSA.recover(digest, signature);
        if (signer != seller) {
            revert InvalidSignature(signer, seller);
        }
    }
}
