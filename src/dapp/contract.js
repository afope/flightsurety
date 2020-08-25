import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];

        const STATUS_CODE_UNKNOWN = 0;
        const STATUS_CODE_ON_TIME = 10;
        const STATUS_CODE_LATE_AIRLINE = 20;
        const STATUS_CODE_LATE_WEATHER = 30;
        const STATUS_CODE_LATE_TECHNICAL = 40;
        const STATUS_CODE_LATE_OTHER = 50;
        this.STATUS_CODES = Array(STATUS_CODE_UNKNOWN, STATUS_CODE_ON_TIME, STATUS_CODE_LATE_AIRLINE, STATUS_CODE_LATE_WEATHER, STATUS_CODE_LATE_TECHNICAL, STATUS_CODE_LATE_OTHER);

    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
           
            this.owner = accts[0];

            let counter = 1;
            
            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            callback();
        });
    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    fetchFlightStatus(flight, callback) {
        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                console.log('result', result)
                callback(error, payload);
            });
        }

    updateFlightStatus(index, flightName, callback) {
        let self = this;
        let payload = {
            index: index,
            airlineAddress: self.airlines[0],
            flightName: flightName,
            timestamp: Math.floor(Date.now() / 1000),
            statusCode: self.STATUS_CODES[Math.floor(Math.random()*self.STATUS_CODES.length)],
        } 

        self.flightSuretyApp.methods
            .submitOracleResponse(payload.index, payload.airlineAddress, payload.flightName, payload.timestamp, payload.statusCode)
            .send({ from: self.owner}, (error, result) => {
                console.log('result', result)
                callback(error, payload);
            });
        }
    

    purchaseFlightInsurance(flightName, amount, callback) {
        let self = this;
        let payload = {
            airlineAddress: self.airlines[3],
            flightName: flightName,
            timestamp: Math.floor(Date.now() / 1000),
        } 
        self.flightSuretyApp.methods
            .purchaseFlightInsurance(payload.airlineAddress, payload.flightName, payload.timestamp)
            .send({ from: self.owner, value: this.web3.utils.toWei(amount.toString(), 'ether')}, (error, result) => {
                 console.log('result', result)
                callback(error, payload);
            });
    }

    withdrawBalance(flightName, callback) {
        let self = this;
        let payload = {
            airlineAddress: self.airlines[2],
            flightName: flightName,
            timestamp: Math.floor(Date.now() / 1000),
            passengerAddress: self.passengers[1]
        } 
        self.flightSuretyApp.methods
            .withdrawBalance(payload.airlineAddress, payload.flightName, payload.timestamp, payload.passengerAddress)
            .send({ from: self.owner}, (error, result) => {
                console.log('result', result)
                callback(error, payload);
            });
    }
}