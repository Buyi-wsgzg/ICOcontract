import moecoin from '../utils/moecoin';
import ether from './helpers/ether';
import advanceBlock from './helpers/advanceToBlock';
import { increaseTimeTo, duration } from './helpers/increaseTime'
import latestTime from './helpers/latestTime';
import EVMRevert from './helpers/EVMRevert'
import EVMThrow from './helpers/EVMThrow'

import { whiteList, owners, required } from './helpers/moecoin_helper'
const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const MoeCrowdsale = artifacts.require('MoeCrowdsale.sol');
const MoeCoin = artifacts.require('MoeCoin.sol');
const MoeCoinFund = artifacts.require('MoeCoinFund.sol');
const RefundVault = artifacts.require('RefundVault.sol')

contract('MoeCrowdsale', function ([owner, wallet, investor]) {
  const RATE = new BigNumber(10);
  //const INITIAL_RATE = new BigNumber(10);
  //const FINAL_RATE = new BigNumber(15);
  const GOAL = ether(10);
  const CAP = ether(20);
  const capTokenCap = ether(300);

  before(async function () {
    await advanceBlock();
  });

  beforeEach(async function () {
    this.openingTime = latestTime() + duration.weeks(1);
    this.closingTime = this.openingTime + duration.weeks(1);
    this.afterClosingTime = this.closingTime + duration.seconds(1);

    this.token = await MoeCoin.new({ from : owner });
    this.wallet = await MoeCoinFund.new(this.openingTime, { from : owner });
    this.crowdsale = await MoeCrowdsale.new(
        this.openingTime, 
        this.closingTime, 
        RATE,
        //INITIAL_RATE, 
        //FINAL_RATE,
        this.wallet.address, 
        this.token.address, 
        CAP, 
        capTokenCap, 
        GOAL,
        whiteList 
    );

    await this.token.transferOwnership(this.crowdsale.address);
    await this.wallet.transferOwnership(this.crowdsale.address);
  });
  
  it('should create crowdsale with correct parameter', async function () {
    this.crowdsale.should.exist;
    this.token.should.exist;
    this.wallet.should.exist;

    const openingTime = await this.crowdsale.openingTime();
    const closingTime = await this.crowdsale.closingTime();
    const rate = await this.crowdsale.rate();
    //const initialRate = await this.crowdsale.initialRate();
    //const finalRate = await this.crowdsale.finalRate();
    const walletAddress = await this.crowdsale.wallet();
    const goal = await this.crowdsale.goal();
    const cap = await this.crowdsale.cap();

    openingTime.should.be.bignumber.equal(this.openingTime);
    closingTime.should.be.bignumber.equal(this.closingTime);
    rate.should.be.bignumber.equal(RATE);
    //initialRate.should.be.bignumber.equal(INITIAL_RATE);
    //finalRate.should.be.bignumber.equal(FINAL_RATE);
    walletAddress.should.be.bignumber.equal(this.wallet.address);
    goal.should.be.bignumber.equal(GOAL);
    cap.should.be.bignumber.equal(CAP);
  });

  it('should be token owner', async function () {
    const crowd_owner = await this.token.owner();
    crowd_owner.should.be.bignumber.equal(this.crowdsale.address);
  });

  it('should not accept payments before start', async function () {
    await this.crowdsale.send(ether(1)).should.be.rejectedWith(EVMRevert);
    await this.crowdsale.buyTokens(investor, { from: investor, value: ether(1) }).should.be.rejectedWith(EVMRevert);
  });

  it('should accept payments during the sale', async function () {
    const investmentAmount = ether(1);
    const expectedTokenAmount = RATE.mul(investmentAmount);

    await increaseTimeTo(this.openingTime);
    await this.crowdsale.buyTokens(investor, { from: investor, value: investmentAmount }).should.be.fulfilled;

    (await this.token.balanceOf(investor)).should.be.bignumber.equal(expectedTokenAmount);
    (await this.token.totalSupply()).should.be.bignumber.equal(expectedTokenAmount);
  });

  it('should reject payments after end', async function () {
    await increaseTimeTo(this.afterClosingTime);
    await this.crowdsale.send(ether(1)).should.be.rejectedWith(EVMRevert);
    await this.crowdsale.buyTokens(investor, { value : ether(1), from: investor }).should.be.rejectedWith(EVMRevert);
  });

  it('should reject payments over cap', async function () {
    await increaseTimeTo(this.openingTime);
    await this.crowdsale.send(CAP);
    await this.crowdsale.send(1).should.be.rejectedWith(EVMRevert);
  });

  it('should have different rate over time', async function () {
    await increaseTimeTo(this.openingTime);
    const expect = RATE;
    const actual = await this.crowdsale.getCurrentRate();
    await actual.should.be.bignumber.equal(expect);
  });
    
  it('should have different rate over 3 days', async function () {
    await increaseTimeTo(this.openingTime + duration.days(3));
    const expect = RATE.sub(3);
    const actual = await this.crowdsale.getCurrentRate();
    await actual.should.be.bignumber.equal(expect);
  });
});
