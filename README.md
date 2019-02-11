# sttp_backend

This is a Sterling Tokenized Trading Platform built on the Ethereum Blockchain

### Ganache Mnemonic

```
priority camera link lucky cave rug federal shiver canoe elegant student illegal
```

### Truffle build script

```
truffle migrate --compile-all --reset --network {ganache (dev), geth(server)}
```

# Sterling Investment Token(SIT) Smart Contract For Sterling Bank

The SIT smart contract creates a system of shares allocation and managment. It covers the scenario for monthly allocations of shares to staffs by HC, tracking of shares allocated within the sytem and on-chain validation for the exchange system. This requires an admin(HC), an authorizer(compliance,MD...) and the shareholder's themselves. Admin can generate a montly schedule for share allocation. Authorizers can authorize the schedule by taking an action on the smart contract, and shareholders can take acccctions on shares allocated to them provided they pass all restrictions i.e KYC, AML. SIT are only minted on request by admin and authorized by the authorizers. can mint.

=> Some key implementations on the contract
The contract is instantiated with zero SIT supply
The contract has no hard cap on total SIT in supply
Total supply of SIT in circulation only increases or decreases when SIT is minted or burned
SIT are minted to specified accounts on demand, based on an authorized mintable amount
SIT Transfered back to admin for buy back are burned
No SIT is minted or allocated to admin account

Type of Shares - Source - Destination
sharestradable - (Monthly allocation, buys from seller, transfered by other users, minted on request, from other shares category) - (Back to HR for buyback and gets burned, sells to other users, transfers to other users)
sharesinlien - (Monthly allocation, minted on request, from sharestradable) - sharestradable
sharesvested - (Monthly allocation, minted on request, from sharestradable) - sharestradable
sharesallocated - (Monthly allocation, minted on request, from sharestradable) - sharestradable

For Job Scheduling , we can use the Ethereum Alarm clock to schedule function calls
based on date and time: https://ethereum.stackexchange.com/questions/42/how-can-a-contract-run-itself-at-a-later-time

Contract WorkFlow :

Contract Roles :
Admin (AD)
Authorizers (AU)
Users (UR)

Application State :
Shareholder Added
Shareholder Updated
Schedule Created
Schedule Pending Approval
Schedule Approved
Schedule Rejected
SIT Distribution After Approval
Shareholder SIT Info Update
Shareholders Enabled
Shareholders Disable
SIT Transfered

State Transition :
Shareholder Added => AD
Schedule Created => AD
Schedule Approved => AU
Schedule Rejected => AU
SIT Distribution After Approval => AD
Shareholder SIT Info Update => AD
Shareholders Enabled => AD
Shareholders Disable => AD
SIT Transfered => AD, AU, UR
SIT Sales Offering => AU,UR
SIT Purchase Offering => AD,AU,UR
SIT Purchase => AD, AU, UR

ERRO Handling :

SUCCESS;
UNVERIFIED_HOLDER;
SEND_TRANSFER_BLOCKED;
RECEIPT_TRANSFER_BLOCKED;
TOKEN_GRANULARITY_ERROR;
TRANSFER_VERIFIED_ERROR;
INSUFFICIENT_BALANCE_ERROR;
INVALID_AMOUNT_ERROR;
SPENDER_BALANCE_ERROR;
ACCOUNT_WITHHOLD_ERROR;
MOVE_LIEN_ERROR;
UNIQUE_SHAREHOLDER_ERROR;

SCHEDULE
NOTALLOWED_ERROR => "This schedule cannot be rejected! Tokens have already been minted on it" || "This schedule cannot be removed! Tokens have already been minted on it"
INVALID_ERROR => "This is for inactive schedules
SCHEDULE_APPROVED_ERROR => "This schedule has already been approved!"
SCHEDULE_REJECTED_ERROR => "This schedule has already been rejected!"

TRANSFERS
INVALID_ERROR => "This is for invalid amounts that tends to have a reverse effect on the transaction (i.e 0, -1)

