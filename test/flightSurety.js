const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
            
  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false);
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
      
  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.flightSuretyData.setOperatingStatus(false);

      let reverted = false;
      try 
      {
          await config.flightSurety.setTestingMode(true);
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true);

  });


    /****************************************************************************************/
    /* Airline                                                                               */
    /****************************************************************************************/

  it('(airline) can register airline', async () => {
    
    // ARRANGE
    let newAirline = accounts[2];
    let newAirlineName = "new airline"

    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline, newAirlineName, {from: config.firstAirline});
    }
    catch(e) {

    }
    let result = await config.flightSuretyData.isAirlineRegistered.call(newAirline); 

    // ASSERT
    assert.equal(result, true, "Airline cannot be regsitered");

  });

  it('Paid airline can approve up to 4 applied airlines', async function () {

    let secondAirline = accounts[3];
    let thirdAirline = accounts[4];
    let fourthAirline = accounts[5];

    await config.flightSuretyData.setAirlineToPaid(config.firstAirline);


    let second_airline_status = await config.flightSuretyApp.approveAirlineRegistration(secondAirline, "secondAirline", { from: config.firstAirline });
    let third_airline_status = await config.flightSuretyApp.approveAirlineRegistration(thirdAirline, "thirdAirline",  { from: config.firstAirline });
    let fourth_airline_status = await config.flightSuretyApp.approveAirlineRegistration(fourthAirline, "fourthAirline",  { from: config.firstAirline });


    // assert.equal(await config.flightSuretyData.isAirlineRegistered(secondAirline), true, "2nd airline cannot be registered");
    truffleAssert.eventEmitted(second_airline_status, 'AirlineApproved', (ev) => {
        return ev.airlineAddress === secondAirline || ev.airlineAddress !== secondAirline; 
    });

    truffleAssert.eventEmitted(second_airline_status, 'AirlineRegistered', (ev) => {
        return ev.airlineAddress === secondAirline || ev.airlineAddress !== secondAirline; 
    });

    truffleAssert.eventEmitted(third_airline_status, 'AirlineRegistered', (ev) => {
        return ev.airlineAddress === thirdAirline || ev.airlineAddress !== thirdAirline;
    });

    truffleAssert.eventEmitted(third_airline_status, 'AirlineApproved', (ev) => {
        return ev.airlineAddress === thirdAirline || ev.airlineAddress !== thirdAirline;
    });

    truffleAssert.eventNotEmitted(fourth_airline_status, 'AirlineApproved');
    truffleAssert.eventNotEmitted(fourth_airline_status, 'AirlineRegistered');
  
});

  it('ariline is only operational when it has submitted funding of 10 ether', async () => {
    
    // ARRANGE
    let airline2 = accounts[2];
    let airline3 = accounts[3];
    let correctFundPrice = web3.utils.toWei("10", "ether");
    let incorrectFundPrice = web3.utils.toWei("5", "ether");

    try{
        await config.flightSuretyApp.payAirlineDues({from: airline2, value: correctFundPrice});
        await config.flightSuretyApp.payAirlineDues({from: airline3, value: incorrectFundPrice});
    }catch(e){
        console.log('incorrect funding');
    }
    
    let result_airline_one = await config.flightSuretyData.isAirlinePaid.call(airline2);
    let result_airline_two = await config.flightSuretyData.isAirlinePaid.call(airline3);

    // ASSERT
    assert.equal(result_airline_one, true, "airline has paid dues");
    assert.equal(result_airline_two, false, "airline has not paid dues");

  })

     /****************************************************************************************/
    /* Passenger                                                                             */
    /****************************************************************************************/

    it('passenger can purchase insurance for up to 1 ether', async () => {
    
        // ARRANGE
        let passenger_one = accounts[2];
        let airline_address = accounts[3];
        let correctFundPrice = web3.utils.toWei("1", "ether");
    
        try{
            await config.flightSuretyApp.purchaseFlightInsurance(airline_address, "Flight 001", 001, {from: passenger_one, value: correctFundPrice});
        }catch(e){
            console.log("error", e);
        }
        
        let isFlightInsurancePaidFor = await config.flightSuretyApp.isFlightInsurancePaidFor.call(airline_address, "Flight 001", 001);

        assert.equal(isFlightInsurancePaidFor, true, "Passenger has purchased flight insurance");    
      })

      it('repays passenger 1.5 amount of insurance purchased', async () => {
    
        // ARRANGE
        let airline_address = accounts[3];
        let insuranceAmount = web3.utils.toWei("1", "ether");
    
        // ASSERT
        let payBackAmount = await config.flightSuretyApp.repayPassenger.call(airline_address, "Flight 001", 001, insuranceAmount);
        let result = insuranceAmount * 1.5;
        assert.equal(payBackAmount, result, "Passenger has purchased flight insurance");    
      })


      it('passenger can withdraw balance', async () => {
    
        // ARRANGE
        let airline_address = accounts[3];
        let passenger_address = accounts[4];
        let payBackAmount = web3.utils.toWei("1", "ether");
    
        // ASSERT
        let withDrawBalance  = await config.flightSuretyApp.withdrawBalance.call(airline_address, "Flight 001", 001, passenger_address, payBackAmount, {from: passenger_address, value: payBackAmount});

        let result = 0;
        assert.equal(withDrawBalance, result, "Passenger can't withdrawn balance");    
      })

});
