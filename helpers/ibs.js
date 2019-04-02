
const axios = require('axios');
const crypto = require('crypto');

var axiosInstance = axios.create({
    baseURL: 'https://sbdevzone.sterlingbankng.com/Spay/api/Spay/',
    headers : {"AppId" :  55 }
});

module.exports =  {
    verifyAccount : async (account, fname, lname) => {
        try {
            const result = await axiosInstance.post("/SBPNameEnquiry", {
                  "Referenceid": "4404",
                  "RequestType": 219,
                  "Translocation": "100,100",
                  "NUBAN": account
                }
            )
            console.log("compare >> ", result.data.data.AccountName.includes(fname.toUpperCase()) &&  result.data.data.AccountName.includes(lname.toUpperCase()))
            console.log("gotten >> ", result.data.data.AccountName, "sent >> ",fname.toUpperCase(), ' ', lname.toUpperCase()  )
            if (result.data.response == "success" && result.data.data.AccountName.includes(fname.toUpperCase()) &&  result.data.data.AccountName.includes(lname.toUpperCase())) {
                return true
            }
            return false

        } catch (error) {
            throw(error)
        }
    },

    async transfer(referenceid, fromAccount, toAccount, amount, remark) {
        try {

            var paymentRef = await crypto.randomBytes(20)
            paymentRef = paymentRef.toString('hex')

            const result = await axiosInstance.post("/SBPT24txnRequest ", {
                "Referenceid": referenceid,
                "RequestType": 110,
                "Translocation": "100,100",
                "amt": amount,
                "tellerid": "11111",
                "frmacct": fromAccount,
                "toacct": toAccount,
                "paymentRef": paymentRef,
                "remarks": "STTP Direct Debit/Credit For Naira Wallet : "+remark
                }
            )
            if (result.data.response == "00") {
                return true
            }
            return false

        } catch (error) {
            throw(error)
        }
    }

} 
