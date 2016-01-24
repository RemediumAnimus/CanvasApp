define(function(){
	function unit() {
		var form = document.getElementById('publish');
		
		form.onsubmit = function() {
			var xhr = new XMLHttpRequest();
			xhr.open('POST', "messages.json", true);
			xhr.send(JSON.stringify({message: this.elements.message.value}));
			return false;
		};
		
		getMessage();
		
		function getMessage() {
			
		}
	}
	
	return {
		unit: unit
	};
});
