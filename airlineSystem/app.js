
const bodyParser = require('body-parser');
const { setupMaster } = require('cluster');
const { WSAEPFNOSUPPORT, PRIORITY_LOW } = require('constants');
const express = require('express');
const { toNamespacedPath } = require('path');
const { setUncaughtExceptionCaptureCallback, abort } = require('process');
const { func } = require('prop-types');
const app = express();
const sqlite = require('sqlite3');
let random = Math.random().toString(36).substring(7);

var login = null;
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

    if(login === true) {
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
                db.all("SELECT count(*) as count FROM transactions WHERE usersId = ?", [id], function(err, rows) {
                    rows.forEach(function(row) {
                        db.run('INSERT INTO transactions(id, usersId, userName, whereFrom, whereTo, className, seat, whenDateTime, price, numberId)' + 
                        'VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', ['#' + randomId, id, user + " " + lastname, from, to, ct, random_seat, dateTime, price, row.count + 1]);
                    });
                });
            });
    
            res.redirect('/');
        });
    }
    else {
        res.redirect('/login');
    }

    
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

    db.all('SELECT count(*) as count FROM users WHERE email = ?', [email], (err, rows) => {
        rows.forEach((row) => {
            var count = row.count
            if(count > 0) {
                db.all("SELECT id, firstname, pass, surname FROM users WHERE email = ?", [email], function(err, rows) {
                    rows.forEach(function(row) {
            
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
            }   
            else {
                res.render('show_state', {
                    state: 'Invalid email or password!'
                });
            }
        });
    });    
});

app.get('/user', (req, res) => {
    
    if(login === true) {        
                db.all("SELECT count(*) as count FROM transactions WHERE usersId = ?", [id], function(err, rows) {
                    rows.forEach(function(row) {
                        var count = row.count;
                        if(count === 0) {
                            db.all('SELECT * FROM users WHERE id = ?', [id], (err, rows) => {
                                rows.forEach((row) => {
                                    var email = row.email;
                                    var surname = row.surname;
                                    var pass = row.pass;
                                    var card = row.cardNumber;

                                    res.render('userWithoutTrans', {
                                        transaction: "No transactions yet",
                                        user: user,
                                        surname: surname,
                                        email: email,
                                        pass: pass,
                                        card: card,
                                        id: id
                                    }); 
                                });
                            });
                        }
                        if(count > 0) {
                            db.all('SELECT * FROM users WHERE id = ?', [id], (err, rows) => {
                                rows.forEach((row) => {
                                    var email = row.email;
                                    var surname = row.surname;
                                    var pass = row.pass;
                                    var card = row.cardNumber;
                                    db.all('SELECT * FROM transactions WHERE usersId = ? AND numberId = ?', [id, count], (err, rows) => {
                                        rows.forEach((row) => {
                                            res.render('user', {
                                                transaction: "id: " + row.id + 
                                                ", number: " + count + ", from: " + row.whereFrom + 
                                                ", to: " + row.whereTo + ", class: " + row.className + ", seat: " + row.seat + ", date and time: " + 
                                                row.whenDateTime + "; PRICE: $" + row.price,
                                                user: user,
                                                surname: surname,
                                                email: email,
                                                pass: pass,
                                                card: card,
                                                id: id
                                            });                                             
                                        });
                                    });
                                });
                            });
                        }
                        
                });                
        });        
    }   
    else {
        res.redirect('/login');
    }    
});

app.post('/user', (req, res) => {
    db.all('SELECT * FROM users WHERE id = ?', [id], (err, rows) => {
        rows.forEach((row) => {
            var action = req.body.postResult;
            if(action == 'delete') {
                db.run("DELETE FROM transactions WHERE usersId = ?", [id]);
                db.run("DELETE FROM users WHERE id = ?", [id]);
                login = false;
                res.redirect('/');
            }
            if(action == 'logout') {
                login = false;
                res.redirect('/');
            }
            if(action == row.pass) {
                res.redirect('/change_pass');
            }
            if(action == row.email) {
                res.redirect('/change_email');
            }
        });
    });
});

app.get('/change_pass', (req, res) => {
    if(login == true) {
        res.render('changePass');
    }
    else {
        res.redirect('/login');
    }
});

app.post('/change_pass', (req, res) => {
    var newPass = req.body.newPassword;
    var newPass2 = req.body.newPassword2;

    if(newPass == newPass2) {
        db.run('UPDATE users SET pass = ? WHERE id = ?', [newPass, id]);
        login = false;
        res.redirect('/login');
    }
    else {
        res.render('show_state', {
            state: 'Password don`t match'
        });
    }
});

app.get('/change_email', (req, res) => {
    if(login == true) {
        res.render('changeEmail');
    }
    else {
        res.redirect('/login');
    }
});

app.post('/change_email', (req, res) => {
    db.all('SELECT email FROM users WHERE id = ?', [id], (err, rows) => {
        rows.forEach((row) => {
            var newEmail = req.body.newEmail;
            if(newEmail != row.email) {
                db.run("UPDATE users SET email = ? WHERE id = ?", [newEmail, id]);
                login = false;
                res.redirect('/login');
            }
            else {
                res.render('show_state', {
                    state: 'Exact same email!'
                });
            }
        });
    });
});