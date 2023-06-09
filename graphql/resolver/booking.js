const Booking = require("../../models/booking");
const Event = require("../../models/event");
const { dateToString } = require("../../helpers/dateToString");
const { findOneEvent, findUser } = require("./common");

module.exports = {
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
          createdAt: dateToString(booking._doc.createdAt),
          updatedAt: dateToString(booking._doc.updatedAt),
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
        createdAt: dateToString(booked._doc.createdAt),
        updatedAt: dateToString(booked._doc.updatedAt),
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
