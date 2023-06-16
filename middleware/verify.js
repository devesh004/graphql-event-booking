const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    //added a new property isAuth on req and let him continue the req
    req.isAuth = false;
    return next();
  }
  const token = authHeader.split(" ")[1];
  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    req.isAuth = true;
    req.userId = decodedToken.userId;
    return next();
  } catch (err) {
    req.isAuth = false;
    return next();
  }
};
