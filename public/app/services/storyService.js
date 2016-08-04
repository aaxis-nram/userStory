angular.module('storyService',[])

.factory('Story', function($http) {
  var storyFactory = {};

  console.log("In Story service");

  storyFactory.allStories = function (){
    return $http.get('/api/allStories');
  }

  storyFactory.create = function(storyData) {
    console.log("In Story Service :: Create");
    console.log(storyData);
    var ret = $http.post('/api', storyData);
    console.log(ret);

    return ret;
  }

  storyFactory.getStory = function() {
    console.log("In Story Service :: Get");

    return $http.get('/api');
  }


  return storyFactory;
})

.factory('socketio', function ($rootScope) {
  var socket = io.connect();
  return {

    on: function(eventName, callback) {
      socket.on(eventName, function(){
        var args = arguments;
        $rootScope.$apply(function() {
          callback.apply(socket, args);
        });
      });
    },
    emit: function(eventName, data, callback) {
      socket.emit(eventName, data, function() {
        var args = arguments;
        $rootScope.apply(function(){
          if (callback) {
            callback.apply(socket, args);
          }
        })
      })
    }
  };
});
