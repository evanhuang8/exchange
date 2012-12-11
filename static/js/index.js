$(document).ready(function() {
	fbLoginDispatch();
	initButtons();
	initPostForm();
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
				$(post).removeAttr('style').addClass('blue_border');
				$(post).find('div.post_cancel a').click(function() {
					$(post).removeClass('blue_border').revertFlip();
				});
				$(post).find('div.post_confirm a').click(function() {

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

function initPostForm() {
	var wantBlank = true;
	var wantDefault = 'a ride to the airport';
	var moneyBlank = true;
	var moneyDefault = '5.00';
	var otherBlank = true;
	var otherDefault = 'a vintage necklace';
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
					loadPage(1, userFbID, true);
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
	$(target).find('div.post_owner_profile img').attr('src', 'https://graph.facebook.com/' + post.owner.fb_id + '/picture');
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

function loadPage(page, owner_fb_id, user) {
	if (page > 0) {
		$.get(rootUrl + 'page/' + page, function(response) {
			response = jQuery.parseJSON(response);
			if (response.status == 'OK') {
				$('div#wrapper_listing').animate({opacity:0}, 300, function() {
					$(this).children().remove();
					for (var i = response.posts.length - 1;i >= 0;i--) {
						var p = response.posts[i];
						insertPost(p, p.owner.fb_id == owner_fb_id, user);
					}
					$(this).append($('<div class="clear"></div>'));
					$(this).animate({opacity:1}, 300, function() {
						initButtons();
					});
				});
				initPaging(response);
			} else {
				if (pageNumber == 1) {
					$('div#wrapper_listing').animate({opacity:0}, 300, function() {
						$(this).children().remove();
						$('div#wrapper_paging').remove();
						$('<div id="listing_blank">No active posts at this point. Be the first one to post!</div>').appendTo($(this));
						$('<div class="clear"></div>').appendTo($(this));
						$(this).animate({opacity:1}, 300, function() {});
					});
				} else {
					pageNumber--;
					loadPage(pageNumber, owner_fb_id);
				}
			}
		});
	}
}

function initPaging(pageInfo) {
	console.log(pageInfo);
}
