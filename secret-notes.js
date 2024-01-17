let express = require("express");
let router = express.Router();
const { dbConnect, model } = require("./utils/models");

router.post("/", async (req, res) => {
    try {
        const dbConnection = await dbConnect();
        console.log(dbConnection);
        const secretNotesModel = await model("secretNotes");
        const responseSecretNotes = await secretNotesModel.find({}).select({secret: 1});
        console.log(responseSecretNotes);
        res.send(responseSecretNotes).status(200);
    } catch (e) {
        console.log(e);
        res.send({error: "data not found"});
    }
})

module.exports = router;