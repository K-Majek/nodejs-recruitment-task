const jwt = require("jsonwebtoken");
const Model = require("./server");
const bcrypt = require("bcrypt");
class AuthError extends Error {}

//I have moved the user objects to the MySQL database and adjusted the auth mechanism.
const authFactory = (secret) => async (username, password) => {
  let [rows, ] = await Model.promise.query(`SELECT * FROM ${Model.ENV_VARS.MYSQL_DATABASE}.users WHERE username = ?`, [username])
    .catch(error => {
      console.error(error); 
      throw new AuthError("Error occured while processing the request.");
    });
  if(rows.length === 0) throw new AuthError ("invalid username or password");

  const user = JSON.parse(JSON.stringify(rows));
  

  let isPasswordValid = await bcrypt.compare(password, user[0].password)
    .catch(error => { 
      throw new AuthError("Error occured while processing the request.");
    });

  if(!isPasswordValid) {
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
