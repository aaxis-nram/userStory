angular.module('userService', [])

.factory('User', function($http){
  var userFactory = {};

  userFactory.create = function(userData) {
    console.log("In User Service");

    return $http.post('/api/signup', userData);
  }

  userFactory.all = function() {
    return $http.get('/api/users');
  }

  return userFactory;
})
