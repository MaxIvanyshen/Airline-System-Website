
const bodyParser = require('body-parser');
const express = require('express');
const { func } = require('prop-types');
const app = express();
const sqlite = require('sqlite3');
let random = Math.random().toString(36).substring(7);

let login = false;
var user;

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
    res.render('index');
});

app.get('/logged', (req, res) => {
    if(login === true) {
        res.render('indexLoggedIn', {
            user: user
        });
    }
    else {
        res.redirect('/');
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

    console.log(email);

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
    
    db.run('INSERT INTO users(id, firstname, surname, email, password,  cardNumber, cvv) VALUES (?, ?, ?, ?, ?, ?, ?)', [random, firstName, lastName, email, password, cardNumber, cvv]);
    login = true;
    user = firstName + " " + lastName;
    res.redirect('/logged');
});

