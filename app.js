const app = require("express")();
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const Event = require("./models/event");
const User = require("./models/user");
const crypto = require("crypto-js");
const schema = require("./graphql/schema/index");
const resolvers = require("./graphql/resolver/index");

app.use(bodyParser.json());

const findEvents = async (eventIds) => {
  const events = await Event.find({ _id: { $in: eventIds } });
  return events;
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

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: resolvers,
    graphiql: true,
  })
);

mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("Connected to DB"))
  .catch((err) => {
    console.log(err);
  });

app.listen(process.env.PORT, () => {
  console.log(`listening on port ${process.env.PORT}`);
});
