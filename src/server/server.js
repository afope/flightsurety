import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';
import "babel-polyfill";


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
let flightSuretyData = new web3.eth.Contract(FlightSuretyData.abi, config.appAddress);

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

// // async function initOracles() {
// // return new Promise((resolve, reject) => {
// //   web3.eth.getAccounts().then(accounts => {
// //     //accounts will be an array with all accounts that comes from your Ethereum provider
// //     let fee = flightSuretyApp.methods.REGISTRATION_FEE().call();
// //     let oracles = [];
// //     accounts.forEach(account => {
// //       {
// //         let registeredOracles = flightSuretyApp.methods.registerOracle().send({
// //           "from": account,
// //           "value": fee,
// //           "gas": 4712388,
// //           "gasPrice": 100000000000
// //     }).then(result => {
// //       resolve(result);
// //       console.log(`Oracle registered: ${result} at ${account}`);
// //       oracles.push(result);
// //     }).catch(error => {
// //       reject(error);
// //     })
// //   } 
// //    });
// //  });
// // })
 
// // }

let getAccounts = async () => {
    const currentAccounts = await web3.eth.getAccounts();
    return currentAccounts;
}

;(async () => {
  const accounts = await getAccounts()
  console.log('accounts', accounts)
})()

  let getRegistrationFee = async () => {
    let result = await flightSuretyApp.methods.REGISTRATION_FEE().call();
    return result.toString("binary");
  }

  (async () => {
    try {
      const fee = await getRegistrationFee().toString("binary");
      console.log('fee', fee);
    } catch(e) {
      console.log('error', e);
    }
  })() 





flightSuretyApp.events.OracleRequest({
    fromBlock: 0
  }, function (error, event) {
    if (error) console.log(error)
    console.log(event)
});

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;


