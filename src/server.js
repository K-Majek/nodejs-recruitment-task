const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const { authFactory, AuthError } = require("./auth");

const PORT = 3000;
const { JWT_SECRET, DB_NAME, DB_HOST, DB_PORT, DB_USER, DB_PASS } = process.env;

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET env var. Set it and restart the server");
}
else if (!DB_NAME || !DB_HOST || !DB_PORT || !DB_USER || !DB_PASS) {
  throw new Error("Missing database configuration env vars. Check if DB_NAME, DB_HOST, DB_PORT, DB_USER, DB_PASS vars exist and are valid and restart the server.");
}

const db_config = {
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASS
}

const pool = mysql.createPool(db_config);

(async () => {
  let hash_one = "";
  let hash_two = "";
  await pool.promise().query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`).catch(error => {
    console.error("> Error occured while trying to create database. Possible solutions:"); 
    console.error("> - Check if MySQL database is installed properly. If not, please visit https://www.mysql.com/ for more information."); 
    console.error("> - Check if credentials in environment variables are valid. Don't forget to use escape characters, '\\'."); 
    console.error("Error is as follows:"); 
    throw new Error(error);
  });
  await pool.promise().query(`CREATE TABLE IF NOT EXISTS ${DB_NAME}.users ( id SMALLINT, role TINYTEXT, name TINYTEXT, username TINYTEXT, password TINYTEXT, PRIMARY KEY (id))`)
  .catch(error => {throw new Error(error);});
  await pool.promise().query(`CREATE TABLE IF NOT EXISTS ${DB_NAME}.movies ( id SMALLINT, title TINYTEXT, released DATETIME, genre TINYTEXT, director TINYTEXT, FOREIGN KEY (id) REFERENCES ${DB_NAME}.users(id))`)
  .catch(error => {throw new Error(error);});

  await bcrypt.hash("sR-_pcoow-27-6PAwCD8", 10).then(hash => {hash_one = hash}).catch(error => {throw new Error(error);});
  await bcrypt.hash("GBLtTyq3E_UNjFnpo9m6", 10).then(hash => {hash_two = hash}).catch(error => {throw new Error(error);});
  await pool.promise().query(`INSERT IGNORE INTO ${DB_NAME}.users (id, role, name, username, password) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)`, [123, "basic", "Basic Thomas", "basic-thomas", hash_one, 434, "premium", "Premium Jim", "premium-jim", hash_two])
  .catch(error => {throw new Error(error);});
})();

const auth = authFactory(JWT_SECRET);

//create db options using environment variables
//create pool promise and get it ready for export

const app = express();

app.use(express.json()); //body-parser is deprecated, using express.json() instead

app.post("/auth", (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({ error: "invalid payload" });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "invalid payload" });
  }

  try {
    const token = auth(username, password);

    return res.status(200).json({ token });
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(401).json({ error: error.message });
    }

    next(error);
  }
});
app.use((error, _, res, __) => {
  console.error(
    `Error processing request ${error}. See next message for details`
  );
  console.error(error);

  return res.status(500).json({ error: "internal server error" });
});
app.use((req,res,next) => {

  next();
});

app.use("/", require("./router")); //added middleware to handle all the routes in  the router file

app.listen(PORT, () => {
  console.log(`auth svc running at port ${PORT}`);
});

module.exports = {
  promise: pool.promise(),
  DB_NAME: DB_NAME
}