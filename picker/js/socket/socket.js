angular.module( "tapp" )
	.factory('socket', function ($rootScope) {
		//http://www.html5rocks.com/en/tutorials/frameworks/angular-websockets/?redirect_from_locale=de
		var socket = io.connect(location.href, {path: "/tr/socket.io"});
		return {
			on: function (eventName, callback) {
				socket.on(eventName, function () {  
					var args = arguments;
					$rootScope.$apply(function () {
					callback.apply(socket, args);
				});
			});
		},
			emit: function (eventName, data, callback) {
				socket.emit(eventName, data, function () {
					var args = arguments;
					$rootScope.$apply(function () {
						if (callback) {
							callback.apply(socket, args);
						}
					});
				})
			}
		};
	});