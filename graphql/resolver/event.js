const Event = require("../../models/event");
const User = require("../../models/user");
const { dateToString } = require("../../helpers/dateToString");
const { findUser } = require("./common");

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      const promiseEvents = events.map(async (event) => {
        const userId = event.creater.toString();
        const user = await findUser(userId);
        const eventDetails = {
          ...event._doc,
          date: dateToString(event._doc.date),
          creater: { ...user },
        };
        return eventDetails;
      });
      const allEvents = await Promise.all(promiseEvents);
      // console.log("ALL_EVENT", allEvents);
      return allEvents;
    } catch (err) {
      throw err;
    }
  },
  createEvent: async (arg, req) => {
    if (!req.isAuth) {
      throw new Error("you are not allowed");
    }
    try {
      const newEvent = new Event({
        desc: arg.eventInput.desc,
        title: arg.eventInput.title,
        price: +arg.eventInput.price,
        date: new Date(arg.eventInput.date),
        creater: req.userId,
      });
      const event = await newEvent.save();
      const user = await User.findById("645cb87a69e3cd84f92b5763");
      if (!user) {
        throw new Error("User is not in DB");
      } else {
        user.createdEvent.push(event);
        await user.save();
      }
      const userDet = await findUser("645cb87a69e3cd84f92b5763");
      const eventDetails = { ...event._doc, creater: { ...userDet } };
      // console.log(eventDetails);
      return eventDetails;
    } catch (err) {
      throw err;
    }
  },
};
