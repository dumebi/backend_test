/* eslint-disable no-undef */
const User = artifacts.require('SterlingUser');

// test suite
// eslint-disable-next-line no-undef
contract('Sterling User', async (accounts) => {
  const poster = accounts[1];
  let instance;
  // First User
  const name = 'Jude Dike';
  const personal = '15-9-1995|M|single';
  const residence = 'okah avae, pako|Lagos|Lagos|Nigeria';
  const state = 'Delta state|Aniocha north';
  const bvn = '22345678';
  const phone = '08183642720';
  const email = 'dikejude49@gmail.com';
  const address = '0x71e8aF7080C54610d191Ff7C2Be3Fa6b475121B0';
  const nameUpdate = 'Jude|Dike';

  beforeEach('setup contract for each test', async () => {
    instance = await User.deployed()
  })

  it('should be initialized with empty values', async () => {
    const number = await instance.getNoOfUsers()
    assert.equal(number.toNumber(), 0, 'Number of users must be 0');
  });

  // Add first user
  it('should let us add a first user', async () => {
    const receipt = await instance.postUser(name, personal, residence, state, bvn, phone, email, address, { from: poster });
    assert.equal(receipt.logs.length, 1, 'One event should have been triggered');
    assert.equal(receipt.logs[0].event, 'LogAddUser', 'event should be LogAddUser');
    assert.equal(receipt.logs[0].args._id.toNumber(), 1, `id must be ${1}`);
    // assert.equal(receipt.logs[0].args._poster, poster, `event poster must be ${poster}`);
    assert.equal(receipt.logs[0].args._useraddress, address, `event poster must be ${address}`);

    const usersNumber = await instance.getNoOfUsers();
    assert.equal(usersNumber.toNumber(), 1, `Number of users must be ${1}`);

    const users = await instance.getAllUsers();
    assert.equal(users.length, 1, `Number of users must be ${1}`);
    assert.equal(users[0].toNumber(), 1, `User ID must be ${1}`);

    const user = await instance.users(users[0]);
    assert.equal(user[0].toNumber(), 1, `Deal ID must be ${1}`);
    assert.equal(user[1], name, `user name must be ${name}`);
    assert.equal(user[2], personal, `user personal details must be ${personal}`);
    assert.equal(user[3], residence, `user residence must be ${user}`);
    assert.equal(user[4], state, `user state of origin details must be ${state}`);
    assert.equal(user[5], bvn, `user bvn must be ${bvn}`);
    assert.equal(user[6], phone, `user phone must be ${phone}`);
    assert.equal(user[7], email, `user email must be ${email}`);
    assert.equal(user[8], address, `user address must be ${address}`);
  });

  // Update existing user
  it('should let us update an existing user', async () => {
    const receipt = await instance.updateUser(1, nameUpdate, personal, residence, state, bvn, phone, email, { from: poster });
    assert.equal(receipt.logs.length, 1, 'One event should have been triggered');
    assert.equal(receipt.logs[0].event, 'LogUpdateUser', 'event should be LogUpdateUser');
    assert.equal(receipt.logs[0].args._id.toNumber(), 1, `id must be ${1}`);
    // assert.equal(receipt.logs[0].args._poster, poster, `event poster must be ${poster}`);
    assert.equal(receipt.logs[0].args._useraddress, address, `event poster must be ${address}`);

    const usersNumber = await instance.getNoOfUsers();
    assert.equal(usersNumber.toNumber(), 1, `Number of users must be ${1}`);

    const users = await instance.getAllUsers();
    assert.equal(users.length, 1, `Number of users must be ${1}`);
    assert.equal(users[0].toNumber(), 1, `User ID must be ${1}`);

    const user = await instance.users(users[0]);
    assert.equal(user[0].toNumber(), 1, `Deal ID must be ${1}`);
    assert.equal(user[1], nameUpdate, `user name must be ${nameUpdate}`);
    assert.equal(user[2], personal, `user personal details must be ${personal}`);
    assert.equal(user[3], residence, `user residence must be ${user}`);
    assert.equal(user[4], state, `user state of origin details must be ${state}`);
    assert.equal(user[5], bvn, `user bvn must be ${bvn}`);
    assert.equal(user[6], phone, `user phone must be ${phone}`);
    assert.equal(user[7], email, `user email must be ${email}`);
    assert.equal(user[8], address, `user address must be ${address}`);
  });
});
