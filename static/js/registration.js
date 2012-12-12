$(document).ready(function() {
	var phoneBlank = true;
	var phoneDefault = 'Phone number';
	var emailBlank = true;
	var emailDefault = 'Email';
	$('div#notify_phone input[name=phone]').focus(function() {
		$('div#notify_email input[type=radio]').removeAttr('checked');
		$('div#notify_none input[type=radio]').removeAttr('checked');
		$('div#notify_phone input[type=radio]').attr('checked', true);
		$('div#notify_email input[name=email]').removeClass('on').removeClass('invalid');
		if (phoneBlank) {
			$(this).val('');
		}
	}).blur(function() {
		if ($(this).val() == '') {
			phoneBlank = true;
			$(this).removeClass('on');
			$(this).val(phoneDefault);
		} else {
			phoneBlank = false;
			$(this).addClass('on');
			if (/^[0-9]{10}$/.test($(this).val().replace(/[^\d.]/g, ''))) {
				$(this).removeClass('invalid');
			} else {
				$(this).addClass('invalid');
			}
		}
	});
	$('div#notify_email input[name=email]').focus(function() {
		$('div#notify_phone input[type=radio]').removeAttr('checked');
		$('div#notify_none input[type=radio]').removeAttr('checked');
		$('div#notify_email input[type=radio]').attr('checked', true);
		$('div#notify_phone input[name=phone]').removeClass('on').removeClass('invalid');
		if (emailBlank) {
			$(this).val('');
		}
	}).blur(function() {
		if ($(this).val() == '') {
			emailBlank = true;
			$(this).removeClass('on');
			$(this).val(emailDefault);
		} else {
			emailBlank = false;
			$(this).addClass('on');
			if (/^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.(([0-9]{1,3})|([a-zA-Z]{2,3})|(aero|coop|info|museum|name))$/.test($(this).val())) {
				$(this).removeClass('invalid');
			} else {
				$(this).addClass('invalid');
			}
		}
	});
	$('div#notify_none div.right').click(function() {
		$('div#notify_phone input[type=radio]').removeAttr('checked');
		$('div#notify_email input[type=radio]').removeAttr('checked');
		$('div#notify_none input[type=radio]').attr('checked', true);
		$('div#notify_phone input[name=phone]').removeClass('on').removeClass('invalid');
		$('div#notify_email input[name=email]').removeClass('on').removeClass('invalid');
	});
	$('div#register_notify input[name=notify]').change(function() {
		var typeValue = $('div#register_notify input[name=notify]:checked').val();
		if (typeValue == 'T') {
			$('div#notify_phone input[name=phone]').focus();
		} else if (typeValue == 'M') {
			$('div#notify_email input[name=email]').focus();
		} else if (typeValue == 'N') {
			$('div#notify_none div.right').trigger('click');
		}
	});
	$('a#register').click(function() {
		if ($('div#register_submit input[type=checkbox]').is(':checked')) {
			var typeValue = $('div#register_notify input[name=notify]:checked').val();
			var notifyValue = '';
			var fieldValid = false;
			if (typeValue == 'T') {
				var phoneVal = $('div#notify_phone input[name=phone]').val().replace(/[^\d.]/g, '');
				if (/^[0-9]{10}$/.test(phoneVal)) {
					notifyValue = phoneVal;
					fieldValid = true;
				}
			} else if (typeValue == 'M') {
				var emailVal = $('div#notify_email input[name=email]').val();
				if (/^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.(([0-9]{1,3})|([a-zA-Z]{2,3})|(aero|coop|info|museum|name))$/.test(emailVal)) {
					notifyValue = emailVal;
					fieldValid = true;
				}
			} else if (typeValue == 'N') {
				fieldValid = true;
			}
			if (fieldValid) {
				$('form#form_register input[name=notify_type]').val(typeValue);
				$('form#form_register input[name=notify_value]').val(notifyValue);
				$('form#form_register').submit();
			}
		}
	});
});
