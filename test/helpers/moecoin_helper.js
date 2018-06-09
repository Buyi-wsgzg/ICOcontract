import moment from 'moment';
import moecoin from '../../utils/moecoin.js';
import increaseTime from '../helpers/increaseTime';

const fs = require('fs');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiBigNumber = require('chai-bignumber');

const crowdsaleParams = JSON.parse(fs.readFileSync('./config/Crowdsale.json', 'utf8'));
const fundParams = JSON.parse(fs.readFileSync('./config/MoeCoinFund.json', 'utf8'));

// exports

export const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

export const MoeCoin = artifacts.require('MoeCoin.sol');
export const MoeCoinFund = artifacts.require('MoeCoinFund.sol');
export const MoeCrowdsale = artifacts.require('MoeCrowdsale.sol');
export const cap = crowdsaleParams.cap;
export const tokenCap = crowdsaleParams.tokenCap;
export const rate = crowdsaleParams.rate;
export const goal = new BigNumber(crowdsaleParams.goal);
export const whiteList = crowdsaleParams.whiteList;

export const owners = fundParams.owners;
export const required = fundParams.required; 

// Set time to token sale start time.
export async function setTimingToTokenSaleStart() {
  const now = await Math.floor(Date.now() / 1000);
  const increaseDuration = icoStartTime - now;
  await increaseTime(moment.duration(increaseDuration, 'second'));
}

// Set time to after week4 when token rate is base.
export async function setTimingToBaseTokenRate() {
  await setTimingToTokenSaleStart();
  await increaseTime(moment.duration(3, 'weeks'));
}
