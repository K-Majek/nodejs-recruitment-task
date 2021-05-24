const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const { authFactory, AuthError } = require("./auth");
const path = require("path");
let isUp = false;

//checking if the project is deployed in production mode, if not then it's taking variables locally from .env file, where the project's package.json is stored
if(process.env.NODE_ENV !== "production"){
  require("dotenv").config();
} 

//when extracting new environment variables, ensure to add them also to the test below
const { APP_PORT, JWT_SECRET, DATABASE_HOST, DATABASE_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, OMDB_API_KEY} = process.env;

//testing if all variables are existing and valid
const ENV_VARS = { APP_PORT, JWT_SECRET, DATABASE_HOST, DATABASE_PORT, MYSQL_PASSWORD, MYSQL_DATABASE, OMDB_API_KEY};
Object.seal(ENV_VARS);

for(const i in ENV_VARS) if(typeof ENV_VARS[i] !== "string") {
  console.error(`Invalid "${i}" env var. Expected "string", got "${typeof ENV_VARS[i]}" instead.`);
  process.exit(9);
};

const db_config = {
  host: DATABASE_HOST,
  port: DATABASE_PORT,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE
}

const pool = mysql.createPool(db_config);
let connection_retries = 0;

//recursive function responsible for firing up the project after proper connection with the database - lines 33-78
const estabilish_connection = () => {
  if(connection_retries === 10) {
    console.error("Can't connect to the MySQL database. Check if the database is properly installed, is running, and if the credentials are valid.");
    process.exit(9);
  }
  else {

    if(connection_retries === 0) console.log("Trying to connect to the MySQL database...");
    else if(connection_retries !== 0) console.log("Trying to connect to the MySQL database... Attempt: ", connection_retries + 1);

    //random database query to check if it's up and then acting accordingly to the response
    pool.promise().query("SELECT 2")
      .then(response => { 
        console.log("Connected to the database. Server is ready to process requests.");
        console.log(`> Service is running on port ${APP_PORT}`);
        //setting up the tables if they are not existing and enabling processing of the requests
        (async () => {
          let hash_one = "";
          let hash_two = "";
          
          await pool.promise().query(`CREATE TABLE IF NOT EXISTS ${MYSQL_DATABASE}.users ( id SMALLINT, role TINYTEXT, name TINYTEXT, username TINYTEXT, password TINYTEXT, PRIMARY KEY (id))`)
          .catch(error => {
            throw new Error(error);
          });
          await pool.promise().query(`CREATE TABLE IF NOT EXISTS ${MYSQL_DATABASE}.movies ( id SMALLINT, title TINYTEXT, released DATETIME, genre TINYTEXT, director TINYTEXT, added_at DATETIME, FOREIGN KEY (id) REFERENCES ${MYSQL_DATABASE}.users(id))`)
          .catch(error => {
            throw new Error(error);
          });
        
          await bcrypt.hash("sR-_pcoow-27-6PAwCD8", 10).then(hash => {hash_one = hash}).catch(error => {throw new Error(error);});
          await bcrypt.hash("GBLtTyq3E_UNjFnpo9m6", 10).then(hash => {hash_two = hash}).catch(error => {throw new Error(error);});
          await pool.promise().query(`INSERT IGNORE INTO ${MYSQL_DATABASE}.users (id, role, name, username, password) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)`, [123, "basic", "Basic Thomas", "basic-thomas", hash_one, 434, "premium", "Premium Jim", "premium-jim", hash_two])
          .catch(error => {
            throw new Error(error);
          });
        })();
        isUp = true;
      })
      .catch(error => {
        //if there's an error with connection to the database, trying again after 20 seconds
        setTimeout(() => {connection_retries++; estabilish_connection();}, 60000);
      });
  }
}
estabilish_connection();

const auth = authFactory(JWT_SECRET);

const app = express();

app.use(express.json()); //body-parser is deprecated, using express.json() instead
app.use((req, res, next) => { 
  // checking if database if up before doing any processing
  if(isUp) next();
  else if(req.body.test || req.headers.test){
    next();
  }
  else {
    res.status(500).json({ error: "Server is firing up. Try again later."});
  }
});

app.post("/auth", async (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({ error: "invalid payload" });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "invalid payload" });
  }

  try {
    const token = await auth(username, password);

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

app.use("/", require("./routes/router")); //added middleware to handle all the routes in  the router file

app.get("/", (req, res, next) => {
  res.send("working");
})
app.listen(APP_PORT, () => {
  console.log(`Initializing express server... Service will be running soon on port ${APP_PORT}.`);
});

// exports.promise = pool.promise();
// exports.MYSQL_DATABASE = MYSQL_DATABASE;

exports.promise = pool.promise();
exports.ENV_VARS = ENV_VARS;
