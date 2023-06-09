const Event = require("../../models/event");
const User = require("../../models/user");
const { dateToString } = require("../../helpers/dateToString");
const findEvents = async (eventIds) => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    const allEvents = events.map((event) => {
      return {
        ...event._doc,
        _id: event.id,
        date: dateToString(event._doc.date),
      };
    });
    return allEvents;
  } catch (err) {
    throw err;
  }
};

const findUser = async (userId) => {
  const user = await User.findById(userId);
  // const promiseEvents = user.createdEvent.map(async (event) => {
  //   const eventId = event.toString();
  //   const eventDet = await findEvent(eventId);
  //   return { ...eventDet._doc };
  // });
  // const allEvents = await Promise.all(promiseEvents);
  // // console.log("EVENTS", allEvents);
  // const userDet = { ...user._doc, createdEvent: allEvents };
  // // console.log("USER_DET", userDet);
  // return userDet;

  const userEvents = await findEvents(user.createdEvent);
  return { ...user._doc, createdEvents: userEvents };
};

const findOneEvent = async (eventId) => {
  const event = await Event.findById(eventId);
  const userId = event.creater.toString();
  const creater = await findUser(userId);
  // console.log("CREATOR", creater);
  return {
    ...event._doc,
    _id: event.id,
    date: dateToString(event._doc.date),
    creater: creater,
  };
};

exports.findUser = findUser;
exports.findOneEvent = findOneEvent;
exports.findEvents = findEvents;
