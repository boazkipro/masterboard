// (function() {
//     var childProcess = require("child_process");
//     var oldSpawn = childProcess.spawn;
//     function mySpawn() {
//         console.log('spawn called');
//         console.log(arguments);
//         var result = oldSpawn.apply(this, arguments);
//         return result;
//     }
//     childProcess.spawn = mySpawn;
// })();

require("bixbyte-frame");
app.port  = 3000;

//** SETUP THE PHP CGI
app.use("/php", php.cgi(`${__dirname}/../php`) );

app.port    = app.port || 5000;

//** SETUP SOCKET.IO
// var io = require('socket.io');
var connectedUsers = [];

	var unique = (arr)=> {
	    return arr.sort().filter(function(item, pos, ary) {
	        return !pos || item != ary[pos - 1];
	    })
	};

	io.sockets.on('connection', function(socket) {

		socket.on("addUser",function(username){
			connectedUsers.push(username);
			connectedUsers = unique(connectedUsers);
			io.emit("connectedUsers", connectedUsers);
			console.dir(connectedUsers);
		})

		
		io.emit('onlineNotification', "A new user just connected");
	});

//!SET THE BASIC DIRECTORY MIDDLEWARE
app.use(express.static( __dirname + '/../'));

//!ROOT ROUTE
app.route("/").all(function(req,res){
	res.sendFile( "index.html");
});

app.route("/login").all( (req,res) => {
	//console.log( JSON.stringify(fs.readFileSync(`${__dirname}/../login.html`,'utf8'),null,2) )
	res.send(fs.readFileSync(`${__dirname}/../login.html`,'utf8'));
})

//!ROUTE LEADING TO THE HOME DIRECTORY
app.route("/sample/:iara").all(function(req,res){
	var i = req.params.iara;
	res.sendFile( i ,{ "root": __dirname + "/../" });
});

//!ROUTE LEADING TO THE CONFIGURATION FILE DIRECTORY 
app.route("/config/:fname").all(function(req,res){
	console.log("getting the file" + req.params.fname)
	res.sendFile(req.params.fname, { "root": __dirname + "/../config/"} )
});


//!THE SERVER STARTUP FILE
server.listen(app.port ,function(err){
	if(!err){
		log(`Running server on http://${myAddr}:${app.port}`.yell);
	}
});	
