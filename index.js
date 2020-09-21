let app = require('express')();
let http = require('http').Server(app);
const fetch = require("node-fetch");
let PORT = process.env.PORT || 3000;

const countries = ['Brazil', 'France', 'Germany', 'Italy', 'Spain', 'Sweden', 'USA'];

http.listen(PORT, function () {
    console.log('Server gestartet, listening on localhost:3000');
});

app.get('/status', function (req, res) {
    answer = {
        "status": "ok"
    };
    res.send(answer);
});

app.get('/:country', function (req, res) {
    const param = req.params.country;
    if (!countries.includes(param)) {
        res.send({
            "status": "error_country_not_available"
        });
    } else {
        getData(param, res);
    }
});

async function getData(param, ress) {
    let res = await fetch(`https://covid-193.p.rapidapi.com/history?country=${param}`, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "covid-193.p.rapidapi.com",
            "x-rapidapi-key": "1f3580425emshbbcb35876c1c120p192c74jsnd8cdb6225e81"
        }
    });
    let data = await res.json();
    let parsedData = parseData(data);
    ress.send(parsedData);
}

function parseData(data) {
    let currentDay = 0;
    let pData = [];
    for (const i of data.response) {
        if (i.day !== currentDay) {
            pData.push({
                "cases" : i.cases.total,
                "deaths" : i.deaths.total,
                "date": i.day
            });
        }
        currentDay = i.day;
    }
    let casesThisWeek = pData[1]["cases"] - pData[7]["cases"];
    let casesLastWeek = pData[8]["cases"] - pData[14]["cases"];

    let deathsThisWeek = pData[1]["deaths"] - pData[7]["deaths"];
    let deathsLastWeek = pData[8]["deaths"] - pData[14]["deaths"];
    return {
        casesThisWeek, casesLastWeek, deathsThisWeek, deathsLastWeek
    };
}