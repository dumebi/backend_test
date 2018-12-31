pragma solidity >=0.4.22 <0.6.0;
pragma experimental ABIEncoderV2;
// pragma solidity ^0.5.0;
// pragma experimental ABIEncoderV2;

contract SterlingUser {
  // state variables
  // custom types

  struct User {
    uint id;
    string name;
    string personal;
    string residence;
    string state;
    string bvn;
    string phone;
    string email;
    address useraddress;
    uint createdAt;
  }

  mapping (uint => User) public users;
  uint userCounter;

  // events
  event LogAddUser(
    uint indexed _id,
    address indexed _useraddress
    );

  event LogUpdateUser(
    uint indexed _id,
    address indexed _useraddress
    );

  // Post User
  function postUser(string memory _name, string memory _personal, string memory _residence, string memory _state, 
  string memory _bvn, string memory _phone, string memory _email, address _useraddress) public {
    userCounter++;

    // storing this deal
    users[userCounter] = User(
      userCounter,
      _name,
      _personal,
      _residence,
      _state,
      _bvn,
      _phone,
      _email,
      _useraddress,
      now
      );

   emit LogAddUser(userCounter, _useraddress);
  }
  
  // Update Deal
  function updateUser(uint _id, string memory _name, string memory _personal, string memory _residence, string memory _state, 
  string memory _bvn, string memory _phone, string memory _email) public {
    User storage user = users[_id];
    // update this deal
    user.name = _name;
    user.personal = _personal;
    user.residence = _residence;
    user.state = _state;
    user.bvn = _bvn;
    user.phone = _phone;
    user.email = _email;

    emit LogUpdateUser(_id, user.useraddress);
  }

  // Remove a User
  function deleteUser(uint _id) public {
    // prepare output array
    delete users[_id];
    for(uint i = _id; i <= userCounter; i++){
      users[_id].id = users[_id].id - 1;
    }
    userCounter--;
  }

  // fetch and return all deal IDs
  function getAllUsers() public view returns(uint[] memory) {
    // prepare output array
    uint[] memory userIds = new uint[](userCounter);

    uint numberOfUsers = 0;
    for (uint i = 1; i <= userCounter; i++) {
      // keep the ID if the deal is stil for sale
        userIds[numberOfUsers] = users[i].id;
        numberOfUsers++;
      }
    return userIds;
  }

  // gets the number of users
  function getNoOfUsers() public view returns(uint) {
    return userCounter;
  }
}
