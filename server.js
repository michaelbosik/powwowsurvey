const fs = require('fs');
const mime = require('mime');
const express = require('express');
const bodyParser = require('body-parser');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const db = low(new FileSync('answers.json'));
const input = low(new FileSync('input.json'));
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const sendFile = function( response, filename ) {
    const type = mime.getType( filename );
    fs.readFile( filename, function( err, content ) {
      if ( err === null ) {
        response.writeHeader( 200, {'Content-Type': type});
        response.end( content );
      } else {
        response.writeHeader( 404 );
        response.end( '404 Error: File Not Found' );
      }
    });
};

app.get('/', function(request, response) {
    sendFile( response, './index.html' );
});

app.get('/style.css', function(request, response) {
    sendFile( response, './style.css' );
});

app.get('/main.js', function(request, response) {
    sendFile( response, './main.js' );
});

app.post('/submit', function(req, res) {
    db.get('answers').push(req.body).write();
    res.redirect('/');
});

app.get('/input', function(req, res){
    res.end(JSON.stringify(input.get('questions')));
})

app.listen( process.env.PORT || port );