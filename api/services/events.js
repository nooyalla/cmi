const { notFound, badRequest, forbidden } = require('boom');
const models = require('../models');

/***
 *
 * @param eventId
 * @return {Promise<Uint8Array | BigInt64Array | {firstName: (User.firstName|{field, type}), familyName: (User.familyName|{field, type}), imageUrl: (string|User.imageUrl|{field, type}|Events.imageUrl), id: *, email: (User.email|{type})}[] | Float64Array | Int8Array | Float32Array | Int32Array | Uint32Array | Uint8ClampedArray | BigUint64Array | Int16Array | Uint16Array>}
 */
async function getEventParticipants(eventId) {
  const participants = await models.eventUsers.findAll({
    sort: ['confirmationDate ASC' ],
    where:{
      eventId
    }
  });
  const results = await Promise.all(participants.map(async ({userId, additionalItem})=>{
    const user = await models.users.findOne({
      where:{
        id: userId
      }
    });
    return {
      id: user.id,
      firstName:user.firstName,
      familyName:user.familyName,
      email:user.email,
      imageUrl:user.imageUrl,
      additionalItem,
    }
  }));
  return results;
}

/***
 *
 * @param userContext
 * @param eventId
 * @return {Promise<*>}
 */
async function getEvent(userContext, eventId) {
  const result = await models.events.findOne({
    where: {
      id: eventId,
    }
  });
  if (!result) {
    throw notFound('event not found', { eventId });
  }
  const event = result.toJSON();
  event.participants = await getEventParticipants(eventId);

  return event;
}

/***
 *
 * @param userContext
 * @return {Promise<{results: Uint8Array | BigInt64Array | *[] | Float64Array | Int8Array | Float32Array | Int32Array | Uint32Array | Uint8ClampedArray | BigUint64Array | Int16Array | Uint16Array}>}
 */
async function getEvents(userContext) {
  const userId = userContext.id;

  const userEvents = await models.events.findAll({
    order: [['createdAt', 'ASC']],
    where: {
      creatorId: userId
    }
  });

  const participants = await models.eventUsers.findAll({
    where:{
      userId
    }
  });
  const eventsParticipantIn = await Promise.all(participants.map(participant=>{
      return models.events.findOne({where :{ id: participant.eventId }})
  }));

  eventsParticipantIn.forEach(event=>{
    const existing = userEvents.find((e)=> e.id === event.id);
    if (!existing){
      userEvents.push(event);
    }
  });


  const results = await Promise.all(userEvents.map(async (e) => {
    const event = e.toJSON();
    event.participants = await getEventParticipants(event.id);
    if (event.additionalItems){
      event.additionalItems = JSON.parse(event.additionalItems);
    } else {
      event.additionalItems = [];
    }
    return event;
  }));

  return {
    results,
  };
}

/***
 *
 * @param userContext
 * @param data
 * @return {Promise<*>}
 */
async function createEvent(userContext, data) {
  if (!data.additionalItems){
    data.additionalItems = '';
  }
  const newEvent = await models.events.create({...data, creatorId: userContext.id});
  const event = newEvent.toJSON();
  if (data.additionalItems.length===0){
    const eventUser = {
      userId: userContext.id,
      eventId: event.id,
      confirmationDate: new Date()
    };
    await models.eventUsers.create(eventUser);
  }

  return getEvent(userContext, event.id);
}

/***
 *
 * @param userContext
 * @param eventId
 * @param data
 * @return {Promise<*>}
 */
async function updateEvent(userContext, eventId, data) {
  const existingEvent = await getEvent(userContext, eventId);
  if (existingEvent.creatorId !== userContext.id){
    throw forbidden('not creator cannot update event')
  }
  await models.events.update(data, {
    where: {
      id: eventId,
    },
  });
  return getEvent(userContext, eventId);
}

/***
 *
 * @param eventId
 * @return {Promise<*|void>}
 */
async function deleteEvent(userContext, eventId) {
  const existingEvent = await getEvent(userContext, eventId);
  if (existingEvent.creatorId !== userContext.id){
    throw forbidden('not creator cannot delete event')
  }
  await models.eventUsers.destroy({where: { eventId }});
  return models.events.destroy({where: { id: eventId }});
}


async function attendEvent(userContext, eventId, additionalItem) {
  const existingEvent = await getEvent(userContext, eventId);
  const { additionalItems } = existingEvent;
  if (additionalItem && !additionalItems.includes(additionalItem)){
    throw badRequest("item not in list");
  }
  let participant = existingEvent.participants.find(p=>p.id === userContext.id);
  if (participant){//already in event - update his additionalItem
    await models.eventUsers.update({ additionalItem }, {
      where: {
        eventId,
        userId:userContext.id
      }
    });
  } else{//new participant
    const newParticipant = {
      userId: userContext.id,
      eventId,
      confirmationDate: new Date(),
      additionalItem,
    };
    await models.eventUsers.create(newParticipant);
  }
  return getEvent(userContext, eventId);
}

async function unattendEvent(userContext, eventId) {
  const existingEvent = await getEvent(userContext, eventId);
  let participant = existingEvent.participants.find(p=>p.id === userContext.id);
  if (participant){//already in event - update his additionalItem
    await models.eventUsers.destroy({
      where: {
        eventId,
        userId:userContext.id
      }
    });
  }
  return getEvent(userContext, eventId);
}

module.exports = {
  getEvents,
  createEvent,
  getEvent,
  updateEvent,
  deleteEvent,
  attendEvent,
  unattendEvent,
  getEventParticipants
};
