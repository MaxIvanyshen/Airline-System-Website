
const bodyParser = require('body-parser');
const { setupMaster } = require('cluster');
const express = require('express');
const { setUncaughtExceptionCaptureCallback } = require('process');
const { func } = require('prop-types');
const app = express();
const sqlite = require('sqlite3');
let random = Math.random().toString(36).substring(7);

var login = false;
var user;
var id;

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

app.post('/', (req, res) => {
    var city = req.body.city;
    console.log(city);
    if(login === false) {
        res.redirect('/login')
    }
})

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
    }
    if(password1 != password2) {
        state = "Passwords don`t match!";
        res.render('show_state', {
            state: state
        });
    }
    
    db.run('INSERT INTO users(id, firstname, surname, email, pass,  cardNumber, cvv) VALUES (?, ?, ?, ?, ?, ?, ?)', [random, firstName, lastName, email, password, cardNumber, cvv]);
    login = true;
    user = firstName;
    id = random;
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

    db.all("SELECT id, firstname, pass FROM users WHERE email = ?", [email], function(err, rows) {
        rows.forEach(function(row) {
            passwordToCheck = row.pass;

            if(password == row.pass) {
                login = true;
                user = row.firstname;
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
