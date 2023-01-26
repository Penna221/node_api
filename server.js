const express = require('express')
const session = require('express-session')
const app = express()
require('dotenv').config();
const mysql = require('mysql');
const path = require('path');
app.use(express.urlencoded({ extended: true }));
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
const connection = mysql.createConnection({
    host : process.env.HOST,
    port : process.env.PORT,
	user : process.env.USER,
	password : process.env.PASSWORD,
	database : process.env.DATABASE
});

app.use(express.json())

const fs = require("fs");
const buffer1 = fs.readFileSync(path.join(__dirname + '/sites/htmlTop.html'));
const htmlTop = buffer1.toString();
const buffer2 = fs.readFileSync(path.join(__dirname + '/sites/loginform.html'));
const loginForm = buffer2.toString();


///////////////////////////////////////////////
app.post('/login', (req,res)=>{
    let username = req.body.username;
	let password = req.body.password;
    if (username && password) {
		
		connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (error) throw error;
			if (results.length > 0) {
				// Authenticate the user
				req.session.loggedin = true;
				req.session.username = username;
				// Redirect to home page
				res.redirect('/home');
			} else {
				res.statusCode=403;
				res.setHeader('Content-Type','text/html');
				res.write(htmlTop);
				res.write('<body>\n')
				res.write('Incorrect Username and/or Password!<br>')
				res.write(loginForm)
				res.write('\n</body>\n</html>')
				res.send();
			}			
			res.end();
		});
	} else {
		res.statusCode=400;
		res.setHeader('Content-Type','text/html');
				res.write(htmlTop);
				res.write('<body>\n')
				res.write('Please enter Username and Password!<br>')
				res.write(loginForm)
				res.write('\n</body>\n</html>')
				res.send();
	}
})

app.get('/login',(req,res)=> {
	if(req.session.loggedin){
		res.redirect('/home')
	}
    res.sendFile(path.join(__dirname +'/sites/index.html'));
})
app.get('/home',(req,res)=>{
	res.setHeader('Content-Type','text/html');
	if(req.session.loggedin){
		res.write(htmlTop);
		res.write('<body>\n')
		res.write('Welcome back ' + req.session.username)
		res.write('<br><button onclick="window.location.href=\'/logout\'">Logout</button>');
		res.write('\n</body>\n</html>')
		res.send();
	}else{
		res.redirect('/login');
	}
})
app.get('/logout', (req, res)=>{
	
	req.session.destroy();

	res.redirect('/login');
})
app.get('/*',(req,res)=>{
    if(req.session.loggedin){
        res.redirect('/home')
    }else{
        res.redirect('/login');

    }
})


///////////////////////////////////////////////



app.listen(3000,()=> console.log('Server started'))