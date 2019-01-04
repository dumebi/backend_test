const EthAccount = require("../libraries/ethUser.js");
const SIT = require("../libraries/sitHolder.js");
const validate = require("../helpers/validation.js");
const secure = require("../helpers/encryption.js");
const User = require("../models/user.js");
const HttpStatus = require('../helpers/httpStatus');
const { getAsync, client } = require('../helpers/redis');
const {paramsNotValid, sendMail, config, checkToken} = require('../helpers/utils');



module.exports = {

    addShareholders : async function(req, res, next) {

        try {

            const validReq = await validate.users(req.body)

            const userMnemonic = await EthAccount.newMnemonic()
            const mnemonicSeed = await EthAccount.generateSeed(userMnemonic)
            const Ethkeys = await EthAccount.generateKeys(mnemonicSeed)
        
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

            const savedUser = await user.save()
            delete savedUser.password;

            await this.addUserOrUpdateCache(savedUser)

            res.send({
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
    },

    test : async function (req, res, next) {
        try {
            // const result = await SIT.getAdminBal("0xbb723b459f84c24665a89159d94701321864e5d0")
            // const mnemonic = await EthAccount.newMnemonic()
            const seed = await EthAccount.generateSeed("magnet left script engage tomorrow pause laugh wave fly sword afraid honey")
            const key = await EthAccount.generateKeys(seed)
			// const result = await EthAccount.test()
			// const result = await SIT.getAdminBal("0x4cacb1201920d599813e66ba99278685015f568b")
            const result = await SIT.addSitHolder(key.childPrivKey, "0x4cacb1201920d599813e66ba99278685015f568b", "0x79F3F3bF9c85c390d53194f211dAEB8f23019cbb", true, "Jude Sterling", 20, 0, 0, 0)
            res.send(result)
        } catch (error) {
            console.log("error >> ", error)
        }
    }

}
