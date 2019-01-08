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

Type of Shares      - Source    - Destination
sharestradable      - (Monthly allocation, buys from seller, transfered by other users, minted on request, from other shares category)       -  (Back to HR for buyback and gets burned, sells to other users, transfers to other users)
sharesinlien        - (Monthly allocation, minted on request, from sharestradable)  - sharestradable
sharesvested        - (Monthly allocation, minted on request, from sharestradable)   - sharestradable
sharesallocated     - (Monthly allocation, minted on request, from sharestradable)   - sharestradable

For Job Scheduling , we can use the Ethereum Alarm clock to schedule function calls 
based on date and time: https://ethereum.stackexchange.com/questions/42/how-can-a-contract-run-itself-at-a-later-time

Contract WorkFlow :

Contract Roles :
Admin (AD)
Authorizers (AU)
Users (UR)

Application State :
Shareholder Added
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

TDD & Sprints
Add shareholders to contract
Define shareholders SIT categories
Enable and disable shareholders (Update shareholders details)