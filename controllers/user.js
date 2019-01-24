const EthAccount = require("../libraries/ethUser.js");
const SIT = require("../libraries/sitHolder.js");
const validate = require("../helpers/validation.js");
const secure = require("../helpers/encryption.js");
const User = require("../models/user.js");
const HttpStatus = require("../helpers/httpStatus");
const { getAsync, client } = require("../helpers/redis");
const {
  paramsNotValid,
  sendMail,
  config,
  checkToken
} = require("../helpers/utils");

module.exports = {
  addShareholders: async function(req, res, next) {
    try {
      const validReq = await validate.users(req.body);

      const userMnemonic = await EthAccount.newMnemonic();
      const mnemonicSeed = await EthAccount.generateSeed(userMnemonic);
      const Ethkeys = await EthAccount.generateKeys(mnemonicSeed);

      const user = new User({
        userType: validReq.userType,
        employmentStatus: validReq.employmentStatus,
        userGroup: validReq.userGroup,
        staffId: validReq.staffId,
        email: validReq.email,
        fullname: validReq.fullname,
        isVesting: validReq.isVesting,
        lienPeriod: validReq.lienPeriod,
        dividendAcct: validReq.dividendAcct,
        beneficiary: validReq.beneficiary,
        password: validReq.password,
        workflow: validReq.workflow,
        status: validReq.status
      });

      user.mnemonic = await secure.encrypt(userMnemonic);
      user.privateKey = await secure.encrypt(Ethkeys.childPrivKey);
      user.publicKey = await secure.encrypt(Ethkeys.childPubKey);
      user.address = Ethkeys.childAddress;

      const savedUser = await user.save();
      delete savedUser.password;

      await this.addUserOrUpdateCache(savedUser);

      res.send({
        status: true,
        message: "User created successfully",
        data: savedUser
      });
    } catch (error) {
      console.log("error >> ", error);
      let err = {
        status: false,
        message: "Could not create user",
        devError: error
      };
      next(err);
    }
  },

  async addUserOrUpdateCache(user) {
    try {
      const sttpUsers = await getAsync("users");
      if (sttpUsers != null && JSON.parse(sttpUsers).length > 0) {
        const users = JSON.parse(sttpUsers);
        users[user._id] = user;
        await client.set("users", JSON.stringify(users));
      }
    } catch (err) {
      console.log(err);
    }
  },

  test: async function(req, res, next) {
    try {
      // const result = await SIT.getAdminBal("0xbb723b459f84c24665a89159d94701321864e5d0")
      // const mnemonic = await EthAccount.newMnemonic()
      //   const seed = await EthAccount.generateSeed(
      //     "tribe crack long unfold clap today olympic retreat dance pretty sting clarify"
      //   );
      //   const key = await EthAccount.generateKeys(seed);
      // const result = await EthAccount.test()
      // const result = await SIT.getAdminBal("0x4cacb1201920d599813e66ba99278685015f568b")
      const result = await SIT.addShareholder(
        "c32214f0887908a8607c9db7d79b87531ae939a40056c3a7858f532d3f8408de",
        "0xbb723b459f84c24665a89159d94701321864e5d0",
        "0x56ad8d441dc225a6c2a4fdd408f8084a378a4ac6",
        true,
        false,
        "abbey Biodun"
      );
      // const result = await SIT.updateHolderStatus(key.childPrivKey, "0xa5146721df04a5e2e5646649849db4ab6d675448", "0xf217c23dd84e55497233b1b88f1cfcec3aaaa9ec", false)
      // const result = await SIT.getShareholder(
      //   "0xbb723b459f84c24665a89159d94701321864e5d0",
      //   "0x1f08822bb986329241ba2cfe4209167506483c4f"
      // );
      //   const result = await SIT.getBal(
      //     "0xBb723B459F84c24665a89159d94701321864e5d0",
      //     "0x87741ffaf59aa62fb42e26fba4d25daffbf2987f"
      //   );

      res.send(result);
    } catch (error) {
      console.log("error >> ", error);
    }
  }
};
