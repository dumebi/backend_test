const EthAccount = require("../libraries/ethUser.js");
require("../helpers/connection.js").start();
const validate = require("../helpers/validation.js");
const secure = require("../helpers/encryption.js");
const User = require("../models/user.js");



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

            res.status(201).json({
                success : true,
                successMsg : "User created successfully",
                responseData : savedUser
            });

        } catch (error) {
            console.log("error >> ", error)
            let err = {
                status : 500,
                success : false,
                errMsg : 'Could not create user',
                devError : error
            }
            next(err)
        }

    },

    fetchShareholders : async function(req, res, next) {
        try {
            const users = await User.find()
            console.log("users >> ", users)
            res.status(200).json({
                success : true,
                successMsg : "Users fetched successfully",
                responseData : users
            });
        
        } catch (error) {
            let err = {
                status : 500,
                success : false,
                errMsg : 'Could not fetch cities',
                errCode : 'errDB',
                devError : error
            }
            next(err);
        }
    }

}