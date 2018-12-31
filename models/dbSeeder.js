var Role = require('../models/userRolePermissions');
var mongoose = require('mongoose');

console.log('This script seeds startup data into the db.');

//Get arguments passed on command line
var argsPassed = process.argv.slice(2);
if (!argsPassed[0].startsWith('mongodb://')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

const mongoDB =  argsPassed[0];
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;


const roles = [
    {
        role: "Admin",
        permissions : []
    },
    {
        role: "Authorizer",
        permissions : []
    },
    {
        role: "User",
        permissions : []
    }
]

var dbSeeder =  async function() {
    try {

        for (let i = 0; i < roles.length; i++) {

            let saveRole = new Role(roles[i]);
            result = await saveRole.save()
            console.log('result >>> ',result, '\n')
        }

        mongoose.disconnect()

    } catch (error) {
        console.log('error >>> ', error)
    }
        
}

dbSeeder()