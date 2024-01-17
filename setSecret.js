const bodyParser = require("body-parser");
const express = require("express");
const { dbConnect, model } = require("./utils/models");
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

router.post("/", async (req, res) => {
    try {
        await dbConnect();

        // checking database whether it have secret already
        const usersModel = await model("users");
        const responseSecretNote = await usersModel.findById(req.body.userId);

        const secretNotesModel = await model("secretNotes");
        let response2 = {};
        if (responseSecretNote.secret === "") {
            response2 = await secretNotesModel.insertMany(
                [
                    {
                        userId: req.body.userId,
                        secret: req.body.secretNote
                    }
                ]
            )
        }
        else {
            response2 = await secretNotesModel.updateOne(
                { userId: req.body.userId },
                {
                    $set: {

                        userId: req.body.userId,
                        secret: req.body.secretNote
                    }
                }
            )
        }

        const response = await usersModel.updateOne(
            { userId: req.userId },
            {
                $set: {
                    secret: req.body.secretNote
                }
            }
        )
        console.log(response)
    } catch (e) {
        console.log(e);
        return res.send({ success: false, message: "unable to store the secret" });
    }
    return res.send({success: true, message: "updated successfully"});
})

module.exports = router;