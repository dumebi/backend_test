var soap = require('soap');
var serializer = require('xml-js');

module.exports =  {
    soap : async () => {
        try {
            
            var url = 'http://10.0.41.102:818/IBSServices.asmx?wsdl';
            const client = await soap.createClient(url)
            const result = await client.IBSBridge(args)

            console.log("result >> ", result)
            return result

        } catch (error) {
            console.log("error >> ", error)
            throw(error)
        }
    },
    soapFactory : {
        getRequestJSON: (refId, reqType, nuban) => {
            return {
                "IBSRequest": refId,
                "RequestType": reqType,
                "Account": nuban
            }
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
