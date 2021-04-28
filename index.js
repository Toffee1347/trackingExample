const express = require('express');
const http = require('http');
const {readFileSync} = require('fs');
const bodyParser = require('body-parser').json;
const password = process.env.PASSWORD;
let file;

let entries = [];

const app = express();
const server = http.createServer(app);

app.use(bodyParser());
app.use((req, res, next) => {
    req.get('X-Forwarded-Proto') !== 'https' && req.get('Host') == 'trackingg.herokuapp.com' ? res.redirect(`https://${req.get('Host')}${req.url}`) : next();
});

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
});
app.post('/', (req, res) => {
    if (req.body.password !== password) return res.json({status: 0});

    res.json({status: 1, entries});
});

app.get('/favicon/*', (req, res) => {
    entries.push({req: {ip: req.ip, headers: req.headers}, id: req.url.split('/')[2]});

    res.sendFile(`${__dirname}/public/favicon.ico`);
});
app.get('/t/*', (req, res) => {
    let text = req.url.split('/')[2];
    res.send(file(text, req.protocol + '://' + req.get('host')));
});

(async () => {
    let html = await readFileSync('./public/tracker.html', {encoding: 'utf8'});
    file = (text, host) => {
        return html.replace('**FAVICON**', `${host}/favicon/${text}`);
    };
    server.listen(process.env.PORT || 80, () => {
        console.log('Listening on port 80!', `Password: ${password}`);
    });
})();