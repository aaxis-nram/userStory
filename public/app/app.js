angular.module('MyApp', [
  'appRoutes', 'mainCtrl', 'authService',
  'userCtrl', 'userService',
  'storyCtrl', 'storyService', 'reverseDirective',
  'equipmentCtrl', 'equipmentService'
])

.config(function($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
})
