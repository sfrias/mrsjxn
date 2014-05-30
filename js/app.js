'use strict';

var app = angular.module('app', ['ngRoute']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {templateUrl: 'partials/main.html'});
    $routeProvider.otherwise({ redirectTo: '/' });
  }]);

// Mrsjxn API account registered under Jxnblk's SoundCloud Account
var clientID = 'bcad0f5473e2f97dbe6b4011c4277ac6';

app.factory('player', function ($document, $rootScope, $http) {
  // Define the audio engine
  var audio = $document[0].createElement('audio');

  // Define the player object
  var player = {
    track: false,
    playing: false,
    paused: false,
    tracks: null,
    i: null,
    load: function(tracks) {
      player.tracks = tracks;
      player.i = 0;
    },
    play: function(tracks, i) {
      if (i == null) {
        tracks = new Array(tracks);
        i = 0;
      };
      player.i = i;
      player.tracks = tracks;
      if (player.paused != player.tracks[player.i]) audio.src = player.tracks[player.i].stream_url + '?client_id=' + clientID;
      audio.play();
      player.playing = player.tracks[player.i];
      player.paused = false;
    },
    pause: function() {
      audio.pause();
      if (player.playing) {
        player.paused = player.playing;
        player.playing = false;
      };
    },
    playPause: function(tracks, i){
      if (tracks[i].id == player.playing.id) {
        player.pause();
      } else {
        player.play(tracks, i);
      }
    },
    next: function() {
      if (player.i+1 < player.tracks.length) {
        player.i++;
        player.play(player.tracks[player.i], player.i);
      } else {
        player.pause();
      };
    },
    previous: function() {
      if (player.i > 0) {
        player.i = player.i - 1;
        player.play(player.tracks[player.i], player.i);
      };
    }
  };

  audio.addEventListener('ended', function() {
    $rootScope.$apply(function(){
      if (player.tracks.length > 0) player.next();
      else player.pause();
    });
    
  }, false);

  return player;

  // Returns the player, audio, track, and other objects
  /*
  return {
    restrict: 'A',
    scope: true,
    link: function (scope, elem, attrs) {
      scope.player = player;
      scope.audio = audio;
      scope.currentTime = 0;
      scope.duration = 0;

      // Updates the currentTime and duration for the audio
      audio.addEventListener('timeupdate', function() {
        if (scope.track == player.track || (scope.playlist && scope.playlist.tracks == player.tracks)){
          scope.$apply(function() {
            scope.currentTime = (audio.currentTime * 1000).toFixed();
            scope.duration = (audio.duration * 1000).toFixed();
          });  
        };
      }, false);

      // Handle click events for seeking
      scope.seekTo = function($event){
        var xpos = $event.offsetX / $event.target.offsetWidth;
        audio.currentTime = (xpos * audio.duration);
      };
    }
  }
  */
});

// Plangular Icons

app.directive('icon', function() {
  var sprite = {
        play: 'M0 0 L32 16 L0 32 z',
        pause: 'M0 0 H12 V32 H0 z M20 0 H32 V32 H20 z',
        previous: 'M0 0 H4 V14 L32 0 V32 L4 18 V32 H0 z',
        next: 'M0 0 L28 14 V0 H32 V32 H28 V18 L0 32 z'
      };
  return {
    restrict: 'A',
    scope: true,
    link: function (scope, elem, attrs) {
      var el = elem[0],
          id = attrs.icon,
          svg = document.createElementNS('http://www.w3.org/2000/svg','svg'),
          path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svg.setAttribute('viewBox', '0 0 32 32');
      path.setAttribute('d', sprite[id]);
      svg.appendChild(path);
      el.className += ' icon icon-' + id;
      svg.setAttribute('class', el.className);
      el.parentNode.replaceChild(svg, el);
    }
  }
});


// Filter to convert milliseconds to hours, minutes, seconds
app.filter('playTime', function() {
  return function(ms) {
    var hours = Math.floor(ms / 36e5),
        mins = '0' + Math.floor((ms % 36e5) / 6e4),
        secs = '0' + Math.floor((ms % 6e4) / 1000);
        mins = mins.substr(mins.length - 2);
        secs = secs.substr(secs.length - 2);
    if(!isNaN(secs)){
      if (hours){
        return hours+':'+mins+':'+secs;  
      } else {
        return mins+':'+secs;  
      };
    } else {
      return '00:00';
    };
  };
});


// Main Controller
app.controller('MainCtrl', ['$scope', '$http', '$location', 'player', function($scope, $http, $location, player) {
  $scope.isLoading = true;
  $scope.tracks = [];
  $scope.data;
  $scope.view = 'mrsjxn';
  $scope.player = player;

  $http.get('/tracks.json').success(function(data){
    $scope.data = data;
    $scope.isLoading = false;
    $scope.tracks = $scope.data[$scope.view];
    player.load($scope.tracks);
  });

  $scope.setView = function(view) {
    console.log('clicked ' + view);
    $scope.view = view;
    $scope.tracks = $scope.data[view];
    if(!player.playing && !player.paused) player.load($scope.tracks);
  };
  
}]);


