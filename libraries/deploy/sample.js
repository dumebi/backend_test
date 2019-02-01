const result1 = await SIT.transferOwnership(
  "c32214f0887908a8607c9db7d79b87531ae939a40056c3a7858f532d3f8408de",
  "0xBb723B459F84c24665a89159d94701321864e5d0",
  "0x56ad8d441dc225a6c2a4fdd408f8084a378a4ac6"
);
const result2 = await SIT.getOwner(
  "0xbb723b459f84c24665a89159d94701321864e5d0"
);
const result3 = await SIT.getTokenInfo(
  "0x1f08822bb986329241ba2cfe4209167506483c4f"
);
const result4 = await SIT.getTokenbase(
  "0xBb723B459F84c24665a89159d94701321864e5d0"
);
const result5 = await SIT.getTotalSupply();
const result6 = await SIT.getTokenbaseBal(result1);
const result7 = await SIT.getBalance(
  "0x1f08822bb986329241ba2cfe4209167506483c4f",
  "0x1f08822bb986329241ba2cfe4209167506483c4f"
);

const result1 = await SIT.addAuthorizer(
  "82dbdb6ab9df12473e066c124e415d1f0aadfe4f15230677be7af402849e84c0",
  "0x56AD8D441DC225A6C2A4fDd408F8084a378a4AC6",
  "0x45d2387c6c99c49b859feffbc029d7e605106298",
  "Upfront Scheme"
);
const result2 = await SIT.removeAuthorizer(
  "82dbdb6ab9df12473e066c124e415d1f0aadfe4f15230677be7af402849e84c0",
  "0x56AD8D441DC225A6C2A4fDd408F8084a378a4AC6",
  "0x45d2387c6c99c49b859feffbc029d7e605106298"
);
const result3 = await SIT.getAuthorizerCount(
  "0x1f08822bb986329241ba2cfe4209167506483c4f"
);
const result4 = await SIT.getAuthorizer(
  "0x1f08822bb986329241ba2cfe4209167506483c4f",
  "0x45d2387c6c99c49b859feffbc029d7e605106298"
);

const result1 = await SIT.addShareholder(
  "82dbdb6ab9df12473e066c124e415d1f0aadfe4f15230677be7af402849e84c0",
  "0x56ad8d441dc225a6c2a4fdd408f8084a378a4ac6",
  "0x1f08822bb986329241ba2cfe4209167506483c4f",
  true,
  false
);
const result2 = await SIT.getShareholder(
  "0x1F08822Bb986329241Ba2Cfe4209167506483C4f",
  "0x1F08822Bb986329241Ba2Cfe4209167506483C4f"
);
const result3 = await SIT.updateShareholder(
  "825b825f2b3ad4f258ef195b605d9cda5e0f974b4187fe4371ec9b37ae3f5973",
  "0x87741FfaF59aa62fb42e26Fba4D25DaFfBF2987F",
  "0x1f08822bb986329241ba2cfe4209167506483c4f",
  false,
  true
);
const result4 = await SIT.isValidShareholder(
  "0x1F08822Bb986329241Ba2Cfe4209167506483C4f",
  "0x1F08822Bb986329241Ba2Cfe4209167506483C4f"
);
const result5 = await SIT.isWithhold(
  "0x1F08822Bb986329241Ba2Cfe4209167506483C4f",
  "0x1F08822Bb986329241Ba2Cfe4209167506483C4f"
);

