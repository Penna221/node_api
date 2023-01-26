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
const buffer3 = fs.readFileSync(path.join(__dirname + '/sites/testplace.html'));
const testSite = buffer3.toString();

app.use(express.static(__dirname ));
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
	res.setHeader('Content-Type','text/html');
	res.write(htmlTop)
	res.write('<body>\n')
	res.write('<h1 class="center">Please login to access testsite.</h1>')
	res.write(loginForm)
	res.write('\n</body>\n</html>')
	res.send();	
    
})
app.get('/home',(req,res)=>{
	res.setHeader('Content-Type','text/html');
	if(req.session.loggedin){
		res.write(htmlTop);
		res.write('<body>\n')
		res.write('<p id="user">Welcome back ' + req.session.username+'</p>')
		res.write('<button onclick="window.location.href=\'/logout\'">Logout</button><br>');
		res.write(testSite)
		res.write('\n</body>\n</html>')
		res.send()
		
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

app.post('/additem', (req,res)=>{
	if(req.session.loggedin){
		res.send('You tried to add item to list');
	}else{
		res.setHeader('Content-Type','text/html');
		res.statusCode=403;
		res.write(htmlTop);
		res.write('<body>\n')
		res.write('<h1 class="center">403 FORBIDDEN</h1><br><br>');
		res.write('<p class="center warning"></p>');
		res.write('\n</body>\n</html>')
		res.send()
	}
})
///////////////////////////////////////////////



app.listen(3000,()=> console.log('Server started'))