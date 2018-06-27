const fs = require('fs');

const MoeCoin = artifacts.require('./MoeCoin.sol');
const MoeCoinFund = artifacts.require('./MoeCoinFund.sol');
const MoeCrowdsale = artifacts.require('./MoeCrowdsale.sol');
const fundParams = JSON.parse(fs.readFileSync('../config/MoeCoinFund.json', 'utf8'));
const crowdsaleParams = JSON.parse(fs.readFileSync('../config/Crowdsale.json', 'utf8'));
const rate = crowdsaleParams.rate;

// FIXME: merge to utils.
function moecoin(n) {
  return new web3.BigNumber(web3.toWei(n, 'ether'));
}

module.exports = function(deployer, network, accounts) {
  const openingTime = crowdsaleParams.openingTime;
  const closingTime = crowdsaleParams.closingTime;
  const actualGoal = web3.toWei(crowdsaleParams.goal, 'ether');
  //const wallet = deployer.deploy(MoeCoinFund, fundParams.owners, fundParams.required);
  //const token = deployer.deploy(MoeCoin);
  //deployer.deploy(MoeCoin);
  //const wallet = accounts[1];
  
  //return deployer
  //  .then(() => {
  //      return deployer.deploy(MoeCoin);
  //  })
  //  .then(() => {
  //      return deployer.deploy(
  //          MoeCrowdsale,
  //          openingTime,
  //          closingTime,
  //          rate.base,
  //          wallet,
  //          MoeCoin.address,
  //          actualCap,
  //          actualTokenCap,
  //          actualGoal,
  //          crowdsaleParams.whiteList
  //      );
  //  });
  //deployer.link(MoeCoin, [MoeCoinFund, MoeCrowdsale]);
  deployer.deploy(MoeCoin).then(() =>
  //  //Set MoeCoin address to token of MoeCrowdsale.
    deployer.deploy(MoeCoinFund, fundParams.owners, fundParams.required).then(() =>
      // Set MoeCoinFund address to wallet of MoeCrowdsale.
      deployer.deploy(MoeCrowdsale, openingTime, closingTime, rate.base, 
        MoeCoinFund.address, MoeCoin.address, actualGoal, crowdsaleParams.whiteList
  )));
};