GENERAL
UNAUTHORIZED_ERROR => "Only contract owner can initiate this transaction" | "Only contract manager can initiate this transaction" | "Only contract administrators can initiate this transaction" | "You are not listed as an authorizer."

What is left :

Test with Remix
Write Solidity test
Write Javascript Test
Write Oraclize for detectrestriction
Write Upgradability Functions, function to disable(If this function is called, no interaction can occur to the contract unless it is enabled ahain, ) an to selfDestroy
Oraclize.

Optimization Check
Ensure all delecate functionality is ascertained with assert()
Implement state transition using enums and access restriction patterns (game)
A modifier that is called with every involved function call, checks for the current timestamp and transitions to the next stage (This can be used instead of a scheduler, it's game)
Implement emergency stop for contract, using state transition and enums and also access restriction for those who are able to detect the emergnce state of the contract
Implement upgrade smart contracts :

Challenges :
Large contract size failing to deploy : Solution : Factor constant logics into libraries, Use external storag with proxy(delegateCall). This also works for upgradability | Try to eliminate loops in contracts | Clear out unused variables | refactor multiple functions with base logic to a single function | Define similar types side by side |Continue to refactor into libraries|Use shorter types for struct elements and sort them such that short types are grouped together.|Move duplicate functionality into generic functions or function modifiers (even if it means more function parameters).|Instead of creating multiple getters (or multiple public members), create bundled getters that return multiple values at once.|Use local variables to reference storage array elements.|Remove some constant functions that are not critical to the contract.\
the tx doesn't have the correct nonce. account has nonce of: 0 tx has nonce of: 6 =>
Nounce : Setting the nounce on an account for each transaction was a problem as they was no efficient way of getting the nounce of the previously mined block and if a transaction fails, the nounce of that transaction wont be counted, making it hard to get the correct nounce
Getting gas price and extimating gas => There was no way to easily determine what gas price was more attractive to miners, as the only way i saw was to make and api call to EthergasStation and if for any reason this fails, the entire process was sabotaged.
Geting Gas Estimate for a transaction => The way i knew how to do this was to use the web3 estimateGas function which infers and estimates gas based on the previous transaction,but the down side of this is that if the previous transaction was not properly implement this returns an error,

- Factoring contract and logics into other contracts and libraries. (Challenges on this : My solution is to break the contract into storage contract, main logic contract and libraries with functionalities, use bytes instead of strings(bytes is raw, but string is UTF-8))

- Made all library functions internal, else it throws error
  Upgradability

- For Key storage contract,have authorizers address allowed to change the state of storage contract
- Have a mapping for all types
  Note :
  Add claim ownership to owner library
- Add function to get the token equivalence in local currencies
- Create a function to manage nounce
- Add an exchange mapping for all users
- Check for key management

errorCode: "UNVERIFIED_HOLDER",
message: "Only verified SIT holders can perform this transaction"

errorCode: "RECEIPT_TRANSFER_BLOCKED",
message: "Recipient not authorized"
errorCode: "SEND_TRANSFER_BLOCKED", message: "Sender not authorized"
errorCode: "TOKEN_GRANULARITY_ERROR",
message: "Token cannot be granular below the specified granularity"
errorCode: "TRANSFER_VERIFIED_ERROR",
message: "Off-Chain approval for restricted token"
errorCode: "INSUFFICIENT_BALANCE_ERROR",
message: "You do not have sufficient balance for this transaction"
errorCode: "INVALID_AMOUNT_ERROR",
message: "Token amount specified is invalid"
errorCode: "SPENDER_BALANCE_ERROR",
message: "Amount specified is morethan spendable amount"
errorCode: "ACCOUNT_WITHHOLD_ERROR", message: "Account on hold"
errorCode: "MOVE_LIEN_ERROR",
message:
"Lien cannot be moved to tradable balance, lien period not over yet"
errorCode: "UNIQUE_SHAREHOLDER_ERROR",
message: "Shareholder already added before!"
