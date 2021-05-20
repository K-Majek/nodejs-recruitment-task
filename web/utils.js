
exports.fetch = body => {
    if(body.Error) {
        return res.status(404).json({ error: body.Error });
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