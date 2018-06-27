pragma solidity ^0.4.21;


//import "zeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol";
//import "zeppelin-solidity/contracts/crowdsale/validation/WhitelistedCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/price/IncreasingPriceCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/distribution/RefundableCrowdsale.sol";
import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "./WhitelistedCrowdsale.sol";
import "./MoeCoin.sol";


/**
 * The Crowdsale contract of MoeCoin project.
*/
contract MoeCrowdsale is RefundableCrowdsale, MintedCrowdsale, WhitelistedCrowdsale {

  /*
  * Token exchange rates of ETH and MOECOIN.
  */
  uint256 constant RATE_PER_ONEDAY = 1;

  event ReceivedEther(address purchaser, uint256 amount, uint256 raised);

  constructor(
    uint256 _openingTime,
    uint256 _closingTime,
    uint256 _baseRate,
    address _wallet,
    MintableToken _token,
    uint256 _goal,
    address[] _whiteList
  )
  Crowdsale(_baseRate, _wallet, _token)
  RefundableCrowdsale(_goal)
  WhitelistedCrowdsale(_whiteList)
  TimedCrowdsale(_openingTime, _closingTime)
  {
  }

  // Custom rate.
  //
  // This is created to compatible PR below:
  // - https://github.com/OpenZeppelin/zeppelin-solidity/pull/317
  function getCurrentRate() public view returns (uint256) {
    // `now` is the alias of `block.timestamp`
    // - https://github.com/OpenZeppelin/zeppelin-solidity/issues/350
    // solium-disable-next-line security/np-block-members
    //uint256 timeTick = block.timestamp.sub(openingTime);
    uint256 timeTick = now.sub(openingTime);
    uint256 co = timeTick.div(1 days);
    return rate.sub(co.mul(RATE_PER_ONEDAY));
  }

  /*
   * @dev Investor invest MoeCoin by paying ether in wei. 
   * @param _value The value in wei that the investor pays ether.
   * @return The current MoeCoin ICO raised amount.
   */
  function investorPayEther(address _purchaser, uint256 _value) public payable returns (uint256) {
    //require(msg.value != 0);
    //require(msg.sender != address(0));
    //uint256 weiAmount = msg.value;
    //
    //weiRaised = weiRaised.add(weiAmount);
    //emit ReceivedEther(msg.sender, weiAmount, weiRaised);
    require(_purchaser != address(0));
    require(_value != 0);
    
    weiRaised = weiRaised.add(_value);
    emit ReceivedEther(_purchaser, _value, weiRaised);
    return weiRaised; 
  }

  /**
   * @dev Overrides parent method taking into account variable rate.
   * @param _weiAmount The value in wei to be converted into tokens.
   * @return The number of tokens _weiAmount wei will buy at preset time.
   */
  function _getTokenAmount(uint256 _weiAmount) internal view returns (uint256) {
    uint256 currentRate = getCurrentRate();
    return currentRate.mul(_weiAmount);
  }
}
