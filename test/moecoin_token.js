import { MoeCoin } from './helpers/moecoin_helper';
import decodeLogs from './helpers/decodeLogs';

contract('MoeCoin', (accounts) => {
  let token;
  const creator = accounts[0];

  beforeEach(async () => {
    token = await MoeCoin.new({ from: creator });
  });

  describe('initialized correctly', () => {
    it('should be correct token name', async () => {
      const expect = 'MoeCoin';
      const actual = await token.name();
      actual.should.be.equal(expect);
    });

    it('should be correct token symbol', async () => {
      const expect = 'MOE';
      const actual = await token.symbol();
      actual.should.be.equal(expect);
    });

    it('should be correct token decimals', async () => {
      const expect = 18;
      const actual = await token.decimals();
      actual.toNumber().should.be.equal(expect);
    });

    it('should be same decimals of ether', async () => {
      const expect = web3.toWei(1, 'ether');
      const tokenDecimals = await token.decimals();
      const actual = new web3.BigNumber(1 * (10 ** tokenDecimals));
      actual.toNumber().should.be.bignumber.equal(expect);
    });

    it('assigns the initial total supply to the creator', async function () {
      const totalSupply = await token.totalSupply();
      const creatorBalance = await token.balanceOf(creator);
    
      assert(creatorBalance.eq(totalSupply));
    
      const receipt = web3.eth.getTransactionReceipt(token.transactionHash);
      const logs = decodeLogs(receipt.logs, MoeCoin, token.address);
      assert.equal(logs.length, 1);
      assert.equal(logs[0].event, 'Transfer');
      assert.equal(logs[0].args.from.valueOf(), 0x0);
      assert.equal(logs[0].args.to.valueOf(), creator);
      assert(logs[0].args.value.eq(totalSupply));
    });

  });

});
