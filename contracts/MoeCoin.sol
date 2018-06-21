pragma solidity ^0.4.21;


import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "zeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";


contract MoeCoin is MintableToken, BurnableToken {

  string public constant name = "MoeCoin";

  string public constant symbol = "MOE";

  // same as ether. (1ether=1wei * (10 ** 18))
  uint public constant decimals = 18;

  uint256 public constant INITIAL_SUPPLY = 0;

  constructor() public {
    totalSupply_ = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
    emit Transfer(0x0, msg.sender, INITIAL_SUPPLY);
  }
}
