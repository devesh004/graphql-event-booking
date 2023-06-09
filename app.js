const app = require("express")();
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
// const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const schema = require("./graphql/schema/index");
const resolvers = require("./graphql/resolver/index");

app.use(bodyParser.json());

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
