angular.module('equipmentService', [])

.factory('Equipment', function($http){
  var equipmentFactory = {};

  equipmentFactory.create = function(equipmentData) {
    console.log("In Equipment Service");

    return $http.post('/api/createEquipment', equipmentData);
  }

  equipmentFactory.list = function() {
    return $http.get('/api/listEquipment');
  }

  equipmentFactory.get = function(tagNumber) {
    return $http.get('/api/getEquipment?tagNumber='+tagNumber)
  }

  return equipmentFactory;
})
