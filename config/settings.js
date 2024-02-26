require("dotenv").config();

module.exports = {
//   mongoDBUrl:
//     "mongodb://127.0.0.1:27020/gtacars",
	mongoDBUrl: process.env.mongoDBUrl,
  secret: "verySecretCode",
};
