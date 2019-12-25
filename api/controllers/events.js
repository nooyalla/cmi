const HttpStatus = require('http-status-codes');
const eventsService = require('../services/events');

function getEvent(req, res, next) {
  const { userContext } = req;
  const { eventId } = req.getAllParams();
  eventsService.getEvent(userContext, eventId)
    .then((event) => {
      res.send(event);
    })
    .catch(next);
}

function getEvents(req, res, next) {
  const { userContext } = req;
  eventsService.getEvents(userContext)
    .then((result) => {
      res.send(result);
    })
    .catch(next);
}

function createEvent(req, res, next) {
  const { userContext } = req;
  const data = req.getBody();
  data.startDate = data.startDate || new Date(2020,1,1) ;
  eventsService.createEvent(userContext, data)
    .then((event) => {
      res.status(HttpStatus.CREATED).send(event);
    })
    .catch(next);
}

function updateEvent(req, res, next) {
  const { userContext } = req;
  const { eventId } = req.getAllParams();
  const data = req.getBody();
  eventsService.updateEvent(userContext, eventId, data)
    .then((event) => {
      res.send(event);
    })
    .catch(next);
}

function attendEvent(req, res, next) {
  const { userContext } = req;
  const { eventId } = req.getAllParams();
  const { additionalItem } = req.getBody();
  eventsService.attendEvent(userContext, eventId, additionalItem)
    .then((event) => {
      res.send(event);
    })
    .catch(next);
}
function unattendEvent(req, res, next) {
  const { userContext } = req;
  const { eventId } = req.getAllParams();
  eventsService.unattendEvent(userContext, eventId)
    .then((event) => {
      res.send(event);
    })
    .catch(next);
}
function deleteEvent(req, res, next) {
  const { userContext } = req;
  const { eventId } = req.getAllParams();
  eventsService.deleteEvent(userContext, eventId)
    .then(() => {
      res.status(HttpStatus.NO_CONTENT).send({ deleted: true });
    })
    .catch(next);
}

module.exports = {
  getEvents,
  createEvent,
  getEvent,
  updateEvent,
  deleteEvent,
  attendEvent,
  unattendEvent
};
