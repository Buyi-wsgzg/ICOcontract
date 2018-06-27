pragma solidity ^0.4.21;

import "./MultiSigWallet.sol";

contract MoeCoinFund is MultiSigWallet {
  
  constructor(address[] _owners, uint _required) public
  MultiSigWallet(_owners, _required)
  {
  }
}
