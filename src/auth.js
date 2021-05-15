const jwt = require("jsonwebtoken");
const Model = require("./server");
const bcrypt = require("bcrypt");

class AuthError extends Error {}

const authFactory = async (secret) => (username, password) => {

  let [rows, ] = await Model.promise.query(`SELECT * FROM ${Model.DB_NAME}.users WHERE username = ?`, [username])
    .catch(error => {console.error(error); throw new AuthError("Error occured during authorisation. Try again later.");});
  
  const user = JSON.parse(JSON.stringify(rows)); //Content coming from database isn't a valid JSON. This line removes the artefacts.

  let isPasswordValid;
  await bcrypt.compare(password, user[0].password).then(result => {isPasswordValid = result}).catch(error => {isPasswordValid = false});

  if(user.length !== 1 || !isPasswordValid) {
    throw new AuthError("invalid username or password");
  }
  else {
    return jwt.sign(
      {
        userId: user[0].id,
        name: user[0].name,
        role: user[0].role,
      },
      secret,
      {
        issuer: "https://www.netguru.com/",
        subject: `${user[0].id}`,
        expiresIn: 30 * 60,
      }
    );
  }
};

module.exports = {
  authFactory,
  AuthError,
};
