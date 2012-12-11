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
		$(flip).find('div.post_icon').after($('div#post_remove div.post_title').clone());
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
}

function initButtonBehavior() {
	$('div.post_claim a.button.red').unbind().click(function() {
		var post = $(this).parent().parent().parent();
		var postID = $(post).find('span.id').html();
		var boxContent = $('div#colorbox_hidden div.colorbox_remove_frame').clone();
		$(boxContent).removeClass('hidden');
		$.colorbox({
			open:false,
			top:'20%',
			fixed:true,
			html:boxContent,
			onLoad:function() {
				$('#cboxClose').remove();
				$(boxContent).find('a.red').click(function() {
					$.post(rootUrl + 'delete', {csrfmiddlewaretoken:csrfToken, id:postID}, function(response) {
						response = jQuery.parseJSON(response);
						if (response.status == 'OK') {
							$.colorbox.close();
							loadPage(pageNumber, userFbID);
						} else {
							alert(response.error);
						}
					});
				});
				$(boxContent).find('a.grey').click(function() {
					$.colorbox.close();
				});
			}
		});
	});
	$('div.post_claim a.button.green').unbind().click(function() {
		var post = $(this).parent().parent().parent();
		var postID = $(post).find('span.id').html();
		var boxContent = $('div#colorbox_hidden div.colorbox_claim_frame').clone();
		$(boxContent).removeClass('hidden');
		$.colorbox({
			open:false,
			top:'20%',
			fixed:true,
			html:boxContent,
			onLoad:function() {
				$('#cboxClose').remove();
				$(boxContent).find('a.red').click(function() {
					var phoneVal = $(boxContent).find('input[name=number]').val();
					var emailVal = $(boxContent).find('input[name=email]').val();
					var noteVal = $(boxContent).find('input[name=note]').val();
					var claimDetails = 'csrfmiddlewaretoken=' + csrfToken + '&phone=' + encodeURIComponent(phoneVal) + '&email=' + encodeURIComponent(emailVal) + '&note=' + encodeURIComponent(noteVal) + '&id=' + postID;
					console.log(claimDetails);
					$.post(rootUrl + 'claim', claimDetails, function(response) {
						response = jQuery.parseJSON(response);
						if (response.status == 'OK') {
							$.colorbox.close();
						} else {
							console.log(response.error);
						}
					});
				});
				$(boxContent).find('a.grey').click(function() {
					$.colorbox.close();
				});
			}
		});
	});
}

function loadPage(page, owner_fb_id) {
	if (page > 0) {
		$.get(rootUrl + 'page/' + page, function(response) {
			response = jQuery.parseJSON(response);
			if (response.status == 'OK') {
				initPaging(response.paging, response.previous_page, response.next_page);
				$('div#listing_posts').animate({opacity:0}, 300, function() {
					$(this).children().remove();
					for (var i = response.posts.length - 1;i >= 0;i--) {
						var p = response.posts[i];
						insertPost(p, p.owner.fb_id == owner_fb_id, false);
					}
					$(this).append($('<div class="clear"></div>'));
					$(this).animate({opacity:1}, 300, function() {
						initButtonBehavior();
					});
				});
			} else {
				if (pageNumber == 1) {
					$('div#listing_posts').animate({opacity:0}, 300, function() {
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

function initPaging(paging, prevPage, nextPage) {
	$('div#wrapper_paging').animate({opacity:0}, 300, function() {
		$(this).children().remove();
		var pagingHtml = '<span><a href="' + rootUrl + prevPage + '">&lt;</a></span>&nbsp;';
		for (var i = 0;i < paging.length;i++) {
			pagingHtml += '<span>';
			if (paging[i] == pageNumber) {
				pagingHtml += paging[i];
			} else {
				pagingHtml += '<a href="' + rootUrl + paging[i] + '">' + paging[i] + '</a>';
			}
			pagingHtml += '</span>&nbsp;';
		}
		pagingHtml += '<span><a href="' + rootUrl + nextPage + '">&gt;</a></span>';
		$(this).html(pagingHtml);
		$(this).animate({opacity:1}, 300, function() {
		});
	});
}
