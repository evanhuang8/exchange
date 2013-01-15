register = false;
$(document).ready(function() {
	$('form#right_login').submit(function(e) {
		e.preventDefault();
		$.get(rootUrl + 'login', $(this).serialize(), function(response) {
			response = jQuery.parseJSON(response);
			if (response.status == 'OK') {
				document.location.reload(true);
			} else {
				alert(response.error);
			}
		});
		return false;
	});
	$('form#right_register').submit(function() {
		$.post(rootUrl + 'individualRegister', $(this).serialize(), function(response) {
			response = jQuery.parseJSON(response);
			if (response.status == 'OK') {
				document.location.reload(true);
			} else {
				alert(response.error);
			}
		});
		return false;
	});
	$('a#right_switch').click(function(){
		if(!register){
			$('form#right_login').fadeOut('fast',function(){
				register = true;
				$('form#right_register').show();
				$('a#right_switch').html('Log In')			
			});
		}
		else{
			$('form#right_register').fadeOut('fast',function(){
				register = false;
				$('form#right_login').show();
				$('a#right_switch').html('Register')			
			});
		}	
	});
});
