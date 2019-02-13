const { web3 } = require("./../libraries/base");
const { compiledTokenContract } = require("../libraries/deploy/compile.js");

deployedContractAddr = "0x0fd8a3cdc181340a0eb713ae5d9047fa18948400";
const contractABI = compiledTokenContract.abi;
const ethAccounts = async () => {
    try{
        let accounts =  await web3.eth.getAccounts()
        console.log("accts >> ", accounts)
        return accounts
    }catch(error){
        console.log("error >> ", error)
    }
}
const accounts = ethAccounts()

const contractEvent = new web3.eth.Contract(
    contractABI,
    deployedContractAddr
)

// Get Past Events
// contractEvent.getPastEvents("allEvents", {
//     // filter: {
//     // _authorizer: accounts[8],
//     // _type: 1
//     // },
//     fromBlock: 0,
//     toBlock: 'latest'
// }, (error, events) => {
//     if(error){
//         console.log("error >> ", error)
//     }
//     console.log("event >> ", 
//     web3.eth.utils.toHex(events[0].raw.topics[2]));
// })


// // Subscribes to all events
    contractEvent.events
        .allEvents({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, event) => { 
        console.log(event);
     })
    .on('changed', (event) => {
        // remove event from local database
    })
    
   
    contractEvent.events
        .OwnershipTransferred({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, event) => { console.log(event); })
    .on('changed', (event) => {
        // remove event from local database
    })
    contractEvent.events
        .NewAuthorizer({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, event) => { console.log(event); })
    .on('changed', (event) => {
        // remove event from local database
    })
    contractEvent.events
        .AuthorizerRemoved({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, event) => { console.log(event); })
    .on('changed', (event) => {
        // remove event from local database
    })
    contractEvent.events
        .Transfer({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, event) => { console.log(event); })
    .on('changed', (event) => {
        // remove event from local database
    })
    contractEvent.events
        .Approval({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, event) => { console.log(event); })
    .on('changed', (event) => {
        // remove event from local database
    })
    contractEvent.events
        .NewTradable({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, event) => { console.log(event); })
    .on('changed', (event) => {
        // remove event from local database
    })
    contractEvent.events
        .NewAllocated({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, event) => { console.log(event); })
    .on('changed', (event) => {
        // remove event from local database
    })
    contractEvent.events
        .NewVesting({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, event) => { console.log(event); })
    .on('changed', (event) => {
        // remove event from local database
    })
    contractEvent.events
        .NewLien({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, event) => { console.log(event); })
    .on('changed', (event) => {
        // remove event from local database
    })
    contractEvent.events
        .MovedToTradable({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, event) => { console.log(event); })
    .on('changed', (event) => {
        // remove event from local database
    })
    contractEvent.events
        .NewShareholder({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, event) => { console.log(event); })
    .on('changed', (event) => {
        // remove event from local database
    })
    contractEvent.events
        .shareHolderUpdated({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, event) => { console.log(event); })
    .on('changed', (event) => {
        // remove event from local database
    })
    contractEvent.events
        .shareHolderRemoved({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, event) => { console.log(event); })
    .on('changed', (event) => {
        // remove event from local database
    })
    contractEvent.events
        .Withdrawn({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, event) => { console.log(event); })
    .on('changed', (event) => {
        // remove event from local database
    })
    contractEvent.events
        .NewSchedule({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, event) => { console.log(event); })
    .on('changed', (event) => {
        // remove event from local database
    })
    contractEvent.events
        .NewSchedule({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, event) => { console.log(event); })
    .on('changed', (event) => {
        // remove event from local database
    })
    contractEvent.events
        .ScheduleApproved({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, event) => { console.log(event); })
    .on('changed', (event) => {
        // remove event from local database
    })
    contractEvent.events
        .ScheduleRejected({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, event) => { console.log(event); })
    .on('changed', (event) => {
        // remove event from local database
    })
    contractEvent.events
        .ScheduleRemoved({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, event) => { console.log(event); })
    .on('changed', (event) => {
        // remove event from local database
    })
    contractEvent.events
        .Minted({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, event) => { console.log(event); })
    .on('changed', (event) => {
        // remove event from local database
    })
    