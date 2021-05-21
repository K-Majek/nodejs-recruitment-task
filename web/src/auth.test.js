const utils = require("../utils");

/**
 * example body
 * [{
 *  username: "abc",
 *  password: "23-jr-j0wepfno"
 * }]
 */

//should throw an exception on no results
test("Should throw an exception on no results", () => {
    const body = [];
    const request = { username: "billy", password: "the_cat" };
    expect(() => {utils.auth(body, request)}).toThrow("invalid username or password");
})

//should throw an exception on invalid password
test("Should throw an exception on invalid password", () => {
    const body = [{
        username: "billy",
        password: "the_hamster"
    }];
    const request = { username: "billy", password: "the_cat" };
    expect(() => {utils.auth(body, request)}).toThrow("invalid username or password");
})
//should return a string on valid password
test("Should return a string on valid password and username", () => {
    const body = [{
        username: "billy",
        password: "the_hamster"
    }];
    const request = { username: "billy", password: "the_hamster" };
    expect(typeof utils.auth(body, request)).toBe("string");
})

//should throw an exception on invalid password

//should return a string on valid password