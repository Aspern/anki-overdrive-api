'use strict';

var app = angular.module('app', ['ngWebsocket']);


app.controller('MyCtrl', function($scope, $websocket, $timeout){

  var ws = $websocket.$new('ws://localhost:8080');

  ws.$on('$open', function () {
    //ws.$emit('webgui','hello how are you?'); // it sends the event 'webgui' with data 'world'
  })
  .$on('$message',function (message) { // it listents for incoming 'messages'
    console.log('something incoming from the server: ' + message);
  });


  $scope.hideStuff = function () {

        $scope.startFade = true;
        $timeout(function(){
            $scope.hidden = true;
        }, 2000);
        
    };

  $scope.send = function(message) {

    $scope.hideStuff();

    console.log(message);
    ws.$emit('webgui',message); // it sends the event 'webgui' with data 'world'

  }
	
	
	
});