const result1 = await SIT.createSchedule(
  "82dbdb6ab9df12473e066c124e415d1f0aadfe4f15230677be7af402849e84c0",
  "0x56ad8d441dc225a6c2a4fdd408f8084a378a4ac6",
  1,
  40,
  "Upfront Schedule",
  "This is an upfront for salary advance to Uche"
);
const result2 = await SIT.getSchedule(
  "0x87741FfaF59aa62fb42e26Fba4D25DaFfBF2987F",
  1
);
const result3 = await SIT.approveSchedule(
  "3c10300074f325d4ccd979a21a494a7d9042371b707dda64320817375b160097",
  "0x45d2387c6c99c49b859feffbc029d7e605106298",
  1,
  "This is appropriate"
);
const result4 = await SIT.rejectSchedule(
  "3c10300074f325d4ccd979a21a494a7d9042371b707dda64320817375b160097",
  "0x45d2387c6c99c49b859feffbc029d7e605106298",
  2,
  "This is not appropriate"
);
const result5 = await SIT.removeSchedule(
  "82dbdb6ab9df12473e066c124e415d1f0aadfe4f15230677be7af402849e84c0",
  "0x56ad8d441dc225a6c2a4fdd408f8084a378a4ac6",
  2,
  "This is an upfront for salary advance to Uche"
);
const result6 = await SIT.mint(
  "82dbdb6ab9df12473e066c124e415d1f0aadfe4f15230677be7af402849e84c0",
  "0x56ad8d441dc225a6c2a4fdd408f8084a378a4ac6",
  1,
  "0x1F08822Bb986329241Ba2Cfe4209167506483C4f",
  10,
  "Tradable",
  0,
  "This is an upfront minting to Uche"
);
const result7 = await SIT.withdraw(
  "82dbdb6ab9df12473e066c124e415d1f0aadfe4f15230677be7af402849e84c0",
  "0x56ad8d441dc225a6c2a4fdd408f8084a378a4ac6",
  "0x1f08822bb986329241ba2cfe4209167506483c4f",
  50,
  "Lien",
  0,
  "Allocation was over"
);

const result2 = await SIT.transfer(
  "3065a5faf500affedf57a744baf7a3a9f567639a20253a97c47d035a15e7e1db",
  "0x1F08822Bb986329241Ba2Cfe4209167506483C4f",
  "0x87741ffaf59aa62fb42e26fba4d25daffbf2987f",
  20
);
const result1 = await SIT.approveSender(
  "3065a5faf500affedf57a744baf7a3a9f567639a20253a97c47d035a15e7e1db",
  "0x1F08822Bb986329241Ba2Cfe4209167506483C4f",
  "0x87741ffaf59aa62fb42e26fba4d25daffbf2987f",
  10
);
const result2 = await SIT.getAllowance(
  "0x1F08822Bb986329241Ba2Cfe4209167506483C4f",
  "0x1F08822Bb986329241Ba2Cfe4209167506483C4f",
  "0x87741ffaf59aa62fb42e26fba4d25daffbf2987f"
);
const result = await SIT.transferFrom(
  "825b825f2b3ad4f258ef195b605d9cda5e0f974b4187fe4371ec9b37ae3f5973",
  "0x87741ffaf59aa62fb42e26fba4d25daffbf2987f",
  "0x1F08822Bb986329241Ba2Cfe4209167506483C4f",
  "0xbb723b459f84c24665a89159d94701321864e5d0",
  5
);

const result1 = await SIT.addErrorMessage(
  "82dbdb6ab9df12473e066c124e415d1f0aadfe4f15230677be7af402849e84c0",
  "0x56ad8d441dc225a6c2a4fdd408f8084a378a4ac6",
  "SEND_TRANSFER_BLOCKED",
  "Sender not authorized"
);
const result2 = await SIT.updateErrorMessage(
  "82dbdb6ab9df12473e066c124e415d1f0aadfe4f15230677be7af402849e84c0",
  "0x56ad8d441dc225a6c2a4fdd408f8084a378a4ac6",
  "success",
  "Was successful!"
);
const result3 = await SIT.removeErrorMessage(
  "82dbdb6ab9df12473e066c124e415d1f0aadfe4f15230677be7af402849e84c0",
  "0x56ad8d441dc225a6c2a4fdd408f8084a378a4ac6",
  "success"
);

const result1 = await SIT.getRecordByCat(
  "0x56ad8d441dc225a6c2a4fdd408f8084a378a4ac6",
  "0x1f08822bb986329241ba2cfe4209167506483c4f",
  "Lien",
  0
);
const result2 = await SIT.makeTradable(
  "82dbdb6ab9df12473e066c124e415d1f0aadfe4f15230677be7af402849e84c0",
  "0x56ad8d441dc225a6c2a4fdd408f8084a378a4ac6",
  "0x1f08822bb986329241ba2cfe4209167506483c4f",
  "Lien",
  0
);
