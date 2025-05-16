// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { AccessControlEnumerable } from "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";

contract MockERC20 is ERC20Burnable, AccessControlEnumerable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    using EnumerableSet for EnumerableSet.Bytes32Set;
    EnumerableSet.Bytes32Set private _rolesSet;
    uint8 private _DECIMALS;

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply_,
        uint8 decimals_
    ) ERC20(name_, symbol_) {
        _DECIMALS = decimals_;
        _rolesSet.add(MINTER_ROLE);

        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());

        _mint(msg.sender, initialSupply_);
    }

    function addMinter(address _minter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, _minter);
    }

    function mint() external onlyMinter {
        _mint(msg.sender, 1000 * 10 ** _DECIMALS);
    }

    function mintTo(address _to, uint256 _amount) external onlyRole(MINTER_ROLE) {
        _mint(_to, _amount);
    }

    function decimals() public view override returns (uint8) {
        return _DECIMALS;
    }

    modifier onlyMinter() {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()) || hasRole(MINTER_ROLE, _msgSender()), "INVALID PERMISSION");
        _;
    }
}
