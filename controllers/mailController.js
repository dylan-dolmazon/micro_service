const nodemailer = require('nodemailer');

require('dotenv').config();

function sendConfirmation(email, order_id){

    let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: "login",
                user: process.env.MAIL_FROM,
                pass: process.env.MAIL_PASSWORD
            }
        });
        
        // setup email data with unicode symbols
        let mailOptions = {
            from: process.env.MAIL_PASSWORD, // sender address
            to: email, // list of receivers
            subject: 'Confirmation de votre commande n° '+order_id, // Subject line
            text: `Votre commande à été validée et sera expédié dans les plus bref délais`, // plain text body
            html: `Votre commande à été validée et sera expédié dans les plus bref délais` // html body
        };
       
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
        });
}
module.exports = { sendConfirmation }