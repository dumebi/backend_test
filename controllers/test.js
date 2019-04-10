const { Token } = require("../libraries/tokenContract.js");
const ethUser = require("../libraries/ethUser.js");
const token = new Token("0xb2ac9122bafc15cec45e364f13118963628857462045d74f2e45c0e3aa21f6d8");


module.exports = {
  async sample(req, res, next) {
    try {
      
      // const result1 = await token.transferOwnership(
      //   "c32214f0887908a8607c9db7d79b87531ae939a40056c3a7858f532d3f8408de",
      //   "0xbb723b459f84c24665a89159d94701321864e5d0",
      //   "0xbb723b459f84c24665a89159d94701321864e5d0"
      // );

      // const result11 = await token.addAdmin(
      //   "0xd6eef2f5a38c758693e35c9a27b4242fa4e0462e"
      // );
      // const result12 = await token.addAdmin(
      //   "0x14a6dab043b1a31f7bc483b1871a73156fda699f"
      // );
      // const result13 = await token.removeAdmin(
      //   "0xd6eef2f5a38c758693e35c9a27b4242fa4e0462e"
      // );
      // return res.send({ result1 });
      // const result2 = await token.getOwner(
      //   "0xbb723b459f84c24665a89159d94701321864e5d0"
      // );
      // const result1 = await token.getTokenInfo();
      // const result1 = await token.getTokenbase();
      // const result5 = await token.getTotalSupply();
      // const result6 = await token.getTokenbaseBal(result1);
      // const result7 = await token.getBalance(
      //   "0x69210aa0db2606e7efd29fb4e77a215d8b682c76"
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
      // const result1 = await token.addShareholder(
      //   "0xb04ba7d7e4c41f0f2037d858929192cfefc77efb",
      //   false
      // );
      // const mne = await ethUser.newMnemonic()
      // const seed = await ethUser.generateSeed(mne)
      // const key = await ethUser.generateKeys(seed)
      // console.log(key)
      // const transact = await provider.getSigner(0).sendTransaction(
      //   {
      //     to: "0x54A86D02D6A034F8B3F327Cb424B29BF949575b1",
      //     value: 50
      // })
      // const bal1 = await ethUser.balance("0xc3a96259891bc4efab334bfe9e98ed194a3bb836")
      // const transfered = await ethUser.transfer("0xc3a96259891bc4efab334bfe9e98ed194a3bb836","2","0xfbdc971e37ab5410f32ae9a3580d7283c3a20869c243d63cb499e988326c466e")
      const bal = await ethUser.balance("0xC26e9c39465c497f8DFb6821b11ac63a53e2d3E7")//0xC26e9c39465c497f8DFb6821b11ac63a53e2d3E7 0x735C0Ef15D2812A1927428bD40D607c40d264414
      // const result1 = {
      //   bal1,
      //   bal,
      //   // // transact
      //   transfered
      // }
      // const result2 = await token.getShareholder(
      //   "0x8c96f26c8a98ee00a372e0b8c8853096447714c4"
      // );

      // const result3 = await token.updateShareholder(
      //   "c32214f0887908a8607c9db7d79b87531ae939a40056c3a7858f532d3f8408de",
      //   "0xbb723b459f84c24665a89159d94701321864e5d0",
      //   "0x1F08822Bb986329241Ba2Cfe4209167506483C4f",
      //   true,
      //   false
      // );
      // const result14 = await token.isValidShareholder(
      //   "0x8c96f26c8a98ee00a372e0b8c8853096447714c4"
      // );
      // const result15 = await token.isWithhold(
      //   "0x8c96f26c8a98ee00a372e0b8c8853096447714c4"
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
      // const result1 = await token.addToEscrow(50);
      // const result2 = await token.getTotalInEscrow();
      // const result3 = await token.removeFromEscrow(20);
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
      //   "0x8c96f26c8a98ee00a372e0b8c8853096447714c4",
      //   0
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

      return res.send({bal});
      // return res.send({result1, result2, result3, result7});
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
