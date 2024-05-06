import nodemailer from "nodemailer";
import env from "dotenv";
env.config()
function mailSend(tomail,data) {
    var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'kayalalakshman01@gmail.com',
        pass: process.env.APP_PASSWORD
    }
    });
    
    var mailOptions = {
    from: 'kayalalakshman01@gmail.com',
    to: tomail,
    subject: 'App points verification',
    text: data
    };

    transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
    });
}

export default mailSend;