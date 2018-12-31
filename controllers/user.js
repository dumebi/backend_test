const EthAccount = require("../libraries/ethUser.js");
const validate = require("../helpers/validation.js");
const secure = require("../helpers/encryption.js");
const User = require("../models/user.js");
// const Constants = require('../helpers/constants');
// const { getAsync, client } = require('../helpers/redis');
// const {paramsNotValid, sendMail, config, checkToken} = require('../helpers/utils');



module.exports = {

    addShareholders : async function(req, res, next) {

        try {

            const validReq = await validate.users(req.body)

            const userMnemonic = await EthAccount.newMnemonic()
            const mnemonicSeed = await EthAccount.generateSeed(userMnemonic)
            const Ethkeys = await EthAccount.generateKeys(mnemonicSeed)

            console.log("Ethkeys.childPrivKey >> ", Ethkeys.childPrivKey)
        
            const user = new User({
                userType : validReq.userType,
                employmentStatus : validReq.employmentStatus,
                userGroup : validReq.userGroup,
                staffId : validReq.staffId,
                email : validReq.email,
                fullname : validReq.fullname, 
                isVesting  : validReq.isVesting,
                lienPeriod : validReq.lienPeriod ,
                dividendAcct : validReq.dividendAcct,
                beneficiary : validReq.beneficiary,
                password : validReq.password ,
                workflow : validReq.workflow,
                status : validReq.status
            })

            user.mnemonic = await secure.encrypt(userMnemonic)
            user.privateKey = await secure.encrypt(Ethkeys.childPrivKey)
            user.publicKey = await secure.encrypt(Ethkeys.childPubKey)
            user.address = Ethkeys.childAddress

            console.log("secure.decrypt >> ", secure.decrypt(user.privateKey))

            const savedUser = await user.save()
            // newUser = JSON.parse(newUser) Ensure if there is a need to parse users
            delete savedUser.password;

            // await this.addUserOrUpdateCache(newUser) Ensure to know what this is for

            res.status(Constants.OK).json({
                status : true,
                message : "User created successfully",
                data : savedUser
            });

        } catch (error) {
            console.log("error >> ", error)
            let err = {
                status : false,
                message : 'Could not create user',
                devError : error
            }
            next(err)
        }

    },

    async addUserOrUpdateCache(user) {
        try {
          const sttpUsers = await getAsync('users');
          if (sttpUsers != null && JSON.parse(sttpUsers).length > 0) {
            const users = JSON.parse(sttpUsers);
            users[user._id] = user
            await client.set('users', JSON.stringify(users));
          }
        } catch (err) {
          console.log(err)
        }
    }

}