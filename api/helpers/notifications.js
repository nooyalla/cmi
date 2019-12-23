const models = require('../models');
const { getEventParticipants} = require('../services/events');
const { sendHtmlMail} = require('../services/emails');
const NOTIFICATION_INTERVAL = process.env.NOTIFICATION_INTERVAL || 15;
const intervalTime = NOTIFICATION_INTERVAL * 1000 * 60;
const Op = models.Sequelize.Op;
async function handleEvent(e){
    const event = e.toJSON()
    event.participants = await getEventParticipants(event.id);
    const eventIsOn = event.minParticipants <= event.participants.length;
    const subject = eventIsOn ?  `${event.title} Event is ON` :  `${event.title} Event was canceled`;
    const html = `<div>
            TODO..
        </div>`;
    console.log(` ${event.participants} participants to notify. email subject: ${subject}`);
    await Promise.all(event.participants.map(p=>{
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
