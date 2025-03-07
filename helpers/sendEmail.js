import nodemailer from 'nodemailer';
import 'dotenv/config';

const {UKR_NET_PASS, UKR_NET_EMAIL} = process.env;

const nodemailerConfig ={
    host: "smtp.ukr.net",
    port: 465, 
    secure: true,
    auth: {
        user: UKR_NET_EMAIL,
        pass: UKR_NET_PASS,
},
};

const transport = nodemailer.createTransport(nodemailerConfig);

const  sendEmail = async (data) => {
  
        const email = {...data, from: UKR_NET_EMAIL};
        const result = await transport.sendMail(email);
        return result;        
  
}


export default sendEmail;