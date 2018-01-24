const https = require("https");
const fs = require("fs");
let city_arg = "lat=40.75&lon=-73.98999786376953";
let data = "";
let max_topics = 100;
https.get("https://api.meetup.com/find/topics?query=Software Development", (response) => {
    response.on("data", (chunk) => {
        data += chunk;
    });
    response.on("end", () => {
        data = JSON.parse(data);
        main(data);
    });
});

function main(data)
{
    let topic_arg = "";
    for (let i = 0; i < Math.min(data.length, max_topics); ++i) {
        topic_arg += data[i].urlkey + ',';
    }
    if (topic_arg.length)
        topic_arg = topic_arg.slice(0, -1);
    data = "";
    https.get("https://api.meetup.com/2/open_events?key=453e53453030346934161a7b1247412e&time=,1w&topic=" + topic_arg + '&' + city_arg , (response) => {
        response.on("data", (chunk) => {
            data += chunk;
        });
        response.on("end", () => {
            data = JSON.parse(data);
            //data = data.results;
            data.sort((lhs, rhs) => {
                return lhs.time - rhs.time;
            });
            generate(data);
        });
    });
}

function generate(data)
{
    let html = "<!DOCTYPE html> \
        <html> \
        <head> \
            <meta charset=\"utf-8\"/> \
            <title>Events in New York</title> \
            <link type=\"text/css\" rel=\"stylesheet\" href=\"style.css\" /> \
        </head> \
        <body>";
    data.forEach((item) => {
        html += "<div class=\"row\">";
        html += formRow(item);
        html += "</div>";
    });
    html += "</body></html>";
    fs.writeFile("main.html", html);
}

function formRow(item)
{
    let result = "";
    let date = new Date(item.time);
    result += formDate(new Date(item.time));
    result += "<div class=\"long-cell\"><b>Name:</b> " + item.name + "</div>";
    result += formLocation(item.venue);
    if (item.description)
        result += "<div class=\"desr\"><b>Description:</b> " + item.description + "</div>";
    return result;
}

function formDate(date)
{
    return "<div class=\"cell\"><b>Time:</b> " + formTime(date) + ' ' + date.getDate() + '/'
        + (date.getMonth() + 1) + '/' + date.getFullYear() + "</div>";

}

function formTime(date)
{
    let result = date.getHours() + ':';
    if (!(date.getMinutes() / 10))
        result += '0';
    result += date.getMinutes();
    return result;
}

function formLocation(venue) {
    let result = "<div class=\"long-cell\"><b>Location:</b> ";
    if (venue) {
        result += venue.city + venue.address_1;
    }
    result += "</div>";
    return result;
}