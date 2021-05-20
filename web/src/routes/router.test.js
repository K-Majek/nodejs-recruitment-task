const utils = require("../../utils");

//units

//This one looked unsafe, so I decided to test two variants.
//First test was a false positive, second one showed where is the problem
test("Should have 8-digit date format for parsing to MySQL datetime", () => {
    const body = {
        Title: "Title",
        Genre: "Test",
        Released: "1980 Jan 03",
        Director: "N/A",
        Error: false
    }
    expect(utils.fetch(body).length).toBe(8);
    
});

//this test actually found out there is possibility for unexpected 9 digits instead of 8 for the first time.
test("Should have 8-digit date format for parsing to MySQL datetime", () => {
    const body = {
        Title: "Title",
        Genre: "Test",
        Released: "1980 Oct 30",
        Director: "N/A",
        Error: false
    }
    expect(utils.fetch(body).length).toBe(8);
    
});

test("Check if token is existing, test 1", () => {
    const body = "Bearer qwecqowmieucqewhoixug93784g97x4g33974xg23m9487xy9328x4y32984xy329x8k32y49xd832ydx493284dyjm3298yj49382fy2397ft4y23mn9cf4723tync9327t4c9";
    expect(utils.tokenCheck(body)).toBe(true);
})
test("Check if token is existing, test 2", () => {
    const body = "qwecqowmieucqewhoixug93784g97x4g33974xg23m9487xy9328x4y32984xy329x8k32y49xd832ydx493284dyjm3298yj49382fy2397ft4y23mn9cf4723tync9327t4c9";
    expect(utils.tokenCheck(body)).toBe(false);
})
test("Check if token is existing, test 3", () => {
    const body = "";
    expect(utils.tokenCheck(body)).toBe(false);
});
test("Check if token is existing, test 4", () => {
    const body = "\0";
    expect(utils.tokenCheck(body)).toBe(false);
});
test("Check if token is existing, test 5", () => {
    const body = "Bearer";
    expect(utils.tokenCheck(body)).toBe(false);
});