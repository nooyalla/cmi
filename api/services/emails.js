const nodemailer = require('nodemailer');
const logger = require('./logger');

const from = 'noo.yalla.2019@gmail.com';

const  EMAIL_USER = from;
const EMAIL_PASSWORD = "Bazinga2019";

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
