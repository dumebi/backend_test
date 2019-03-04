var User = require('../models/user');
var mongoose = require('mongoose');

console.log('This script seeds startup data into the db.');

require('./helpers/connection').start();

const users = [
    {
      fname: "Jude",
      mname: "Ebuse",
      lname: "Adams",
      email: "meetenebelioluchi@gmail.com",
      phone: "09088994563",
      sex: "Female",
      type: User.UserType.ADMIN,
      staffId: "004502",
      address: "Head Office, Marina",
      employment: User.Employment.EMPLOYED,
      group: User.UserGroup.ENTRYLEVEL,
      beneficiary: "Dara",
      activated: false,
      enabled: true,
      password: "12345678",
      vesting: false
    }
]

var dbSeeder =  async function() {
    try {

        for (let i = 0; i < users.length; i++) {

            let saveUser = new User(users[i]);
            result = await saveUser.save()
            console.log('result >>> ',result, '\n')
        }

        mongoose.disconnect()

    } catch (error) {
        console.log('error >>> ', error)
    }
        
}

dbSeeder()