// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

interface IMarketplace {
  function getMarketplaceFee() external view returns (uint256);

  function getMarketplaceFeeRecipient() external view returns (address);

  function getMarketplaceFeeBps() external view returns (uint256);

  function getMarketplaceFeeRecipientBps() external view returns (uint256);
}
