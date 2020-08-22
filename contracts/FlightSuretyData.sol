pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false
    mapping(address => uint256) private authorizedCaller;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
                                (
                                ) 
                                public 
    {
        contractOwner = msg.sender;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }
    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    // events
    event AuthorizedContract(address authContract);


    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() 
                            public 
                            view 
                            returns(bool) 
    {
        return operational;
    }

 // ------------------- Get and Set function for totalpaidairlines -------------------------

    function setTotalPaidAirlines(address airlineAddress) requireIsOperational private {
        totalPaidAirlines.push(airlineAddress);
    }
    function getTotalPaidAirlines() external requireIsOperational returns(uint){
        return totalPaidAirlines.length;
    }

    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus
                            (
                                bool mode
                            ) 
                            external
                            requireContractOwner 
    {
        operational = mode;
    }

     function authorizeCaller
                            (
                                address contractAddress
                            )
                            external
                            requireContractOwner
    {
        authorizedCaller[contractAddress] = 1;
        emit AuthorizedContract(contractAddress);
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/


    /********************************************************************************************/
    /*                                     AIRLINE                                              */
    /********************************************************************************************/

    struct Airline {
        address airlineAddress;
        string airlineName;
        bool isRegistered;
        bool isApproved;
        bool isPaid;
    }


    // airline mappings
    mapping(address => Airline) airlines;
    mapping(address => uint) private voteCount;
    address[] totalPaidAirlines = new address[](0);

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline
                            (   
                                address airlineAddress,
                                string airlineName
                            )
                            requireIsOperational
                            external
    {
        airlines[airlineAddress] = Airline({
            airlineAddress: airlineAddress, 
            airlineName: airlineName,
            isRegistered: true,
            isApproved: false,
            isPaid: false
        });
        setTotalPaidAirlines(airlineAddress);
    }



    function isAirlineRegistered
                            (
                                address airlineAddress
                            )
                            external
                            requireIsOperational
                            returns(bool)
    {
        require(airlineAddress != address(0), "'account' must be a valid address.");
        return airlines[airlineAddress].isRegistered;
    }

    function isAirlineApproved
                            (
                                address airlineAddress
                            )
                            external
                            requireIsOperational
                            returns(bool)
    {
        require(airlineAddress != address(0), "'account' must be a valid address.");
        return airlines[airlineAddress].isApproved;
    }


    function isAirlinePaid
                            (
                                address airlineAddress
                            )
                            external
                            requireIsOperational
                            returns(bool)
    {
        require(airlineAddress != address(0), "'account' must be a valid address.");
        return airlines[airlineAddress].isPaid;
    }

    function getVoteCount(address airlineAddress) external requireIsOperational returns(uint){
        return voteCount[airlineAddress];
    }

    function resetVoteCounter(address account) external requireIsOperational{
        delete voteCount[account];
    }

    function setAirlineToApproved(address airlineAddress) external requireIsOperational returns(bool){
        return airlines[airlineAddress].isApproved = true;
    }

      function setAirlineToPaid(address airlineAddress) external requireIsOperational returns(bool){
        return airlines[airlineAddress].isPaid = true;
    }


   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy
                            (                             
                            )
                            external
                            payable
    {

    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                )
                                external
                                pure
    {
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                            )
                            external
                            pure
    {
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund
                            (   
                            )
                            public
                            payable
    {
    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() 
                            external 
                            payable 
    {
        fund();
    }


}

