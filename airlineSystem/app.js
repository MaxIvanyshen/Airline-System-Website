
const bodyParser = require('body-parser');
const { setupMaster } = require('cluster');
const { WSAEPFNOSUPPORT } = require('constants');
const express = require('express');
const { toNamespacedPath } = require('path');
const { setUncaughtExceptionCaptureCallback } = require('process');
const { func } = require('prop-types');
const app = express();
const sqlite = require('sqlite3');
let random = Math.random().toString(36).substring(7);

var login = false;
var user;
var id;
var lastname;

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }))

app.listen(7000, () => {
    console.log("Look at the port 7000");
});

let db = new sqlite.Database('./airline.db', (err) => {
    if(err) {
        return console.log(err.message);
    }
    console.log("Successfully connected to the db!!!")
});

app.get('/', function(req, res) {
    if(login == true) {
        res.render('indexLoggedIn', {
            user: user,
            id: id
        });
    }
    else {
        res.render('index');
    }
});

var cityTo;

app.post('/', (req, res) => {
    cityTo = req.body.city;
    if(login == true) {
        res.redirect('/create_ticket');
    }
    if(login === false) {
        res.redirect('/login')
    }
});

app.get('/create_ticket', (req, res) => {
    if(login == true) {
        res.render('createTicket', {
            cityTo: cityTo, 
            id: id,
            user: user
        });
    }
    else {
        res.redirect('/login');
    }
});

var price = null;

var from;
var to;
var peopleNumber;
var classType;
var dateTime;

app.post('/create_ticket', (req, res) => {    

    from = req.body.cityFrom;
    to = cityTo;
    classType = req.body.radio;
    dateTime = req.body.date + " " + req.body.time;

    var c;
    var random_seat;

    let random_c = Math.floor(Math.random() * 6)
    let random_num = Math.floor(Math.random() * 15);

    if(random_c == 1) {
        c = 'A';
    }
    if(random_c == 2) {
        c = 'B';
    }
    if(random_c == 3) {
        c = 'C';
    }
    if(random_c == 4) {
        c = 'D';
    }
    if(random_c == 5) {
        c = 'E';
    }
    if(random_c == 6) {
        c = 'F';
    }

    random_seat = c + random_num;
    
    let randomId = Math.random().toString(36).substring(7);

    var ct;
    if(classType == 1) {
        ct = 'First';
    }
    if(classType == 2){
        ct = 'Business';
    }
    if(classType == 3) {
        ct = 'Economy';
    }

    db.all("SELECT price FROM prices WHERE className = ?", [ct], function(err, rows) {
        rows.forEach(function(row) {
            var price = row.price;
            db.all("SELECT count(*) as count FROM transactions WHERE userName = ?", [user + " " + lastname], function(err, rows) {
                rows.forEach(function(row) {
                    db.run('INSERT INTO transactions(id, userName, whereFrom, whereTo, className, seat, whenDateTime, price, numberId)' + 
                    'VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)', [randomId, user + " " + lastname, from, to, ct, random_seat, dateTime, price, row.count + 1]);
                });
            });
        });

        res.redirect('/');
    });
});

app.get('/sign_up', (req, res) => {
    res.render('sign_up');
}); 

app.post('/sign_up', (req, res) => {
    var firstName = req.body.firstname;
    var lastName = req.body.lastname;
    var email = req.body.email;
    var password1 = req.body.password;
    var password2 = req.body.password2;
    var cardNumber = req.body.cardNumber;
    var cvv = req.body.cvv;    

    var state;

    if(password1 === password2) {
        state = "Alright";
        var password = password1;
    
        db.run('INSERT INTO users(id, firstname, surname, email, pass,  cardNumber, cvv) VALUES (?, ?, ?, ?, ?, ?, ?)', ['#' + random, firstName, lastName, email, password, cardNumber, cvv]);
        login = true;
        user = firstName;
        lastname = lastName;
        id = '#' + random;
    }
    if(password1 != password2) {
        state = "Passwords don`t match!";
        res.render('show_state', {
            state: state
        });
    }
    res.redirect('/');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', function(req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var passwordToCheck;

    var firstname;
    var state;

    db.all("SELECT id, firstname, pass, surname FROM users WHERE email = ?", [email], function(err, rows) {
        rows.forEach(function(row) {
            passwordToCheck = row.pass;

            if(password == row.pass) {
                login = true;
                user = row.firstname;
                lastname = row.surname;
                id = row.id;
                res.redirect('/');
            }
            else {                
                res.render('show_state', {
                    state: 'Invalid email or password!'
                });
            }
        });
    });
});
