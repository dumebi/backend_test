const { web3 } = require("./base");
const { compiledTokenContract } = require("./deploy/compile.js");
const updateOnEvent = require("./updateOnEvent.js");

deployedContractAddr = "0x1620782a3d70b48720af013cc8d206b2a90727e5";
const contractABI = compiledTokenContract.abi;
const contractEvent = new web3.eth.Contract(
    contractABI,
    deployedContractAddr
)

var eventCount = {
    OwnershipTransferred : 0,
    NewAuthorizer : 0,
    AuthorizerRemoved : 0,
    Transfer : 0,
    Approval : 0,
    NewTradable : 0,
    NewAllocated : 0,
    NewVesting : 0,
    NewLien : 0,
    MovedToTradable : 0,
    NewShareholder : 0,
    shareHolderUpdated : 0,
    shareHolderRemoved : 0,
    Withdrawn : 0,
    NewSchedule : 0,
    ScheduleApproved : 0,
    ScheduleRejected : 0,
    ScheduleRemoved : 0,
    Minted : 0,
}

function intervalFunc() {

    let counter = {
        OwnershipTransferred : 0,
        NewAuthorizer : 0,
        AuthorizerRemoved : 0,
        Transfer : 0,
        Approval : 0,
        NewTradable : 0,
        NewAllocated : 0,
        NewVesting : 0,
        NewLien : 0,
        MovedToTradable : 0,
        NewShareholder : 0,
        shareHolderUpdated : 0,
        shareHolderRemoved : 0,
        Withdrawn : 0,
        NewSchedule : 0,
        ScheduleApproved : 0,
        ScheduleRejected : 0,
        ScheduleRemoved : 0,
        Minted : 0,
    }


    contractEvent.events
        .OwnershipTransferred({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, events) => { 
        if (error) {
            console.log("error on event > ", error)
        }
        counter.OwnershipTransferred += 1;
        if(counter.OwnershipTransferred > eventCount.OwnershipTransferred){
            eventCount.OwnershipTransferred += 1 
            // Call function to update offline DB
            updateOnEvent(events.event, {
                transactionHash : events.transactionHash,
                eventSig : events.signature,
                prevOnwer : '0x'+events.raw.topics[1].slice(26),
                newOwner : '0x'+events.raw.topics[2].slice(26)
            })
        }
    })

    contractEvent.events
        .NewAuthorizer({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, events) => { 
        if (error) {
            console.log("error on event > ", error)
        }
        counter.NewAuthorizer += 1;
        if(counter.NewAuthorizer > eventCount.NewAuthorizer){
            eventCount.NewAuthorizer += 1 
            // Call function to update offline DB
            updateOnEvent(events.event, {
                transactionHash : events.transactionHash,
                eventSig : events.signature,
                authorizer : '0x'.event.raw.topics[1].slice(26),
                type : (event.raw.topics[2].slice(26) == 0)? "Pay Scheme" : "Upfront Scheme"
                
            })
        }
    })

    contractEvent.events
        .AuthorizerRemoved({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, events) => { 
        if (error) {
            console.log("error on event > ", error)
        }
        counter.AuthorizerRemoved += 1;
        if(counter.AuthorizerRemoved > eventCount.AuthorizerRemoved){
            // Call function to update offline DB
            eventCount.AuthorizerRemoved += 1 
            updateOnEvent(events.event, {
                transactionHash : events.transactionHash,
                eventSig : events.signature,
                authorizer : '0x'+events.raw.topics[1].slice(26)
            })
        }
    })
    
    contractEvent.events
        .Transfer({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, events) => { 
        if (error) {
            console.log("error on event > ", error)
        }
        counter.Transfer += 1;
        if(counter.Transfer > eventCount.Transfer){
            // Call function to update offline DB
            eventCount.Transfer += 1 
            updateOnEvent(events.event, {
                transactionHash : events.transactionHash,
                eventSig : events.signature,
                from : '0x'+events.raw.topics[1].slice(26),
                to : '0x'+events.raw.topics[2].slice(26),
                value : events.returnValues._amount
            })
        }
    })
    
    contractEvent.events
        .Approval({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, events) => { 
        if (error) {
            console.log("error on event > ", error)
        }
        counter.Approval += 1;
        if(counter.Approval > eventCount.Approval){
            // Call function to update offline DB
            eventCount.Approval += 1 
            updateOnEvent(events.event, {
                transactionHash : events.transactionHash,
                eventSig : events.signature,
                owner : '0x'+events.raw.topics[1].slice(26),
                spender : '0x'+events.raw.topics[2].slice(26),
                value : events.returnValues._amount,
            })
        }
    })
    
    contractEvent.events
        .NewAllocated({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, events) => { 
        if (error) {
            console.log("error on event > ", error)
        }
        counter.NewAllocated += 1;
        if(counter.NewAllocated > eventCount.NewAllocated){
            // Call function to update offline DB
            eventCount.NewAllocated += 1 
            updateOnEvent(events.event, {
                transactionHash : events.transactionHash,
                eventSig : events.signature,
                to : '0x'+events.raw.topics[1].slice(26),
                value : events.returnValues._amount,
                dateAdded : events.raw.topics[2].slice(26),
            })
        }
    })
    
    contractEvent.events
        .NewVesting({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, events) => { 
        if (error) {
            console.log("error on event > ", error)
        }
        counter.NewVesting += 1;
        if(counter.NewVesting > eventCount.NewVesting){
            // Call function to update offline DB
            eventCount.NewVesting += 1 
            updateOnEvent(events.event, {
                transactionHash : events.transactionHash,
                eventSig : events.signature,
                to : '0x'+events.raw.topics[1].slice(26),
                value : events.returnValues._amount,
                dateAdded : events.raw.topics[2].slice(26),
            })
        }
    })
    
    contractEvent.events
        .NewLien({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, events) => { 
        if (error) {
            console.log("error on event > ", error)
        }
        counter.NewLien += 1;
        if(counter.NewLien > eventCount.NewLien){
            // Call function to update offline DB
            eventCount.NewLien += 1 
            updateOnEvent(events.event, {
                transactionHash : events.transactionHash,
                eventSig : events.signature,
                to : '0x'+events.raw.topics[1].slice(26),
                value : events.returnValues._amount,
                dateAdded : events.raw.topics[2].slice(26),
                lienPeriod : events.raw.topics[3].slice(26)
            })
        }
    })
    
    contractEvent.events
        .MovedToTradable({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, events) => { 
        if (error) {
            console.log("error on event > ", error)
        }
        counter.MovedToTradable += 1;
        if(counter.MovedToTradable > eventCount.MovedToTradable){
            // Call function to update offline DB
            eventCount.MovedToTradable += 1 
            updateOnEvent(events.event, {
                transactionHash : events.transactionHash,
                eventSig : events.signature,
                holder : '0x'+events.raw.topics[1].slice(26),
                category :   
                events.returnValues._sitCat == "Tradable"
                  ? 0
                  : events.returnValues._sitCat == "Lien"
                  ? 1
                  : events.returnValues._sitCat == "Allocated"
                  ? 2
                  : events.returnValues._sitCat == "Vesting"
                  ? 3
                  : "Unknown",
                record : events.returnValues._recordId
            })
        }
    })
    
    contractEvent.events
        .NewShareholder({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, events) => { 
        if (error) {
            console.log("error on event > ", error)
        }
        counter.NewShareholder += 1;
        if(counter.NewShareholder > eventCount.NewShareholder){
            // Call function to update offline DB
            eventCount.NewShareholder += 1 
            updateOnEvent(events.event, {
                transactionHash : events.transactionHash,
                eventSig : events.signature,
                holder : '0x'+events.raw.topics[1].slice(26),
            })
        }
    })
    
    contractEvent.events
        .shareHolderUpdated({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, events) => { 
        if (error) {
            console.log("error on event > ", error)
        }
        counter.shareHolderUpdated += 1;
        if(counter.shareHolderUpdated > eventCount.shareHolderUpdated){
            // Call function to update offline DB
            eventCount.shareHolderUpdated += 1 
            updateOnEvent(events.event, {
                transactionHash : events.transactionHash,
                eventSig : events.signature,
                holder : '0x'+events.raw.topics[1].slice(26),
                isEnabled : events.returnValues._isEnabled,
                isWithhold : events.returnValues._isWithhold
            })
        }
    })
    
    contractEvent.events
        .shareHolderRemoved({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, events) => { 
        if (error) {
            console.log("error on event > ", error)
        }
        counter.shareHolderRemoved += 1;
        if(counter.shareHolderRemoved > eventCount.shareHolderRemoved){
            // Call function to update offline DB
            eventCount.shareHolderRemoved += 1 
            updateOnEvent(events.event, {
                transactionHash : events.transactionHash,
                eventSig : events.signature,
                holder : '0x'+events.raw.topics[1].slice(26),
            })
        }
    })
    
    contractEvent.events
        .Withdrawn({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, events) => {  
        counter.Withdrawn += 1;
        if(counter.Withdrawn > eventCount.Withdrawn){
            // Call function to update offline DB
            eventCount.Withdrawn += 1 
            updateOnEvent(events.event, {
                transactionHash : events.transactionHash,
                eventSig : events.signature,
                initiator : events.returnValues._initiator,
                holder : '0x'+events.raw.topics[1].slice(26),
                category :  
                events.returnValues._sitCat == "Tradable"
                  ? 0
                  : events.returnValues._sitCat == "Lien"
                  ? 1
                  : events.returnValues._sitCat == "Allocated"
                  ? 2
                  : events.returnValues._sitCat == "Vesting"
                  ? 3
                  : "Unknown",
                value : events.returnValues._amount,
                reason : web3.utils.hexToUtf8(events.returnValues._data),
            })
        }
    })
    
    contractEvent.events
        .NewSchedule({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, events) => { 
        if (error) {
            console.log("error on event > ", error)
        }
        counter.NewSchedule += 1;
        if(counter.NewSchedule > eventCount.NewSchedule){
            // Call function to update offline DB
            eventCount.NewSchedule += 1 
            updateOnEvent(events.event, {
                transactionHash : events.transactionHash,
                eventSig : events.signature,
                scheduleId : events.raw.topics[1].slice(26),
                scheduleType : (events.returnValues._scheduleType.slice(26) == 0)? "Pay Scheme" : "Upfront Scheme",
                value : events.returnValues._amount,
                reason : web3.utils.hexToUtf8(events.returnValues._reason),
            })
        }
    })
    
    
    contractEvent.events
        .ScheduleApproved({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, events) => {
        counter.ScheduleApproved += 1;
        if(counter.ScheduleApproved > eventCount.ScheduleApproved){
            // Call function to update offline DB
            eventCount.ScheduleApproved += 1 
            updateOnEvent(events.event, {
                transactionHash : events.transactionHash,
                eventSig : events.signature,
                scheduleId : events.raw.topics[1].slice(26),
                reason : web3.utils.hexToUtf8(events.returnValues.reason),
            })
        }
    })
    
    contractEvent.events
        .ScheduleRejected({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, events) => { 
        if (error) {
            console.log("error on event > ", error)
        }
        counter.ScheduleRejected += 1;
        if(counter.ScheduleRejected > eventCount.ScheduleRejected){
            // Call function to update offline DB
            eventCount.ScheduleRejected += 1 
            updateOnEvent(events.event, {
                transactionHash : events.transactionHash,
                eventSig : events.signature,
                scheduleId : events.raw.topics[1].slice(26),
                reason : web3.utils.hexToUtf8(events.returnValues.reason),
            })
        }
    })
    
    contractEvent.events
        .ScheduleRemoved({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, events) => { 
        if (error) {
            console.log("error on event > ", error)
        }
        counter.ScheduleRemoved += 1;
        if(counter.ScheduleRemoved > eventCount.ScheduleRemoved){
            // Call function to update offline DB
            eventCount.ScheduleRemoved += 1 
            updateOnEvent(events.event, {
                transactionHash : events.transactionHash,
                eventSig : events.signature,
                scheduleId : events.raw.topics[1].slice(26),
                initiator : '0x'.events,
                reason : web3.utils.hexToUtf8(events.returnValues._reason),
            })
        }
    })
    
    contractEvent.events
        .Minted({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, events) => { 
        if (error) {
            console.log("error on event > ", error)
        }
        counter.Minted += 1;
        if(counter.Minted > eventCount.Minted){
            // Call function to update offline DB
            eventCount.Minted += 1 
            updateOnEvent(events.event, {
                transactionHash : events.transactionHash,
                eventSig : events.signature,
                from : '0x'.events.raw.topics[1].slice(26),
                to : '0x'.events.raw.topics[2].slice(26),
                category :   
                events.returnValues._sitCat == "Tradable"
                  ? 0
                  : events.returnValues._sitCat == "Lien"
                  ? 1
                  : events.returnValues._sitCat == "Allocated"
                  ? 2
                  : events.returnValues._sitCat == "Vesting"
                  ? 3
                  : "Unknown",
                amount : events.returnValues._amount,
                scheduleType : (events.returnValues._scheduleType == 0)? "Pay Scheme" : "Upfront Scheme",
                reason : web3.utils.hexToUtf8(events.returnValues._reason),
            })
        }
    })   
}
const pullEventTimeout = setTimeout(intervalFunc, 100);
const pullEventInterval = setInterval(intervalFunc, 15000);