$(document).ready(function() {
	fbLoginDispatch();
	initButtons();
	initPostForm();
	initSearch();
});

function fbLoginDispatch() {
	$('div#wrapper_login a').click(function() {
		var fbPermissions = '';
		FB.login(function(response) {
			if (response.authResponse) {
				var fbAccessToken = response.authResponse.accessToken;
				console.log(fbAccessToken);
				$.post(rootUrl + 'login', {accessToken:fbAccessToken, csrfmiddlewaretoken:csrfToken}, function(fbAuthResponse) {
					console.log(fbAuthResponse);
					fbAuthResponse = jQuery.parseJSON(fbAuthResponse);
					if (fbAuthResponse.status == 'OK') {
						document.location.reload(true);
					} else {
						alert('FAIL: ' + fbAuthResponse.error);
					}
				});
			}
		}, {scope:fbPermissions});
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
					loadPage(pageNumber, userID, true);
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
	$('div#wrapper_listing div.post.owner div.post_action a:not(.tan)').unbind().click(function() {
		var post = $(this).parent().parent();
		var actionForm = getFlip(post, false);
		$(post).flip({
			direction:'rl',
			speed:200,
			content:actionForm,
			onEnd:function() {
				$(post).removeAttr('style').addClass('red_border');
				$(post).find('div.post_cancel a').click(function() {
					$(post).removeClass('red_border').revertFlip();
				});
				$(post).find('div.post_confirm a').click(function() {
					var postID = $(post).find('span.id').html();
					$.post(rootUrl + 'delete', {csrfmiddlewaretoken:csrfToken, id:postID}, function(response) {
						response = jQuery.parseJSON(response);
						if (response.status == 'OK') {
							loadPage(pageNumber, userID, true);
						} else {
							alert(response.error);
						}
					});
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

function initPostForm() {
	var wantBlank = true;
	var wantDefault = 'an intro to psych textbook';
	var moneyBlank = true;
	var moneyDefault = '40.00';
	var otherBlank = true;
	var otherDefault = 'a ride to the airport';
	$('div#want_input input').focus(function() {
		if (wantBlank) {
			$(this).val('');
		}
	}).blur(function() {
		if ($(this).val() == '') {
			wantBlank = true;
			$(this).removeClass('on');
			$(this).val(wantDefault);
		} else {
			wantBlank = false;
			$(this).addClass('on');
		}
	});
	$('div#offer_input_money input').focus(function() {
		$('div#control_radios input[value=other]').removeAttr('checked');
		$('div#control_radios input[value=money]').attr('checked', true);
		$('div#offer_input_other input').removeClass('on').removeClass('invalid');
		if (moneyBlank) {
			$(this).val('');
		}
	}).blur(function() {
		if ($(this).val() == '') {
			moneyBlank = true;
			$(this).removeClass('on').removeClass('invalid');
			$(this).val(moneyDefault);
			if (!otherBlank) {
				$('div#control_radios input[value=money]').removeAttr('checked');
				$('div#control_radios input[value=other]').attr('checked', true);
				$('div#offer_input_other input').trigger('blur').trigger('keyup');
			}
		} else {
			moneyBlank = false;
			$(this).addClass('on');
		}
	}).keyup(function() {
		if (!isNumber($(this).val())) {
			$(this).addClass('invalid');
		} else {
			$(this).removeClass('invalid');
		}
	});
	$('div#offer_input_other input').focus(function() {
		$('div#control_radios input[value=money]').removeAttr('checked');
		$('div#control_radios input[value=other]').attr('checked', true);
		$('div#offer_input_money input').removeClass('on').removeClass('invalid');
		if (otherBlank) {
			$(this).val('');
		}
	}).blur(function() {
		if ($(this).val() == '') {
			otherBlank = true;
			$(this).removeClass('on').removeClass('invalid');
			$(this).val(otherDefault);
			if (!moneyBlank) {
				$('div#control_radios input[value=other]').removeAttr('checked');
				$('div#control_radios input[value=money]').attr('checked', true);
				$('div#offer_input_money input').trigger('blur').trigger('keyup');
			}
		} else {
			otherBlank = false;
			$(this).addClass('on');
		}
	}).keyup(function() {
		if ($(this).val().length > 0 && $(this).val().length < 50) {
			$(this).removeClass('invalid');
		} else {
			$(this).addClass('invalid');
		}
	});
	$('div#control_submit a').click(function() {
		var wantVal = $('div#want_input input').val();
		var typeVal = $('div#control_radios input[name=offer]:checked').val();
		var offerVal = $('div#offer_input_money input').val();
		if (typeVal == 'other') {
			offerVal = $('div#offer_input_other input').val();
		}
		if (((typeVal == 'money' && !moneyBlank && isNumber(offerVal)) || (typeVal == 'other' && !otherBlank && offerVal.length > 0)) && !wantBlank) {
			var postInfo = 'csrfmiddlewaretoken=' + csrfToken;
			postInfo += '&type=' + typeVal;
			postInfo += '&want=' + encodeURIComponent(wantVal);
			postInfo += '&offer=' + encodeURIComponent(offerVal);
			$.post(rootUrl + 'post', postInfo, function(response) {
				response = jQuery.parseJSON(response);
				if (response.status == 'OK') {
					clearPostForm();
					loadPage(1, userID, true);
				} else {
					alert(response.error);
				}
			});
		}
	});
}

function clearPostForm() {
	$('div#want_input input').val('').trigger('blur');
	$('div#offer_input_money input').val('').trigger('blur');
	$('div#offer_input_other input').val('').trigger('blur');
	$('div#control_radios input[value=other]').removeAttr('checked');
	$('div#control_radios input[value=money]').attr('checked', true);
}

function insertPost(post, owner, user) {
	var target = $('div#post_frame').clone();
	$(target).removeAttr('id');
	if (owner) {
		$(target).addClass('owner');
	}
	$(target).find('span.id').html(post.id);
	$(target).find('span.type').html(post.type);
	$(target).find('div.post_icon').addClass(post.type);
	$(target).find('div.post_owner_name').html(shortenName(post.owner.name));
	if (post.owner.fbid != undefined) {
		$(target).find('div.post_owner_profile img').attr('src', 'https://graph.facebook.com/' + post.owner.fbid + '/picture');
	} else {
		$(target).find('div.post_owner_profile img').attr('src', rootUrl + 'static/images/default.jpg');
	}
	$(target).find('span.want').html(post.want);
	$(target).find('span.offer').html(post.offer);
	if (post.type == 'money') {
		$(target).find('span.offer').before('$');
	}
	var actionClass = 'blue';
	var actionText = 'Do it.';
	if (owner) {
		actionClass = 'red';
		actionText = 'Remove Post';
	}
	if (!user) {
		actionClass = 'tan';
		actionText = 'Do it.';
	}
	$(target).find('div.post_action a').addClass(actionClass).html(actionText);
	$(target).prependTo($('div#wrapper_listing'));
} 

function loadPage(page, owner_id, user) {
	if (page > 0) {
		$.get(rootUrl + 'page/' + page, function(response) {
			response = jQuery.parseJSON(response);
			if (response.status == 'OK') {
				$('div#wrapper_listing').animate({opacity:0}, 300, function() {
					$(this).children().remove();
					for (var i = response.posts.length - 1;i >= 0;i--) {
						var p = response.posts[i];
						insertPost(p, p.owner.id == owner_id, user);
					}
					$(this).append($('<div class="clear"></div>'));
					$(this).animate({opacity:1}, 300, function() {
						initButtons();
					});
				});
				initPaging(response.paging, response.previous_page, response.next_page);
			} else {
				if (pageNumber == 1) {
					$('div#wrapper_listing').animate({opacity:0}, 300, function() {
						$(this).children().remove();
						$('div#wrapper_paging').remove();
						$('<div id="listing_blank"></div>').appendTo($(this));
						$('<div class="clear"></div>').appendTo($(this));
						initPaging([1], 1, 1);
						$(this).animate({opacity:1}, 300, function() {});
					});
				} else {
					pageNumber--;
					loadPage(pageNumber, owner_id, user);
				}
			}
		});
	}
}

function initPaging(paging, prevPage, nextPage) {
	if (prevPage == pageNumber) {
		$('div#paging_prev').addClass('hidden');
	} else {
		$('div#paging_prev').removeClass('hidden');
		$('div#paging_prev a').attr('href', rootUrl + prevPage);
	}
	if (nextPage == pageNumber) {
		$('div#paging_next').addClass('hidden');
	} else {
		$('div#paging_next').removeClass('hidden');
		$('div#paging_next a').attr('href', rootUrl + nextPage);
	}
	$('div#paging_list ul').children().remove();
	for (var i = 0;i < paging.length;i++) {
		var p = $('<li class="on">' + paging[i] + '</li>');
		if (paging[i] != pageNumber) {
			p = $('<li><a href="' + rootUrl + paging[i] + '">' + paging[i] + '</a></li>');
		}
		$('div#paging_list ul').append(p);
	}
	$('div#paging_list ul').append('<li class="clear"></li>');
}

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
