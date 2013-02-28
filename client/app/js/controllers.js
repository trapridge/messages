'use strict';

function MyCtrl1($scope, $resource) {

	var Message = $resource('/api/v1/messages/:id');
	
	$scope.listMessages = function() {
		var messages = Message.query(function() {
			$scope.messages = [];
			angular.forEach(messages, function(value) {		
				this.push(value);
			}, $scope.messages);
		});
	}

	$scope.addMessage = function() {
		var m = new Message();
		m.message = $scope.newMessage;
		m.$save(function() {
			$scope.listMessages();
			$scope.newMessage = '';
			$scope.alerts.push({ type: 'success', message: 'yey' });
		});
	}

	$scope.deleteMessage = function(_id) {
		Message.delete({id:_id}, function() {
			$scope.listMessages();
		});
	}

	$scope.saveMessage = function(_id, message) {
		var m = Message.get({id:_id}, function() {
		  	m.message = message;
		  	m.$save({id:_id}, function() {
				$scope.listMessages();
			});
		});
	}

	$scope.clearAndAdd = function(event) {
		$scope.addMessage();
	}

	$scope.close = function(index) {
		$scope.alerts.splice(index, 1);
	}

}
MyCtrl1.$inject = ['$scope', '$resource'];