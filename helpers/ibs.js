
const Request = require('request');

module.exports =  {
    verifyAccount : async (account, name) => {
        try {

            const result = await Request.post({
                "headers": {"AppId" :  55 },
                "url": "https://sbdevzone.sterlingbankng.com/Spay/api/Spay/SBPNameEnquiry",
                "body": JSON.stringify({
                  "Referenceid": "4404",
                  "RequestType": 219,
                  "Translocation": "100,100",
                  "NUBAN": account
                })
            })

            if (result.response != "success") {
                throw({message: result.message, responseCode: result.responseCode})
            }
            console.log("result >> ", result)
            if(result.body.data.AccountName != name){
                return false
            }

            return true

        } catch (error) {
            throw(error)
        }
    },

    async checkBalance() {

    },

    async transfer() {

    }

} 
