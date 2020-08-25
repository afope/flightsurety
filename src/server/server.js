import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';
import "babel-polyfill";
import BigNumber from 'bignumber.js';


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

let oracles = [];

let STATUS_CODES = [{
  "label": "STATUS_CODE_UNKNOWN",
  "code": 0
}, {
  "label": "STATUS_CODE_ON_TIME",
  "code": 10
}, {
  "label": "STATUS_CODE_LATE_AIRLINE",
  "code": 20
}, {
  "label": "STATUS_CODE_LATE_WEATHER",
  "code": 30
}, {
  "label": "STATUS_CODE_LATE_TECHNICAL",
  "code": 40
}, {
  "label": "STATUS_CODE_LATE_OTHER",
  "code": 50
}];

let getAccounts = async () => {
    const currentAccounts = await web3.eth.getAccounts();
    return currentAccounts;
}

let getRegistrationFee = async () => {
  let result = await flightSuretyApp.methods.REGISTRATION_FEE().call();
  return result;
}

let getIndexes = async (account) => {
      let returnedIndexes = flightSuretyApp.methods.getMyIndexes().call({ from: account });
      return returnedIndexes;
}

let registerOracles = async (accounts, fee) => { 
  let registeredOracle;
  accounts = accounts.slice(10, 40);
  console.log("!!!!!!!!!accounts", accounts)
  
  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];

    let result = flightSuretyApp.methods.registerOracle().send({
      "from": account,
      "value": fee,
      "gas": 4712388,
      "gasPrice": 100000000000
    });
    registeredOracle = result
    const indexes = await getIndexes(account);
    console.log(`Oracle registered, ${indexes} at ${account}`);
    const statusCode = STATUS_CODES[Math.floor(Math.random() * STATUS_CODES.length)];
    oracles.push({ account, indexes, statusCode });
  }
  return registeredOracle
}

let getOracleReports = async (index, airline, flight, timestamp) => {
    if (oracles.length === 0) return;

  console.log("New request ************************")
  console.log(`index: ${index}, airline: ${airline}, flight: ${flight}, timestamp: ${timestamp}`);

  const relevantOracles = [];
  console.log(`${relevantOracles.length} oracles`);

  oracles.forEach((oracle) => {
      if ( BigNumber(oracle.indexes[0]).isEqualTo(index) ) relevantOracles.push( oracle );
      if ( BigNumber(oracle.indexes[1]).isEqualTo(index) ) relevantOracles.push( oracle );
      if ( BigNumber(oracle.indexes[2]).isEqualTo(index) ) relevantOracles.push( oracle );
  });

  console.log(`${relevantOracles.length} Matching Oracles will respond`);

  relevantOracles.forEach( (oracle) => {
    console.log('oracle'. oracle)
      flightSuretyApp.methods
          .submitOracleResponse(index, airline, flight, timestamp, oracle.statusCode.code)
          .send({ from: oracle.address, gas: 5555555 })
          .then(() => {
              console.log("Oracle responded with " + oracle.statusCode.code);
          })
          .catch((err) => console.log("Oracle response rejected"));
  });
};

(async () => {
  const accounts = await getAccounts()
  console.log('accounts', accounts)

  // get oracle registration fee
  const fee = await getRegistrationFee();
  console.log('fee', fee);

  // register oracle
  const oracle = await registerOracles(accounts, fee);
  console.log('oracle', oracle)
  console.log('oracles', oracles)

    let eventValuesArray;

  flightSuretyApp.events.OracleRequest({fromBlock: 'latest'}, (error, event) => {
    if (error) return console.log(error);
    if (!event.returnValues) return console.error("No returnValues");

      event.returnValues.index,
      event.returnValues.airline,
      event.returnValues.flight,
      event.returnValues.timestamp
      eventValuesArray = Array(event.returnValues.index, event.returnValues.airline, event.returnValues.flight, event.returnValues.timestamp);
      
      async() =>  {
        const flightStatusResponse = await getOracleReports(eventValuesArray[0], eventValuesArray[1], eventValuesArray[2], eventValuesArray[3]);
        console.log('flightStatusRespone', flightStatusResponse) 
      }
 
});

  flightSuretyApp.events.FlightStatusInfo({
    fromBlock: 0
  }, function (error, event) {
    if (error) console.log(error)
    console.log("flight status info event!!!!!!!!")
    console.log(event)
  });

  flightSuretyApp.events.OracleReport({
    fromBlock: 0
  }, function (error, event) {
    if (error) console.log(error)
    console.log("oracle report event!!!!!!!!")
    console.log(event)
  });


  flightSuretyApp.events.InsuranceWithdrawn({
    fromBlock: 0
  }, function (error, event) {
    if (error) console.log(error)
    console.log("insurance withdrawn event event!!!!!!!!")
    console.log(event)
  });


  flightSuretyApp.events.AirlineRegistered({
    fromBlock: 0
  }, function (error, event) {
    if (error) console.log(error)
    console.log("airline registered event!!!!!!!!")
    console.log(event)
  });


  flightSuretyApp.events.FlightInsurancePurchased({
    fromBlock: 0
  }, function (error, event) {
    if (error) console.log(error)
    console.log("flight insurance purchased event!!!!!!!!")
    console.log(event)
  });

flightSuretyApp.events.OracleReport({
  fromBlock: "latest"
}, function (error, event) {
  if (error) console.log(error)
  console.log(event, "event!!!!!!!!")
});

flightSuretyApp.events.FlightStatusInfo({
  fromBlock: "latest"
}, function (error, event) {
  if (error) console.log(error)
  console.log(event,  "event!!!!!!!!")
});

})()

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;


