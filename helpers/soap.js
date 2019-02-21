var soap = require('soap');

export default soap = async (args) => {
    try {
        
        var url = 'http://10.0.41.102:818/IBSServices.asmx';
        const client = await soap.createClient(url)
        const result = await client.MyFunctionAsync(args)

        return result
    } catch (error) {
        throw(error)
    }

} 
