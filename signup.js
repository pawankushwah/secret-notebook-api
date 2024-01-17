const bodyParser = require("body-parser");
let express = require("express");
const { dbConnect, model } = require("./utils/models");
let router = express.Router();

const jwt = require("jsonwebtoken");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post("/", async (req, res) => {
    let data = req.body;
    let newErrors = validateData(req.body);
    if (Object.keys(newErrors).length !== 0) return res.json(newErrors);
    
    try {
        const dbConnection = await dbConnect();
    }
    catch(e){
        console.log(e);
    }

    const usersModel = await model("users");
    console.log(await usersModel.findOne());
    const isUsernameAvailable = await usersModel.find({
        username: data.username,
    });
    if (isUsernameAvailable.length > 0) return res.json({ isUsernameAvailable: false });

    if (Object.keys(newErrors).length === 0) {
        delete data.confirmPassword;
        delete data.showEmailField;
        delete data.showMobileField;
        let response = await usersModel.insertMany(data);
        console.log(response);

        const jwtToken = await generateAccessToken({ username: response[0].username });
        const tokenData = jwt.verify(jwtToken, process.env.JWT_ACCESS_TOKEN_SECRET);
        const jwtRefreshToken = await generateRefreshToken({
            username: response[0].username,
            exp: tokenData.exp,
            iat: tokenData.iat
        });
        res.cookie("token", jwtToken, { httpOnly: true })
        res.cookie("jwtRefreshToken", jwtRefreshToken, { httpOnly: true });
        res.cookie("userId", response[0]._id, { httpOnly: true });
        res.json({ redirect: true, token: jwtToken, refreshToken: jwtRefreshToken, userId: response[0]._id, url: "dashboard" });
    } else return res.json({ msg: "something went Wrong" });
})

function validateData(data) {
    const errors = {};
    const passwordRegex = /^(?=.*[@#$&*!])(?=.*[a-z])(?=.*[A-Z]).{6,15}$/;
  
    if (!data) return { err: "validation error" };
  
    if (!data.firstName.trim()) {
      errors.firstName = "First name is required";
    }
  
    if (!data.lastName.trim()) {
      errors.lastName = "Last name is required";
    }
  
    if (!data.username.trim()) errors.username = "username is required";
  
    if (!data.password) {
      errors.password = "Password is required";
    } else if (!data.password.match(passwordRegex)) {
      errors.password = "Fullfill all the conditions";
    }
  
    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
  
    return errors;
  }


  async function generateAccessToken(userData, hasExpiredToken = false) {
    // if the user is logining up
    const newToken = jwt.sign(userData, process.env.JWT_ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });
    if (!hasExpiredToken) return newToken;
  
    // if user has logined in but want to extend the expiration time
    // we will generate new token with new expiration time 
    // we will change the database by replacing access token with newAccessToken and putting the currentAccesToken into the blacklist
    const tokenExp = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET).exp;
    const username = userData.username;
    await dbConnect();
    const sessionTokenModel = await model("sessionToken");
    const currentSessionDataOfUser = await sessionTokenModel.find({ username });
    const currentBlacklist = await currentSessionDataOfUser.blackListedToken;
    const currentAccessToken = await currentSessionDataOfUser.accessToken;
    const result = await sessionTokenModel.updateOne(
      { username },
      {
        $set: {
          accessToken: { token: newToken, exp: tokenExp },
          blackListedToken: [...currentBlacklist, currentAccessToken],
        },
      }
    );
    console.log(result)
    return token;
  }
  
  async function generateRefreshToken(userData) {
    // it simply generates the new refreshtoken and put it into the database with its schema
    const token = jwt.sign(
      { username: userData.username },
      process.env.JWT_REFRESH_TOKEN_SECRET
    );
    const accessToken = generateAccessTokenWithNoExpiration(userData);
    await dbConnect();
    const sessionTokenModel = await model("sessionToken");
    const result = await sessionTokenModel.insertMany({
      username: userData.username,
      accessToken: { accessToken, exp: userData.exp },
      refreshToken: token,
      blackListedToken: [],
    });
    return token;
  }

  function generateAccessTokenWithNoExpiration(userData){
    return jwt.sign(userData, process.env.JWT_ACCESS_TOKEN_SECRET);
  }

module.exports = router;