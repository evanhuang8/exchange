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
	$('a#register_switch').click(function(){
		$('form#right_login').fadeOut('fast',function(){
				register = true;
				$('form#right_register').show();			
		});	
	});
	$('a#login_switch').click(function() {
		$('form#right_register').fadeOut('fast',function(){
				register = false;
				$('form#right_login').show();			
		});
	});
});
