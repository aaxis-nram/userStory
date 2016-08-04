angular.module('userCtrl', ['userService'])

.controller('UserController', function(User) {
  var vm = this;
  vm.processing = true;

  User.all()
    .success(function(data){
      vm.users = data;
    });

})

.controller('UserCreateController', function(User, $location, $window) {
  var vm = this;
  console.log("User Create Container initialized");

  vm.signupUser = function() {
    vm.message = '';

    console.log("In User Create Controller");

    User.create(vm.userData)
      .then(function(response) {
        vm.userData = {};
        vm.message = response.data.message;

        $window.localStorage.setItem('token', response.data.token);
        $location.path('/');
      })
  }

})
