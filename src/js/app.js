App = {
  web3Provider: null,
  loading: false,
  contracts: {},
  account: '0x0',
  weiRaised: 300,

  init: function() {
    console.log("App initialized...")
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },

  timestampToTime: function(timestamp) {
        var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
        Y = date.getFullYear() + '-';
        M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
        D = date.getDate() + ' ';
        h = date.getHours() + ':';
        m = date.getMinutes() + ':';
        s = date.getSeconds();
        return Y+M+D+h+m+s;
    },

  initContracts: function() {
    $.getJSON("MoeCrowdsale.json", function(moeCrowdsale) {
      App.contracts.MoeCrowdsale = TruffleContract(moeCrowdsale);  
      App.contracts.MoeCrowdsale.setProvider(App.web3Provider);
      App.contracts.MoeCrowdsale.deployed().then(function(moeCrowdsale) {
        console.log("MoeCoin Crowdsale Address: ", moeCrowdsale.address);
      });
    })
    .done(function() {
      $.getJSON("MoeCoinFund.json", function(moeCoinFund) {
        App.contracts.MoeCoinFund = TruffleContract(moeCoinFund);  
        App.contracts.MoeCoinFund.setProvider(App.web3Provider);
        App.contracts.MoeCoinFund.deployed().then(function(moeCoinFund) {
          console.log("MoeCoin Fund Address: ", moeCoinFund.address);
        });
      })
    })
    .done(function() {
        $.getJSON("MoeCoin.json", function(moeCoin) {
          App.contracts.MoeCoin = TruffleContract(moeCoin);  
          App.contracts.MoeCoin.setProvider(App.web3Provider);
          App.contracts.MoeCoin.deployed().then(function(moeCoin) {
            console.log("MoeCoin Token Address: ", moeCoin.address);
          });
      });
      App.listenForEvents();
      return App.render();
    });
  },

  listenForEvents: function() {
    App.contracts.MoeCrowdsale.deployed().then(function(instance) {
      instance.ReceivedEther({}, {
        fromBlock: 0,
        toBlock: 'latest',
      }).watch(function(error, event) {
        console.log("event triggered", event);
        App.render();
      })
    })
  },

  render: function() {
    if(App.loading) {
      return;
    }
    App.loading = true;

    var loader = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();
    
    // Load account data
    web3.eth.getAccounts(function(err, accounts) {
      if(err === null) {
        App.account = accounts[0];
        $('#accountAddress').html("Your Account: " + accounts[0]);
        console.log("The Account: " + accounts);
      }
    });

    App.contracts.MoeCrowdsale.deployed().then(function(instance) {
      moeCrowdsaleInstance = instance;
      return moeCrowdsaleInstance.openingTime();
    }).then(function(openingTime) {
      console.log("openingTime: " + openingTime);
      $('.openingTime').html(App.timestampToTime(openingTime.toNumber()));
      return moeCrowdsaleInstance.closingTime();
    }).then(function(closingTime) {
      console.log("closingTime: " + closingTime);
      $('.closingTime').html(App.timestampToTime(closingTime.toNumber()));
      return moeCrowdsaleInstance.goal();
    }).then(function(goal) {
      console.log("GOAL: " + goal);
      $('.invest-ether').html(App.weiRaised);
      goalEther = web3.fromWei(goal, "ether").toNumber();
      $('.soft-cap').html(web3.fromWei(goal, "ether").toNumber());
      var progressPercent = (Math.ceil(App.weiRaised) / goalEther) * 100;
      $('#progress').css('width', progressPercent + '%');
      App.loading = false;
      loader.hide();
      content.show();
    });
  },

  Invest: function() {
    $('#content').hide();
    $('#loader').show();
    var numberOfEthers = $('#numberOfEthers').val();
    App.contracts.MoeCrowdsale.deployed().then(function(instance) {
      return instance.investorPayEther({
        from: App.account,
        value: web3.toWei(numberOfEthers, "ether"),
        gas: 500000
      });
      //return false;
    }).then(function(result) {
      App.weiRaised = result;
      console.log("Invest MoeCoin..." + App.weiRaised);
      $('form').trigger('reset');
    });
  },
}

$(function() {
  $(window).load(function() {
    App.init();
  })
});
