var WebSocketServer = require('websocket').server;
var http = require('http');
var json;
CLIENTS=[];
 
var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});
 
wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production 
    // applications, as it defeats all standard cross-origin protection 
    // facilities built into the protocol and the browser.  You should 
    // *always* verify the connection's origin and decide whether or not 
    // to accept it. 
    autoAcceptConnections: false
});
 
function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed. 
  return true;
}
 
wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin 
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

  
    var connection = request.accept('', request.origin);

    CLIENTS.push(connection);


    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {

        console.log(message);
        json = JSON.parse(message.utf8Data);
        json = JSON.stringify(json.data);
        sendAll(json.replace(/['"]+/g, ''));

      
    });

    function sendAll (message) {
    
    for (var i=0; i<CLIENTS.length; i++) {
        CLIENTS[i].send(message);
    }

}

    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});