const { ApolloServer } = require('apollo-server');

const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');
const { findOrCreateUser } = require('./controllers/userController');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config()

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true
})
    .then(() => console.log('DB connected'))
    .catch(err => console.error(err))

const whiteList = [
    'https://geopins-react-demo.herokuapp.com/'
];

const server = new ApolloServer({
    cors: {
        origin: '*'
    },
    typeDefs: typeDefs,
    resolvers: resolvers,
    context: async ({ req }) => {
        let authToken = null;
        let currentUser = null;
        try {
            authToken = req.headers.authorization;
            if (authToken) {
                currentUser = await findOrCreateUser(authToken);
            }
        } catch (err) {
            console.error(`Unable to authenticate user with token ${authToken}`);
        }

        return { currentUser };
    }
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
    console.log(`server listening on ${url}`);
});