const nodemailer = require('nodemailer');
const logger = require('./logger');


const  { EMAIL_USER, EMAIL_PASSWORD} = process.env;
const from= 'info@imin.com';
function sendHtmlMail(subject, html, to) {
  if (!EMAIL_USER || !EMAIL_PASSWORD) {
    logger.info('[Email-service] no email user/password, email will not be sent');
    return;
  }
  const mailOptions = {
    from,
    to,
    subject,
    html,
  };
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });
  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      logger.error(`[Email-service] error sending email: [from: ${mailOptions.from}] [to: ${to}] [subject: ${subject}] - error: ${JSON.stringify(error)}`);
    } else {
      logger.info(`[Email-service] email sent: [from: ${mailOptions.from}] [to: ${to}] [subject: ${subject}]`);
    }
  });
}


module.exports = {
  sendHtmlMail,
};
