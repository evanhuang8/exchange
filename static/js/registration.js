$(document).ready(function() {
	
	$('a#register').click(function() {
		if ($('div#register_submit input[type=checkbox]').is(':checked')) {
			$('form#form_register input[name=community]').val($('input[name=community]:checked').val());
			$('form#form_register input[name=notify_type]').val('N');
			$('form#form_register input[name=notify_value]').val('');
			$('form#form_register').submit();
		}
	});
});
