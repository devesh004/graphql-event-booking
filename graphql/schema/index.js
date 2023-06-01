const { buildSchema } = require("graphql");

module.exports = buildSchema(`
        type Event{
            _id: ID!
            desc: String!
            title: String!
            price: Float!
            date: String!
            creater: User!
        }
        type User{
          _id:ID!
          email:String!
          password:String
          createdEvents: [Event!]
        }

        input EventInput{
            desc: String!
            title: String!
            price: Float!
            date: String!
        }

        input UserInput{
            email:String!
            password:String!
        }

        type RootQuery{
            events: [Event!]!
            users: [User!]!
        }
        type RootMutation{
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }
        schema{
            query: RootQuery
            mutation: RootMutation
        }
    `);