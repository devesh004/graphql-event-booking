const User = require("../../models/user");
const crypto = require("crypto-js");

module.exports = {
  users: async () => {
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
      // console.log("USER IS 1", user);
      // console.log("USER IS 2", user._doc);
      const { password, ...rest } = user._doc;
      return rest;
    } catch (err) {
      throw err;
    }
  },
};
