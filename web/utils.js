
exports.fetch = body => {
    if(body.Error) {
        throw new Error(body.Error);
    }
    const {Title, Genre, Director} = body;
    const parsed_date = Date.parse(body.Released);
    const date = new Date(parsed_date);
    const month = date.getMonth() + 1;
    let Released = date.getFullYear().toString();
    
    if(month < 10) {
        Released += `0${month}`;
    }
    else Released += month;
    if(date.getDate() < 10){
        Released += `0${date.getDate()}`;
    }
    else Released += date.getDate().toString();
    return Released;
}

exports.tokenCheck = (body) => {
    const header = body;
    const token = header && header.split(" ")[1];
    if(!token) return false;
    else return true;
}

exports.auth = (rows, request) => {
  if(rows.length === 0) throw new Error ("invalid username or password");

  const user = JSON.parse(JSON.stringify(rows));
  

  let isPasswordValid = request.password === rows[0].password;

  if(!isPasswordValid) {
    throw new Error("invalid username or password");
  }
  else {
    return "top34ntpoinpvj23,-c4,13i04c,234/v324v/5v345.v..543v.53v4.52v341v.432v.v.534";
  }
}
