const Event = require("../../models/event");
const User = require("../../models/user");
const crypto = require("crypto-js");
const Booking = require("../../models/booking");

const findEvents = async (eventIds) => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    const allEvents = events.map((event) => {
      return { ...event._doc, date: new Date(event._doc.date).toISOString() };
    });
    return allEvents;
  } catch (err) {
    throw err;
  }
};

const findOneEvent = async (eventId) => {
  const event = await Event.findById(eventId);
  const userId = event.creater.toString();
  const creater = await findUser(userId);
  // console.log("CREATOR", creater);
  return {
    ...event._doc,
    _id: event.id,
    date: new Date(event._doc.date),
    creater: creater,
  };
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

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      const promiseEvents = events.map(async (event) => {
        const userId = event.creater.toString();
        const user = await findUser(userId);
        const eventDetails = {
          ...event._doc,
          date: new Date(event._doc.date).toISOString(),
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
  createEvent: async (arg) => {
    try {
      const newEvent = new Event({
        desc: arg.eventInput.desc,
        title: arg.eventInput.title,
        price: +arg.eventInput.price,
        date: new Date(arg.eventInput.date),
        creater: "645cb87a69e3cd84f92b5763",
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
  users: async () => {
    try {
      const allUsers = await User.find();
      const users = allUsers.map((user) => {
        const { password, ...rest } = user._doc;
        return rest;
      });
      return users;
    } catch (err) {
      throw err;
    }
  },
  createUser: async (arg) => {
    try {
      const isUsesr = await User.findOne({ email: arg.userInput.email });
      if (isUsesr) {
        throw new Error("User already exits..");
      }
      const hashedPass = crypto.AES.encrypt(
        arg.userInput.password,
        process.env.SECRET_KEY
      ).toString();

      const newUser = new User({
        email: arg.userInput.email,
        password: hashedPass,
      });
      const user = await newUser.save();
      // console.log("USER IS 1", user);
      // console.log("USER IS 2", user._doc);
      const { password, ...rest } = user._doc;
      return rest;
    } catch (err) {
      throw err;
    }
  },
  bookings: async () => {
    try {
      const bookings = await Booking.find();
      return bookings.map(async (booking) => {
        const eventId = booking._doc.event.toString();
        const userId = booking._doc.user.toString();
        const eventDetail = await findOneEvent(eventId);
        const userDetail = await findUser(userId);
        return {
          ...booking._doc,
          _id: booking.id,
          createdAt: new Date(booking._doc.createdAt).toISOString(),
          updatedAt: new Date(booking._doc.updatedAt).toISOString(),
          event: { ...eventDetail },
          user: { ...userDetail },
        };
      });
    } catch (err) {
      throw err;
    }
  },
  bookEvent: async (args) => {
    try {
      const user = "645cb87a69e3cd84f92b5763";
      const event = await Event.findById(args.eventId);
      const booking = new Booking({ user, event });
      const booked = await booking.save();
      const eventDetail = await findOneEvent(args.eventId);
      const userDetail = await findUser(user);
      return {
        ...booked._doc,
        _id: booked.id,
        createdAt: new Date(booked._doc.createdAt).toISOString(),
        updatedAt: new Date(booked._doc.updatedAt).toISOString(),
        event: { ...eventDetail },
        user: { ...userDetail },
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  cancelBooking: async (args) => {
    try {
      const booking = await Booking.findById(args.bookingId).populate("event");
      const userId = booking.event.creater.toString();
      const userDetail = await findUser(userId);
      const event = {
        ...booking.event,
        _id: booking.event.id,
        creater: userDetail,
      };
      await Booking.deleteOne({ _id: args.bookingId });
      return event;
    } catch (err) {
      throw err;
    }
  },
};
