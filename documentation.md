# Changes: 
- `bodyParser.json()` middleware is changed into `express.json()`, because body-parser module is deprecated.
- `POST /auth` route is slightly adjusted. I have moved the objects to the MySQL database with insertion of the data.

# Requirements:

Installed `docker` and `docker-compose`

# Installation:

In order to run the application, cloning the repository and use of `docker-compose up -d` and waiting is enough to run.


# Customisation

Here are the environment variables, which can be changed at will. It's possible to either add these to `.env` file on the same folder where `docker-compose.yml` file is, or just overwrite them with using `-e <name>=<value>`, example `docker compose run -e JWT_SECRET=123123123 -e APP_PORT=3001... `.

There are several environment variables, which can be changed:

- `JWT_SECRET`            - the token password needed to sign the JSON Web Tokens
- `MYSQL_DATABASE`        - name for MySQL database schema
- `MYSQL_ROOT_PASSWORD`   - root user password, default is `root`
- `MYSQL_USER`            - regular MySQL user, default is `mysql`
- `MYSQL_PASSWORD`        - MySQL user password, default is `secret`
- `DATABASE_HOST`         - name of the host which will be recognised by other containers within the network
- `APP_PORT`              - port on which node application will run. default is `3000`
- `OMDB_API_KEY`          - key consisting of http://www.omdbapi.com/?i=<OMDB_ID>&apikey=<API_KEY>

# Routes

`POST /auth`            

- This route now is connected to the mysql database. Connection is safe as it will only process requests when database is up and running. 
- expected data: `application/json` header and `username`, `password` JSON properties.
- expected responses: `200` and `token` in JSON when data is valid; `401` and `error` in JSON when data is invalid.




`POST /movies`

- New route. Used for creating new entries in the database.
- Expected input: title as name of the movie.
- Accepted content type: `application/json` 
- Expected headers: `Authorization`
- Expected data: `title` field
- Expected response: 

- `201` status and message, when request is successfully processed and the item is added to the database;
- `400` status and error message, when no `title` is sent in the payload.
- `401` status and error message, when user has sent no `Authorization` header
- `403` status and error message, when user send expired or invalid `JWT token`, or has met his monthly limit
- `404` status and error message, when there is no item matching the `title` field
- `412` status and error message, when there is already a duplicate item
- `500` status and error message, when the database is down


`GET /movies`

- New route. Used for listing the items the used has successfully added to the database.
- Expected headers: `Authorization`
- Expected data: none
- Expected response:

- `200` status and json consisting out of `title`, `released`, `genre`, `director`, when request is processed
- `401` status and error message, when user has sent no `Authorization` header.
- `403` status and error message, when user has expired or invalid `JWT token`
- `500` status and error message, when the database is down