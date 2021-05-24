const utils = require("../../utils");
const puppeteer = require("puppeteer");

const host = "http://localhost";
const port = "3000";
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
/* End-to-End tests. Uncomment, save and run "npm test" to run those.
//POST /movies
//posting movie from premium user, server should respond with a 201 status
test("Posting movie from premium user, server should respond with a 201 status.", async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    let data = {
        title: "Movie6",
        test: "true",
        user: "premium"
    }
    page.on("request", request => {
        let payload = {
            "headers": {...request.headers(), "content-type": "application/json", "Authorization": "Bearer test"},
            "method": "POST",
            "postData": JSON.stringify(data)
        }
        request.continue(payload);
    });
    const response = await page.goto(`${host}:${port}/movies`);
    const responseBody = await response.text();
    await browser.close();
    expect(response._status).toBe(201);
});

//posting movie from basic user that hasn't met his limit, server should respond with a 201 status
test("Posting movie from basic user that hasn't met his limit, server should respond with a 201 status.", async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    let data = {
        title: "Movie6",
        test: "true",
        user: "premium"
    }
    page.on("request", request => {
        let payload = {
            "headers": {...request.headers(), "content-type": "application/json", "Authorization": "Bearer test"},
            "method": "POST",
            "postData": JSON.stringify(data)
        }
        request.continue(payload);
    });
    const response = await page.goto(`${host}:${port}/movies`);
    await browser.close();
    expect(response._status).toBe(201);
});

//Posting movie from basic user that has met his limit, server should respond with a 403 status
test("Posting movie from basic user that has met his limit, server should respond with a 403 status.", async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    let data = {
        title: "Movie6",
        test: "true",
        user: "basic_full"
    }
    page.on("request", request => {
        let payload = {
            "headers": {...request.headers(), "content-type": "application/json", "Authorization": "Bearer test"},
            "method": "POST",
            "postData": JSON.stringify(data)
        }
        request.continue(payload);
    });
    const response = await page.goto(`${host}:${port}/movies`);
    await browser.close();
    expect(response._status).toBe(403);
});

//User has sent invalid authentication token, should receive 403 status.
test("User has sent invalid authentication token, should receive 403 status.", async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    let data = {
        test: true,
        title: "Movie6"
    }
    page.on("request", request => {
        let payload = {
            "headers": {...request.headers(), "content-type": "application/json", "Authorization": "Bearer test_invalid"},
            "method": "POST",
            "postData": JSON.stringify(data)
        }
        request.continue(payload);
    });
    const response = await page.goto(`${host}:${port}/movies`);
    await browser.close();
    expect(response._status).toBe(403);
});

//User has sent no authentication token, should receive a 401 status.
test("User has sent no authentication token, should receive a 401 status.", async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    let data = {
        test: true,
        title: "Movie6"
    }
    page.on("request", request => {
        let payload = {
            "headers": {...request.headers(), "content-type": "application/json"},
            "method": "POST",
            "postData": JSON.stringify(data)
        }
        request.continue(payload);
    });
    const response = await page.goto(`${host}:${port}/movies`);
    await browser.close();
    expect(response._status).toBe(401);
});

//User has sent no title in the payload, should receive a 400 status.
test("User has sent no title in the payload, should receive a 400 status.", async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    let data = {
        test: true,
        title: "",
        user: "basic_full"
    }
    page.on("request", request => {
        let payload = {
            "headers": {...request.headers(), "content-type": "application/json", "Authorization": "Bearer test"},
            "method": "POST",
            "postData": JSON.stringify(data)
        }
        request.continue(payload);
    });
    const response = await page.goto(`${host}:${port}/movies`);
    await browser.close();
    expect(response._status).toBe(400);
});

//User typed everything properly, but server couldn't find an item, responding with 404 status. Testing basic account.
test("User typed everything properly, but server couldn't find an item, responding with 404 status.", async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    let data = {
        test: true,
        title: "Meofjwp2",
        user: "basic_not_full"
    }
    page.on("request", request => {
        let payload = {
            "headers": {...request.headers(), "content-type": "application/json", "Authorization": "Bearer test"},
            "method": "POST",
            "postData": JSON.stringify(data)
        }
        request.continue(payload);
    });
    const response = await page.goto(`${host}:${port}/movies`);
    await browser.close();
    expect(response._status).toBe(404);
});

//User typed everything properly, but server couldn't find an item, responding with 404 status. Testing premium account.
test("User typed everything properly, but server couldn't find an item, responding with 404 status.", async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    let data = {
        test: true,
        title: "Meofjwp2",
        user: "premium"
    }
    page.on("request", request => {
        let payload = {
            "headers": {...request.headers(), "content-type": "application/json", "Authorization": "Bearer test"},
            "method": "POST",
            "postData": JSON.stringify(data)
        }
        request.continue(payload);
    });
    const response = await page.goto(`${host}:${port}/movies`);
    await browser.close();
    expect(response._status).toBe(404);
});

//User wanted to add a duplicate. Server should respond with 412 status.
test("User wanted to add a duplicate. Server should respond with 412 status.", async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    let data = {
        test: true,
        title: "Movie2",
        user: "premium"
    }
    page.on("request", request => {
        let payload = {
            "headers": {...request.headers(), "content-type": "application/json", "Authorization": "Bearer test"},
            "method": "POST",
            "postData": JSON.stringify(data)
        }
        request.continue(payload);
    });
    const response = await page.goto(`${host}:${port}/movies`);
    await browser.close();
    expect(response._status).toBe(412);
});

//Forcing server to respond with a 500 error.
test("Forcing server to respond with an 500 error.", async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    let data = {
        test: true,
        title: "Movie2",
        user: "premium",
        induce_error: true,
    }
    page.on("request", request => {
        let payload = {
            "headers": {...request.headers(), "content-type": "application/json", "Authorization": "Bearer test"},
            "method": "POST",
            "postData": JSON.stringify(data)
        }
        request.continue(payload);
    });
    const response = await page.goto(`${host}:${port}/movies`);
    await browser.close();
    expect(response._status).toBe(500);
});

//Requesting rubbish.
test("Requesting rubbish  test 01", async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    let data = {
        test: true,
        title: "M34cr34rc34rx3",
        user: "pr23rs34r3cx4tv54y74y65yv56v",
        induce_error: "rx'34rc34tncb4398 bn",
    }
    page.on("request", request => {
        let payload = {
            "headers": {...request.headers(), "content-type": "application/json", "Authorization": "re eig uerpm iuerhtp veirut,hpiu"},
            "method": "POST",
            "postData": JSON.stringify(data)
        }
        request.continue(payload);
    });
    const response = await page.goto(`${host}:${port}/movies`);
    await browser.close();
    expect(response._status).toBe(403);
});

//Requesting rubbish.
test("Requesting rubbish", async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    let data = {
        test: true,
        title: "M34cr34rc34rx3",
        user: "pr23rs34r3cx4tv54y74y65yv56v"
    }
    page.on("request", request => {
        let payload = {
            "headers": {...request.headers(), "content-type": "application/json", "Authorization": "Bear test"},
            "method": "POST",
            "postData": JSON.stringify(data)
        }
        request.continue(payload);
    });
    const response = await page.goto(`${host}:${port}/movies`);
    await browser.close();
    expect(response._status).toBe(404);
});

//GET /movies

//user is authenticated, so will receive a 200 status
test("Authenticated, expecting a 200 status.", async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", request => {
        let payload = {
            "headers": {...request.headers(), "content-type": "application/json", "Authorization": "Bearer test", "Test": "true", "User": "premium"},
            "method": "GET",
        }
        request.continue(payload);
    });
    const response = await page.goto(`${host}:${port}/movies`);
    await browser.close();
    expect(response._status).toBe(200);
});

//user has invalid token, will receive a 403 status
test("Invalid token, expecting 403 status.", async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    let data = {
        test: true
    }
    page.on("request", request => {
        let payload = {
            "headers": {...request.headers(), "content-type": "application/json", "Authorization": "Bearer testewefewfw", "Test": "true", "User": "premium"},
            "method": "GET",
            "getData": JSON.stringify(data)
        }
        request.continue(payload);
    });
    const response = await page.goto(`${host}:${port}/movies`);
    await browser.close();
    expect(response._status).toBe(403);
});

//user has no token, will receive a 401 status
test("No token, expecting 401 status.", async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    let data = {
        test: true
    }
    page.on("request", request => {
        let payload = {
            "headers": {...request.headers(), "content-type": "application/json", "Test": "true", "User": "premium"},
            "method": "GET",
            "getData": JSON.stringify(data)
        }
        request.continue(payload);
    });
    const response = await page.goto(`${host}:${port}/movies`);
    await browser.close();
    expect(response._status).toBe(401);
});

//server stopped processing prematurely, so user will receive a 500 status

test("Forcing server to respond with an 500 error.", async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    let data = {
        test: true,
        induce_error: true,
    }
    page.on("request", request => {
        let payload = {
            "headers": {...request.headers(), "content-type": "application/json", "Authorization": "Bearer test", "Test": "true", "User": "premium", "Error": "true"},
            "method": "GET",
            "getData": JSON.stringify(data)
        }
        request.continue(payload);
    });
    const response = await page.goto(`${host}:${port}/movies`);
    await browser.close();
    expect(response._status).toBe(500);
});
*/