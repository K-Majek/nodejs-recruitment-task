# Changes: 
- `bodyParser.json()` middleware is changed into `express.json()`, because body-parser module is deprecated.
- `POST /auth` route is slightly adjusted. I have moved the objects to the MySQL database with insertion of the data.

# Requirements:

Installed `docker` and `docker-compose`

# Installation:

In order to run the application, cloning the repository and use of `docker compose up -d` and waiting is enough to run.


# Customisation

Here are the environment variables, which can be changed at will. It's possible to either add these to `.env` file on the same folder where `docker-compose.yml` file is, or just overwrite them with using `-e <name>=<value>`, example `docker compose run -e JWT_SECRET=123123123 -e APP_PORT=3001... `.

There are several environment variables, which can be changed:

`JWT_SECRET`            - the token password needed to sign the JSON Web Tokens
`MYSQL_DATABASE`        - name for MySQL database schema
`MYSQL_ROOT_PASSWORD`   - root user password, default is `root`
`MYSQL_USER`            - regular MySQL user, default is `mysql`
`MYSQL_PASSWORD`        - MySQL user password, default is `secret`
`DATABASE_HOST`         - name of the host which will be recognised by other containers within the network

# Routes

`POST /auth`
`POST /movies`
`GET /movies`