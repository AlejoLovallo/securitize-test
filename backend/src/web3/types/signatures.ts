export const LIST_ITEM_SIGNATURE = {
  ListItem: [
    { name: 'tokenAddress', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'price', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
}

export const PURCHASE_ITEM_SIGNATURE = {
  PurchaseItem: [
    { name: 'itemId', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
}

export const WITHDRAW_SIGNATURE = {
  WithdrawFunds: [
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
}
