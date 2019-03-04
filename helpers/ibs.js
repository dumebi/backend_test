
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

            if(result.body.data.AccountName != name){
                return false
            }

            return true

        } catch (error) {
            throw(error)
        }
    },

    soapFactory : {
        getRequestXML: (refId, reqType, nuban) => {
            var payload = `
            <?xml version="1.0" encoding="UTF-8"?> 
            <IBSRequest>                
                <ReferenceID>${refId}</ReferenceID>
                <RequestType>${reqType}</RequestType>
                <Account>${nuban}</Account> 
            </IBSRequest>                   
            `;

            return payload;

            // return {
            //     "IBSRequest": refId,
            //     "RequestType": reqType,
            //     "Account": nuban
            // }
        },
        getSerializedXML: (jsonPayload) => {
            try {
                var serialized = serializer.json2xml(jsonPayload);

                console.log("serialized >> ", serialized)
                return serialized 
            } catch (error) {
                console.log("error > ", error)
                throw(error)
            }
        }
    }
} 
