'use strict';

var app = angular.module('app', ['ngWebsocket']);


app.controller('MyCtrl', function($scope, $websocket, $timeout){

  var ws = $websocket.$new('ws://localhost:8080');
  var json;
  var myEl = angular.element( document.querySelector( '#status' ) );
  $scope.date = new Date();



  ws.$on('$open', function () {
    //ws.$emit('webgui','hello how are you?'); // it sends the event 'webgui' with data 'world'
  })
  .$on('$message',function (message) { // it listents for incoming 'messages'
    console.log('received: ' + message);


      $scope.newDate();


      if(message=="Started")
        {
          $scope.hideStuff();
          myEl.append('['+$scope.date+'] Anti-Collision Started<br>'); 

        }

      else if(message=="Stop")
      {
        $scope.showStuff();
        myEl.append('['+$scope.date+'] Anti-Collision Stopped<br>'); 

      }
  

  });

    
    $scope.newDate = function () {
      // body...

      $scope.date = new Date();

    }



  $scope.hideStuff = function () {


        $scope.startFade = true;
        $timeout(function(){
            $scope.hidden = true;
        }, 2000);


        
    };

      $scope.showStuff = function () {

        $scope.startFade = true;
        $timeout(function(){
            $scope.hidden = false;
        }, 2000);
        
    };



  $scope.send = function(message) {

    $scope.newDate();

    if(message=="A1")
    {

        myEl.append('['+$scope.date+']<a class="saving" > Preparing to Start Anti-Collision <span>.</span><span>.</span><span>.</span></a><br>');
 
    }

    else if(message=="A0")
    {

        myEl.append('['+$scope.date+']<a class="saving"> Stopping Anti-Collision <span>.</span><span>.</span><span>.</span></a><br>');
 
    }
    console.log(message);
    ws.$emit('webgui',message); // it sends the event 'webgui' with data 'world'

  }
	
	
	
});