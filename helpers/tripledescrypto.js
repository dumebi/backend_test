
const crypto = require('crypto');

/*
 *  TRIPLEDESCRYPTO CLASS
 *  Dev Oluchi Enebeli
 *  Date: 2019
 * 
 */

module.exports =  {
    BinaryToString : BinaryToString, 
    encrypt : encrypt,
    decrypt : decrypt
}
 
async function BinaryToString (binary) {
    try {
        
        if(binary.length < 8 || (binary.length % 8) != 0)
        return "";

        var builder = "";
        for(var idx = 0; idx < binary.length; idx += 8){
                var sub = binary.substring(idx, idx + 8);  
            var ascii = String.fromCharCode(97 + parseInt(sub, 2));
            builder += ascii;
        }

        return builder;
    }catch(error){
        console.log("error >> ", error)
        return "";
    }
}  

async function encrypt(decrypted){
    try
    {
        const vector = await BinaryToString("0000000100000010000000110000010100000111000010110000110100010001")
        const key = await BinaryToString("000000010000001000000011000001010000011100001011000011010001000100010010000100010000110100001011000001110000001000000100000010000000000100000010000000110000010100000111000010110000110100010001")
        const sharedvector = Buffer.from(vector, 'utf-8');
        const sharedkey = Buffer.from(key, 'utf-8');

        const toEncrypt = Buffer.from(decrypted , 'ascii');           
        const cipher = crypto.createCipheriv('des-ede3-cbc', sharedkey, sharedvector);
        var encrypted = cipher.update(toEncrypt, 'ascii', 'base64');
        encrypted += cipher.final('base64')

        console.log("encrypted >> ", encrypted)
        return encrypted
    }catch(error){
        console.log("error >> ", error)
        return "";
    }
}

async function decrypt(encrypted) {
    try {

        const vector = await BinaryToString("0000000100000010000000110000010100000111000010110000110100010001")
        const key = await BinaryToString("000000010000001000000011000001010000011100001011000011010001000100010010000100010000110100001011000001110000001000000100000010000000000100000010000000110000010100000111000010110000110100010001")
        const sharedvector = Buffer.from(vector, 'utf-8');
        const sharedkey = Buffer.from(key, 'utf-8');
    
        const toDecrypt = Buffer.from(encrypted , 'base64');           
        const decipher = await crypto.createDecipheriv('des-ede3-cbc', sharedkey, sharedvector);
        var decrypted = await decipher.update(toDecrypt, 'base64', 'utf8');
        decrypted += decipher.final('utf8')

    
        return decrypted;
    }catch(error){
        console.log("error >> ", error)
        return "";
    }
}
