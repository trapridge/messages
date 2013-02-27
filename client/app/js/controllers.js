'use strict';

function MyCtrl1($scope, $resource) {

	var Message = $resource('/api/v1/messages/:id');
	
	$scope.listMessages = function() {
		$scope.messages = [];
		var messages = Message.query(function() {
			angular.forEach(messages, function(value) {
				this.push(value);
			}, $scope.messages);
		});
	}

	$scope.addMessage = function() {
		var m = new Message();
		m.message = $scope.newMessage;
		m.$save();
		$scope.listMessages();
	}

	$scope.deleteMessage = function(_id) {
		Message.delete({id:_id}, function() {
			$scope.listMessages();
		});
	}
}
MyCtrl1.$inject = ['$scope', '$resource'];