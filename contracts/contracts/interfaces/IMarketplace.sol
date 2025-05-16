// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

interface ISecuritizeMarketplace {
    // Struct to represent a listed item
    struct ListedItem {
        address token;
        address seller;
        uint256 amount;
        uint256 price;
        bool active;
    }

    struct Seller {
        uint256 activeListedItems;
        uint256 totalSoldItems;
        uint256 totalListedItems;
        uint256 pendingWithdrawals;
        uint256 balance;
        uint256 signedNonce;
        bool active;
    }

    // docs
    event Initialized(address indexed owner);
    // Event emitted when a new item is listed for sale
    event ItemListed(address indexed token, address indexed seller, uint256 amount, uint256 price);
    // Event emitted when a new seller is registered
    event SellerRegistered(address indexed seller);
    // Event emitted when an item is purchased
    event ItemPurchased(address indexed buyer, address indexed token, uint256 amount, uint256 price);
    // Event emitted when funds are withdrawn
    event FundsWithdrawn(address indexed seller, uint256 amount);

    /**************************** ERRORS  ****************************/

    error InvalidToken(address token);

    error InvalidItemAmount(address token, uint256 amount);
    error InvalidItemPrice(address token, uint256 price);

    error TokenTransferError(address token, uint256 amount);

    error InvalidListingBatchLengths(uint256 tokensLength, uint256 pricesLength, uint256 amountsLength);
    error InvalidItemId(uint256 listingId);
    error InactiveItem(uint256 listingId, address token);
    error InvalidPayment(address token, uint256 price, uint256 valueSent);
    error InvalidBuyer(address seller, address token);
    error NoEarningsToWithdraw(address seller);
    error EarningsTransferError(address seller, uint256 amount);
    error InvalidPreListDeadline(uint256 deadline);
    error InvalidSignature(address signer, address expectedSigner);
}
