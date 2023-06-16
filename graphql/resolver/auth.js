const User = require("../../models/user");
const crypto = require("crypto-js");
const jwt = require("jsonwebtoken");

module.exports = {
  users: async (req) => {
    if (!req.isAuth) {
      throw new Error("you are not allowed");
    }
    try {
      const allUsers = await User.find();
      const users = allUsers.map((user) => {
        const { password, ...rest } = user._doc;
        return rest;
      });
      return users;
    } catch (err) {
      throw err;
    }
  },
  createUser: async (arg) => {
    try {
      const isUsesr = await User.findOne({ email: arg.userInput.email });
      if (isUsesr) {
        throw new Error("User already exits..");
      }
      const hashedPass = crypto.AES.encrypt(
        arg.userInput.password,
        process.env.SECRET_KEY
      ).toString();

      const newUser = new User({
        email: arg.userInput.email,
        password: hashedPass,
      });
      const user = await newUser.save();
      const { password, ...rest } = user._doc;
      return rest;
    } catch (err) {
      throw err;
    }
  },
  login: async (args) => {
    const { email, password } = args;
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("email or password is wrong");
    } else {
      const hashedPassInDB = user.password;
      const passwordInDB = crypto.AES.decrypt(
        hashedPassInDB,
        process.env.SECRET_KEY
      ).toString(crypto.enc.Utf8);
      if (password === passwordInDB) {
        const token = jwt.sign(
          {
            userId: user.id,
            email: email,
          },
          process.env.SECRET_KEY,
          { expiresIn: "1h" }
        );
        return { userId: user.id, token: token, tokenExpiration: 1 };
      } else {
        throw new Error("email or password is wrong");
      }
    }
  },
};
