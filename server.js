var http = require('http');
var fs = require('fs');
var url = require('url');

var server = http.createServer();

var counter = 0;
server.on('request', function(req, res){ 
		
		if (req.url == '/styles.css') {
			fs.readFile('styles.css','utf-8',function(err, data) {
				res.writeHead(200,{
					'Content-Type': 'text/css'
				});
				res.end(data);
			});
		} else {
			fs.readFile('index.html','utf-8',function(err, data) {		
				res.writeHead(200,{
					'Content-Type': 'text/html; charset = utf-8'
				});
				res.end(data);
			});
		}					
});



server.listen(3000);

