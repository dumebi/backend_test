const User = require('../models/user');
const EthAccount = require('../libraries/ethUser.js');
const secure = require('../helpers/encryption.js');
const UserModel = require('../models/user');

console.log('This script seeds startup data into the db.');

async function dbSeeder() {
  try {
    const userMnemonic = "priority camera link lucky cave rug federal shiver canoe elegant student illegal"
    const mnemonicSeed = await EthAccount.generateSeed(userMnemonic)
    const Ethkeys = await EthAccount.generateKeys(mnemonicSeed)

    const user = new UserModel({
        fname: 'Oluwadara',
        mname: 'Ayotunde',
        lname: 'Olayebi',
        email: 'admin@gmail.com',
        phone: '09088994563',
        sex: 'Female',
        type: User.UserType.ADMIN,
        staffId: '004502',
        // houseAddress: 'Head Office, Marina',
        employment: User.EmploymentStatus.EMPLOYED,
        group: User.UserGroup.ET,
        beneficiary: 'Dara',
        activated: true,
        enabled: true,
        password: '12345678',
        vesting: false
      })

    const [mnemonic, privateKey, publicKey] = await Promise.all([secure.encrypt(userMnemonic), secure.encrypt(Ethkeys.childPrivKey), secure.encrypt(Ethkeys.childPubKey)])
    user.mnemonic = mnemonic
    user.privateKey = privateKey
    user.publicKey = publicKey
    user.address = Ethkeys.childAddress

    const _user = await user.save()
    console.log('saved', _user)

    // const userSavePromise = users.map(user => {
    //   User.create(user)
    // })
    // const newUsers = await Promise.all(userSavePromise)
    // console.log(newUsers)

    // for (let i = 0; i < users.length; i++) {
    //   const saveUser = new User(users[i]);
    //   result = await saveUser.save()
    //   // console.log('result >>> ',result, '\n')
    // }
  } catch (error) {
    console.log('error >>> ', error)
  }
}

dbSeeder()
