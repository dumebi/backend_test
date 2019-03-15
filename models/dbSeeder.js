var User = require('../models/user');
const EthAccount = require('../libraries/ethUser.js');
const secure = require('../helpers/encryption.js');

console.log('This script seeds startup data into the db.');

var dbSeeder =  async function() {
    try {
        const userMnemonic = await EthAccount.newMnemonic()
        const mnemonicSeed = await EthAccount.generateSeed(userMnemonic)
        const Ethkeys = await EthAccount.generateKeys(mnemonicSeed)
        const [mnemonic, privateKey, publicKey] = await Promise.all([secure.encrypt(userMnemonic), secure.encrypt(Ethkeys.childPrivKey), secure.encrypt(Ethkeys.childPubKey)])

        const users = [
            {
              fname: "Oluwadara",
              mname: "Ayotunde",
              lname: "Olayebi",
              email: "admin@gmail.com",
              phone: "09088994563",
              sex: "Female",
              type: User.UserType.ADMIN,
              staffId: "004502",
              address: "Head Office, Marina",
              employment: User.EmploymentStatus.EMPLOYED,
              group: User.UserGroup.ET,
              beneficiary: "Dara",
              activated: true,
              enabled: true,
              password: "12345678",
              vesting: false, 
              mnemonic : mnemonic,
              privateKey : privateKey,
              publicKey : publicKey,
              address : Ethkeys.childAddress
            }
        ]

        for (let i = 0; i < users.length; i++) {

            let saveUser = new User(users[i]);
            result = await saveUser.save()
            // console.log('result >>> ',result, '\n')
        }

    } catch (error) {
        console.log('error >>> ', error)
    }
        
}

dbSeeder()