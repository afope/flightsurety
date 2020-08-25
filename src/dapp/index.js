
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {

        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });

        //User-submitted transaction
        DOM.elid('purchase-insurance').addEventListener('click', () => {
            console.log('clicked')
            let flight = DOM.elid('flight-number-insurance').value;
            let amount = DOM.elid('flight-insurance-amount').value;
            console.log('amount', amount);
            // Write transaction
            contract.purchaseFlightInsurance(flight, amount, (error, result) => {
            console.log('result'. result);
            display('Insurance', 'Fetching Insurance', [ { label: 'Purchase flight insurance', error: error, value: 'Insurance of ' + amount +  ' ether purchased!'} ]);
            });
        })
    

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number-insurance').value;
            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                display('Oracles', 'Trigger oracles', [ { label: 'Submit to Oracle', error: error, value: result.flight + ' submitted to oracle at:' + result.timestamp} ]);
            });
        })

        DOM.elid('claim-insurance').addEventListener('click', () => {
            let flight = DOM.elid('flight-number-insurance').value;
            // Write transaction
            contract.withdrawBalance(flight, (error, result) => {
                console.log('result', result)
                display('Passenger Balance', 'Withdraw balance', [ { label: 'Claim your insurance', error: error, value: 'Flight insurance claimed at' + result.timestamp + '!'} ]);
            });
        })
    
    });
    

})();


function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);

}







