const models = require('../models');
const moment = require('moment');
const { getEventParticipants} = require('../services/events');
const { sendHtmlMail} = require('../services/emails');
const NOTIFICATION_INTERVAL = process.env.NOTIFICATION_INTERVAL || 15;
const intervalTime = NOTIFICATION_INTERVAL * 1000 * 60;
const Op = models.Sequelize.Op;
async function handleEvent(e){
    const event = e.toJSON()
    event.participants = await getEventParticipants(event.id);
    const eventIsOn = event.minParticipants <= event.participants.length;
    const subject = eventIsOn ?  `its on! The event ${event.title} is confirmed` :  `event canceled! The event ${event.title} didn't reach minimum participants`;

    console.log(` ${event.participants} participants to notify. email subject: ${subject}`);
    await Promise.all(event.participants.map(p=>{
        const html = eventIsOn ? `<!doctype html>
                <html lang="en">
                  <head>
                    <meta charset="utf-8">
                  </head>
                  <body>
                    <div>
                        Hey ${p.firstName},<br/><br/>
                        
                        The event ${event.title} will take place at "${event.location}" <br/>
                        on "${moment(event.startDate).format('MMMM Do YYYY, h:mm a')}". <br/> 
                        
                        ${p.additionalItem && p.additionalItem.length>0 ? `You should bring ${p.additionalItem}`:''} <br/><br/><br/>
                        
                        See you soon :)  <br/><br/><br/>
                  
                        ${event.participants[0].firstName}
                    </div>
                    
                  </body>
                </html>
`: ''
        return sendHtmlMail(subject, html, p.email);
    }));

    await models.events.update({participantsHaveBeenNotify: true}, {
        where:{
           id: event.id
        }
    });
}
async function checkForEvents(){
    const events = await models.events.findAll({
        where:{
            participantsHaveBeenNotify: false,
            lastConfirmationDate: {
                [Op.lte]: new Date()
            }
        }
    });

    events.forEach(handleEvent);

}
console.log('starting notification interval:',intervalTime);
setInterval(checkForEvents, intervalTime);
