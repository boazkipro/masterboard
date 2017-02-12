app.service('scrum', [function(){

	this.ajax = function(data){
		return $.ajax({
			method : 'GET',
			url : '/php/index.php',
			data : data
		});
	}
}])