//e2e
//GET /movies
/**
 * 
 * User should send `Authorization: Bearer <token>` header with each request
 * cases:
 * 
 * Expecting a 200 status when trying to access `GET /movies` with a valid JWT token
 * Expecting a 401 status when trying to access `GET /movies` route without a token
 * Expecting a 403 status when trying to access `GET /movies` with invalid or expired JWT token
 * Expecting a 500 status when database is down
 */



//POST /movies

/**
 * User should send `Authorization: Bearer <token>` header with each request
 * 
 * cases:
 * expecting a 201 status when everything is processed without issues
 * expecting a database to be filled with valid data when the 201 status occured
 * expecting a 400 status when no neccesary payload is sent
 * expecting a 401 status when user has no token
 * expecting a 403 status when user has expired or invalid token
 * expecting a 404 status when there is no item found
 * expecting a 412 status when there is a duplicate item
 * expecting a 500 status when the database is down
 */