const HttpStatus = require('../helpers/status');
const { LienModel } = require('../models/share');
const publisher = require('../helpers/rabbitmq');

const shareController = {

    /**
     * Get "Lien" (shares) 
     * @description Fetch all Lien by User ID
     * @returns {object} lien
     */
    async getLien(req, res, next) {
        console.log('getLien');
    },

    /**
     * Create "Lien" (shares) 
     */
    async createLien(req, res, next) {

        try {

            const period = '24'
            const lien = new LienModel({
                userID: req.body.userID,
                period: period,
                date_added: req.body.date_added
            })
        
            await lien.save()     
            
            await Promise.all([publisher.queue('CREATE_LIEN_BLOCKCHAIN', {
                amount: req.body.amount, date_added: req.body.date_added, record_id: lien._id
            })])

            return res.status(HttpStatus.OK).json({ status: 'success', message: 'Minting successfully' });
            
        } catch (error) {
            console.log('error >> ', error)
            const err = {
              http: HttpStatus.BAD_REQUEST,
              status: 'failed',
              message: 'Could not create lien',
              devError: error
            }
            next(err)  
        }
    },    

    /**
     * Get "Upfront" (shares) 
     * @description Fetch all Upfront by User ID
     * @returns {object} upfront
     */
    async getUpfront(req, res, next) {
        console.log('createUpfront');
    },

    /**
     * Create "Upfront" (shares) 
     */
    async createUpfront(req, res, next) {
        console.log('createUpfront');
    },    

    /**
     * Get "Loan" (shares) 
     * @description Fetch all Loan by User ID
     * @returns {object} loan
     */
    async getLoan(req, res, next) {
        console.log('getLoan');
    },    
    
    /**
     * Create "Loan" (shares) 
     */
    async createLoan(req, res, next) {
        console.log('createLoan');
    }      
}

module.exports = shareController