
module.exports = function eventHandler(event, details) {
    
    switch (event) {
        case "OwnershipTransferred" :

            // Do something with the event details here
            console.log(" >> ", details)
        break;

        case "NewAuthorizer" :

            // Do something with the event details here
            console.log(" >> ", details)
        break;

        case "AuthorizerRemoved" :

            // Do something with the event details here
            console.log(" >> ", details)
        break;
        
        case "Transfer" :

            // Do something with the event details here
            console.log(" >> ", details)
        break;
        
        case "Approval" :

            // Do something with the event details here
            console.log(" >> ", details)
        break;
        
        case "NewTradable" :

            // Do something with the event details here
            console.log(" >> ", details)
        break;
        
        case "NewAllocated" :

            // Do something with the event details here
            console.log(" >> ", details)
        break;
        
        case "NewVesting" :

            // Do something with the event details here
            console.log(" >> ", details)
        break;
        
        case "NewLien" :

            // Do something with the event details here
            console.log(" >> ", details)
        break;
        
        case "MovedToTradable" :

            // Do something with the event details here
            console.log(" >> ", details)
        break;
        
        case "NewShareholder" :

            // Do something with the event details here
            console.log(" >> ", details)
        break;
        
        case "shareHolderUpdated" :

            // Do something with the event details here
            console.log(" >> ", details)
        break;
        
        case "shareHolderRemoved" :

            // Do something with the event details here
            console.log(" >> ", details)
        break;
        
        case "Withdrawn" :

            // Do something with the event details here
            console.log(" >> ", details)
        break;
        
        case "NewSchedule" :

            // Do something with the event details here
            console.log(" >> ", details)
        break;
        
        case "ScheduleApproved" :

            // Do something with the event details here
            console.log(" >> ", details)
        break;
        
        case "ScheduleRejected" :

            // Do something with the event details here
            console.log(" >> ", details)
        break;
        
        case "ScheduleRemoved" :

            // Do something with the event details here
            console.log(" >> ", details)
        break;
        
        case "Minted" :

            // Do something with the event details here
            console.log(" >> ", details)
        break;   
    
        default:
            break;
    }

    
}