const nodemailer = require('nodemailer');
const Order = require('../models/OrderSchema');
function sendConfirmation(client, order){
    let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'pimpoadrien@gmail.com',
                pass: 'mggwxnswkagnwhfr'
            }
        });
        
        // setup email data with unicode symbols
        let mailOptions = {
            from: 'pimpoadrien@gmail.com', // sender address
            to: client.email, // list of receivers
            subject: 'Confirmation de votre commande n° '+order._id, // Subject line
            text: `Votre commande à été validée et sera expédié dans les plus bref délais`, // plain text body
            html: `Votre commande à été validée et sera expédié dans les plus bref délais` // html body
        };
        
       
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
        });
}
module.exports = { sendConfirmation }