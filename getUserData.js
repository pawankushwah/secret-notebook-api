const bodyParser = require("body-parser");
const express = require("express");
const { dbConnect, model } = require("./utils/models");
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

router.post("/", async (req, res) => {
    await dbConnect();
    const usersModel = await model("users");
    const responseSecretNote = await usersModel.findById(req.body.userId);

    res.json(responseSecretNote).status(200);
})

module.exports = router;