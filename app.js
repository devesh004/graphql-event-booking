const app = require("express")();
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");

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

app.listen(3000, () => {
  console.log("You are listening port 3000");
});
