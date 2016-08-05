angular.module('equipmentCtrl', ['equipmentService'])

.controller('EquipmentController', function(Equipment) {
  var vm = this;
  vm.processing = true;

  Equipment.list()
    .success(function(data){
      vm.equipmentList = data;
    });

})

.controller('EquipmentCreateController', function(Equipment, $location, $window) {
  var vm = this;
  console.log("Equipment Create Controller initialized");

  vm.createEquipment = function() {
    vm.message = '';

    console.log("In Equipment Create Controller");

    Equipment.create(vm.equipmentData)
      .then(function(response) {
        vm.equipmentData = {};
        vm.message = response.data.message;
      });
  };

})

.controller('EquipmentEditController',  function(Equipment, $scope, $routeParams){
  var vm = this;
  var tagNumber = $routeParams.tagNumber;

  vm.tagNumber = tagNumber;
  Equipment.get(tagNumber)
    .success(function(data){
      vm.equipmentData = data;
      vm.equipmentData['originalTagNumber'] = tagNumber;
    });

  vm.updateEquipment = function() {
    vm.message = '';

    console.log("In Equipment Update Controller");

    Equipment.create(vm.equipmentData)
      .then(function(response) {
        vm.equipmentData = {};
        vm.message = response.data.message;
      });
  };

});
