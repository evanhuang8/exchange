$(document).ready(function() {
	initSearch();
	initButtons();
});

function initSearch() {
	var searchBlank = true;
	var searchDefault = 'a ride to the airport';
	$('div#search_input input').focus(function() {
		if (searchBlank) {
			$(this).val('');
		}
	}).blur(function() {
		if ($(this).val() == '') {
			searchBlank = true;
			$(this).removeClass('on');
			$(this).val(searchDefault);
		} else {
			searchBlank = false;
			$(this).addClass('on');
		}
	}).keypress(function(e) {
		if (e.which == 13) {
			$('div#search_input form').submit();
			e.preventDefault();
		}
	});
	$('div#search_submit').click(function() {
		if (!searchBlank && $('div#search_input input').val() != '') {
			$('div#search_input form').submit();
		}
	});
}

var shouldReloadPage = false;

function initButtons() {
	$('div#wrapper_listing div.post div.post_action a').parent().parent().removeClass('red_border').removeClass('blue_border');
	$('div#wrapper_listing div.post div.post_action a:not(.tan)').unbind().click(function() {
		var post = $(this).parent().parent();
		var actionForm = getFlip(post, true);
		$(post).flip({
			direction:'rl',
			speed:200,
			content:actionForm,
			onEnd:function() {
				if (shouldReloadPage) {
					shouldReloadPage = false;
					$('div#wrapper_listing').animate({opacity:0}, 300, function() {
						$(post).remove();
						$('div#wrapper_listing').animate({opacity:1}, 300, function() {});
					});
					return true;
				}
				$(post).removeAttr('style').addClass('blue_border');
				initPostContact(post);
				$(post).find('div.post_cancel a').click(function() {
					$(post).removeClass('blue_border').revertFlip();
				});
				$(post).find('div.post_confirm a').click(function() {
					var postID = $(post).find('span.id').html();
					var phoneChecked = $(post).find('div.post_phone input[type=checkbox]').is(':checked');
					var phoneVal = $(post).find('div.post_phone input[type=text]').val().replace(/[^\d.]/g, '');
					var emailChecked = $(post).find('div.post_email input[type=checkbox]').is(':checked');
					var emailVal = $(post).find('div.post_email input[type=text]').val();
					var noteVal = $(post).find('div.post_note input[type=text]').val();
					if ((phoneChecked || emailChecked) && (!phoneChecked || /^[0-9]{10}$/.test(phoneVal)) && (!emailChecked || /^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.(([0-9]{1,3})|([a-zA-Z]{2,3})|(aero|coop|info|museum|name))$/.test(emailVal))) {
						var claimInfo = {
							csrfmiddlewaretoken:csrfToken,
							id:postID,
							phone:phoneChecked ? phoneVal : '',
							email:emailChecked ? emailVal : '',
							note:''
						}
						if (noteVal != 'Leave an optional note') {
							claimInfo.note = noteVal;
						}
						console.log(claimInfo);
						$.post(rootUrl + 'claim', claimInfo, function(response) {
							response = jQuery.parseJSON(response);
							if (response.status == 'OK') {
								shouldReloadPage = true;
								$(post).removeClass('blue_border').revertFlip();
							} else {
								alert(response.error);
							}
						});
					}
				});
				initButtons();
			}
		});
	});
}

function getFlip(post, claim) {
	var flip = $(post).clone();
	$(flip).find('div.post_owner').remove();
	$(flip).find('div.post_action').remove();
	if (claim) {
		$(flip).find('div.post_content').remove();
		$(flip).find('div.post_icon').after($('div#post_claim div.post_title').clone());
		$('div#post_claim div.post_contact').clone().appendTo($(flip));
		$('div#post_claim div.post_control').clone().appendTo($(flip));
	} else {
		$(flip).find('div.post_icon').addClass('selected').after($('div#post_remove div.post_title').clone());
		$('div#post_remove div.post_control').clone().appendTo($(flip));
	}
	return flip;
}

function initPostContact(post) {
	var phoneBlank = true;
	var phoneDefault = 'Phone Number';
	var emailBlank = true;
	var emailDefault = 'Email';
	var noteBlank = true;
	var noteDefault = 'Leave an optional note';
	$(post).find('div.post_phone input[type=text]').focus(function() {
		if (phoneBlank) {
			$(this).val('');
		}
		$(post).find('div.post_phone input[type=checkbox]').attr('checked', true);
	}).blur(function() {
		if ($(this).val() == '') {
			phoneBlank = true;
			$(this).removeClass('on').removeClass('invalid');
			$(this).val(phoneDefault);
			$(post).find('div.post_phone input[type=checkbox]').removeAttr('checked');
		} else {
			phoneBlank = false;
			$(this).addClass('on');
			var phoneVal = $(this).val().replace(/[^\d.]/g, '');
			if (/^[0-9]{10}$/.test(phoneVal)) {
				$(this).removeClass('invalid');
			} else {
				$(this).addClass('invalid');
			}
		}
	});
	$(post).find('div.post_email input[type=text]').focus(function() {
		if (emailBlank) {
			$(this).val('');
		}
		$(post).find('div.post_email input[type=checkbox]').attr('checked', true);
	}).blur(function() {
		if ($(this).val() == '') {
			phoneBlank = true;
			$(this).removeClass('on').removeClass('invalid');
			$(this).val(emailDefault);
			$(post).find('div.post_email input[type=checkbox]').removeAttr('checked');
		} else {
			emailBlank = false;
			$(this).addClass('on');
			var emailVal = $(this).val();
			if (/^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.(([0-9]{1,3})|([a-zA-Z]{2,3})|(aero|coop|info|museum|name))$/.test(emailVal)) {
				$(this).removeClass('invalid');
			} else {
				$(this).addClass('invalid');
			}
		}
	});
	$(post).find('div.post_note input[type=text]').focus(function() {
		if (noteBlank) {
			$(this).val('');
		}
	}).blur(function() {
		if ($(this).val() == '') {
			noteBlank = true;
			$(this).removeClass('on');
			$(this).val(noteDefault);
		} else {
			wantBlank = false;
			$(this).addClass('on');
		}
	});
}
