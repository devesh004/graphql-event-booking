const app = require("express")();
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

app.use(bodyParser.json());

const events = [];
app.use(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(`
        type Event{
            _id: ID!
            desc: String!
            title: String!
            price: Float!
            date: String!
        }

        input EventInput{
            desc: String!
            title: String!
            price: Float!
            date: String!
        }

        type RootQuery{
            events: [Event!]!
        }
        type RootMutation{
            createEvent(eventInput: EventInput): Event
        }
        schema{
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
      events: () => {
        return events;
      },
      createEvent: (arg) => {
        const newEvent = {
          _id: Math.random().toString(),
          desc: arg.eventInput.desc,
          title: arg.eventInput.title,
          price: +arg.eventInput.price,
          date: arg.eventInput.date,
        };
        events.push(newEvent);
        return newEvent;
      },
    },
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
