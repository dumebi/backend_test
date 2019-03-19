const { Token } = require("../libraries/tokenContract.js");
const token = new Token();

module.exports = {
  async sample(req, res, next) {
    try {
      // const result1 = await token.transferOwnership(
      //   "c32214f0887908a8607c9db7d79b87531ae939a40056c3a7858f532d3f8408de",
      //   "0xbb723b459f84c24665a89159d94701321864e5d0",
      //   "0xbb723b459f84c24665a89159d94701321864e5d0"
      // );

      // const result1 = await token.addAdmin(
      //   "fbdc971e37ab5410f32ae9a3580d7283c3a20869c243d63cb499e988326c466e",
      //   "0x368eb314285235b7f692fbf14d075760e957848e",
      //   "0x8c96f26c8a98ee00a372e0b8c8853096447714c4"
      // );
      // const result1 = await token.removeAdmin(
      //   "c32214f0887908a8607c9db7d79b87531ae939a40056c3a7858f532d3f8408de",
      //   "0xbb723b459f84c24665a89159d94701321864e5d0",
      //   "0xfe52ba0ae495784058d9b5d21743c24eab9bffc1"
      // );
      // return res.send({ result1 });
      // const result2 = await token.getOwner(
      //   "0xbb723b459f84c24665a89159d94701321864e5d0"
      // );
      // const result1 = await token.getTokenInfo("0x368eb314285235b7f692fbf14d075760e957848e");
      const result1 = await token.getTokenbase();
      // const result5 = await token.getTotalSupply();
      // const result6 = await token.getTokenbaseBal(result4);
      // const result7 = await token.getBalance(
      //   "0x1f08822bb986329241ba2cfe4209167506483c4f",
      //   "0x2f25bbd78503765ba61d83f657e5c3c1f54456ba"
      // );
      // ========================== Authorizer Activity ========================
      // const result1 = await token.addAuthorizer(
      //   "c32214f0887908a8607c9db7d79b87531ae939a40056c3a7858f532d3f8408de",
      //   "0xbb723b459f84c24665a89159d94701321864e5d0",
      //   "0x45d2387c6c99c49b859feffbc029d7e605106298",
      //   "Upfront Scheme"
      // );
      // const result2 = await token.removeAuthorizer(
      //   "0x45d2387c6c99c49b859feffbc029d7e605106298"
      // );
      // const result4 = await token.getAuthorizer(
      //   "0xbb723b459f84c24665a89159d94701321864e5d0",
      //   "0x45d2387c6c99c49b859feffbc029d7e605106298",
      //   0
      // );
      // const result2 = await token.addShareholder(
      //   "c32214f0887908a8607c9db7d79b87531ae939a40056c3a7858f532d3f8408de",
      //   "0xbb723b459f84c24665a89159d94701321864e5d0",
      //   "0x2f25bbd78503765ba61d83f657e5c3c1f54456ba",
      //   true,
      //   false
      // );
      // const result2 = await token.getShareholder(
      //   "0x1F08822Bb986329241Ba2Cfe4209167506483C4f",
      //   "0x1F08822Bb986329241Ba2Cfe4209167506483C4f"
      // );

      // const result3 = await token.updateShareholder(
      //   "c32214f0887908a8607c9db7d79b87531ae939a40056c3a7858f532d3f8408de",
      //   "0xbb723b459f84c24665a89159d94701321864e5d0",
      //   "0x1F08822Bb986329241Ba2Cfe4209167506483C4f",
      //   true,
      //   false
      // );
      // const result4 = await token.isValidShareholder(
      //   "0x1F08822Bb986329241Ba2Cfe4209167506483C4f",
      //   "0x1F08822Bb986329241Ba2Cfe4209167506483C4f"
      // );
      // const result5 = await token.isWithhold(
      //   "0x1F08822Bb986329241Ba2Cfe4209167506483C4f",
      //   "0x1F08822Bb986329241Ba2Cfe4209167506483C4f"
      // );
      // const result6 = await token.removeShareholder(
      //   "c32214f0887908a8607c9db7d79b87531ae939a40056c3a7858f532d3f8408de",
      //   "0xbb723b459f84c24665a89159d94701321864e5d0",
      //   "0x1F08822Bb986329241Ba2Cfe4209167506483C4f"
      // );
      // return res.send({ result2});
      // ====================== For Schedules and Minting ========================
      // const result3 = await token.createSchedule(
      //   "c32214f0887908a8607c9db7d79b87531ae939a40056c3a7858f532d3f8408de",
      //   "0xbb723b459f84c24665a89159d94701321864e5d0",
      //   1,
      //   40,
      //   "Upfront Schedule",
      //   "This is an upfront for salary advance to Uche"
      // );
      // const result2 = await token.getSchedule(
      //   "0xbb723b459f84c24665a89159d94701321864e5d0",
      //   1
      // );
      // const result4 = await token.approveSchedule(
      //   "3c10300074f325d4ccd979a21a494a7d9042371b707dda64320817375b160097",
      //   "0x45d2387c6c99c49b859feffbc029d7e605106298",
      //   1,
      //   "This is appropriate"
      // );
      // const result4 = await token.rejectSchedule(
      //   "3c10300074f325d4ccd979a21a494a7d9042371b707dda64320817375b160097",
      //   "0x45d2387c6c99c49b859feffbc029d7e605106298",
      //   1,
      //   "This is not appropriate"
      // );
      // const result5 = await token.removeSchedule(
      //   "c32214f0887908a8607c9db7d79b87531ae939a40056c3a7858f532d3f8408de",
      //   "0xbb723b459f84c24665a89159d94701321864e5d0",
      //   1,
      //   "This is an upfront for salary advance to Uche"
      // );
      // const result6 = await token.mint(
      //   "c32214f0887908a8607c9db7d79b87531ae939a40056c3a7858f532d3f8408de",
      //   "0xbb723b459f84c24665a89159d94701321864e5d0",
      //   1,
      //   "0x1F08822Bb986329241Ba2Cfe4209167506483C4f",
      //   10,
      //   "Lien",
      //   "1549974280",
      //   "This is an upfront minting to Uche"
      // );
      // const result7 = await token.withdraw(
      //   "c32214f0887908a8607c9db7d79b87531ae939a40056c3a7858f532d3f8408de",
      //   "0xbb723b459f84c24665a89159d94701321864e5d0",
      //   "0x1f08822bb986329241ba2cfe4209167506483c4f",
      //   5,
      //   "Tradable",
      //   0,
      //   "Allocation was over"
      // );
      // ================================= For Transfers ================================
      // const result1 = await token.transfer(
      //   "3065a5faf500affedf57a744baf7a3a9f567639a20253a97c47d035a15e7e1db",
      //   "0x1F08822Bb986329241Ba2Cfe4209167506483C4f",
      //   "0x56ad8d441dc225a6c2a4fdd408f8084a378a4ac6",
      //   5
      // );
      // const result2 = await token.approveSender(
      //   "3065a5faf500affedf57a744baf7a3a9f567639a20253a97c47d035a15e7e1db",
      //   "0x1F08822Bb986329241Ba2Cfe4209167506483C4f",
      //   "0x56ad8d441dc225a6c2a4fdd408f8084a378a4ac6",
      //   3
      // // );
      // const result3 = await token.getAllowance(
      //   "0x1F08822Bb986329241Ba2Cfe4209167506483C4f",
      //   "0x1F08822Bb986329241Ba2Cfe4209167506483C4f",
      //   "0x56ad8d441dc225a6c2a4fdd408f8084a378a4ac6"
      // );
      // const result4 = await token.transferFrom(
      //   "82dbdb6ab9df12473e066c124e415d1f0aadfe4f15230677be7af402849e84c0",
      //   "0x56ad8d441dc225a6c2a4fdd408f8084a378a4ac6",
      //   "0x1F08822Bb986329241Ba2Cfe4209167506483C4f",
      //   "0x2f25bbd78503765ba61d83f657e5c3c1f54456ba",
      //   1
      // );
      // return res.send({  result1, result2, result3, result4});
      // return res.send({ result3});
      // =================== For Share Category ===================
      // const result1 = await token.totalRecordsPerCat(
      //   "0xbb723b459f84c24665a89159d94701321864e5d0",
      //   "0x1f08822bb986329241ba2cfe4209167506483c4f",
      //   "Lien"
      // );

      return res.send({ result1});
      // const result1 = await token.getRecordByCat(
      //   "0xbb723b459f84c24665a89159d94701321864e5d0",
      //   "0x1f08822bb986329241ba2cfe4209167506483c4f",
      //   "Lien",
      //   0
      // );
      // const result2 = await token.makeTradable(
      //   "c32214f0887908a8607c9db7d79b87531ae939a40056c3a7858f532d3f8408de",
      //   "0xbb723b459f84c24665a89159d94701321864e5d0",
      //   "0x1f08822bb986329241ba2cfe4209167506483c4f",
      //   "Lien",
      //   0
      // );
    } catch (error) {
      console.log('error >> ', error);
    }
  }
};
