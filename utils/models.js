const schema = require("./schemas");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({path: "./.env"});

const url = process.env.MONGO_DB_SERVER_WITH_DATABASE;

const dbConnect = async () => {
    return await mongoose.connect(url);
};

async function model(collectionName) {
    if (!mongoose.models[collectionName] && mongoose.connection.readyState == 1) {
        await mongoose.model(collectionName, schema[collectionName]);
    }
    return mongoose.models[collectionName];
}

module.exports = { dbConnect, model }
