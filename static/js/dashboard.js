$(document).ready(function() {
	$('div.bullet_control a').click(function() {
		var bulletInner = $(this).parent().parent().parent();
		var bullet = $(bulletInner).parent();
		var toH = 100;
		if ($(bullet).hasClass('off')) {
			if ($(bullet).hasClass('swap')) {
				toH = 200; // Bullet without a note
				if (bullet.find('div.bullet_note').length != 0) {
					toH = 261; // Bullet with a note
				}
			} else {
				toH = 160;
			}
		} else {
			if (!$(bullet).hasClass('swap')) {
				toH = 47;
			}
		}
		$(bullet).animate({height:toH + 'px'}, 300, function() {});
		$(bulletInner).animate({height:toH + 'px'}, 300, function() {
			if ($(bullet).hasClass('off')) {
				$(bullet).removeClass('off');
				if ($(bullet).hasClass('swap')) {
					$(bullet).addClass('blue_border');
				} else {
					$(bullet).addClass('red_border');
				}
			} else {
				$(bullet).addClass('off');
				if ($(bullet).hasClass('swap')) {
					$(bullet).removeClass('blue_border');
				} else {
					$(bullet).removeClass('red_border');
				}
			}
		});
	});
	$('div.bullet_accept a').click(function() {
		var bullet = $(this).parent().parent().parent().parent();
		var msgID = $(bullet).find('span.id').html();
		var msgType = $(bullet).find('span.type').html();
		$.post(rootUrl + 'respond', {csrfmiddlewaretoken:csrfToken, id:msgID, type:msgType, action:'accept'}, function(response) {
			response = jQuery.parseJSON(response);
			if (response.status == 'OK') {
				
			} else {
				alert(response.error);
			}
		});
	});
	$('div.bullet_decline a').click(function() {
		var bullet = $(this).parent().parent().parent().parent();
		var msgID = $(bullet).find('span.id').html();
		var msgType = $(bullet).find('span.type').html();
		$.post(rootUrl + 'respond', {csrfmiddlewaretoken:csrfToken, id:msgID, type:msgType, action:'decline'}, function(response) {
			response = jQuery.parseJSON(response);
			if (response.status == 'OK') {
				$(bullet).animate({height:0}, 300, function() {
					$(bullet).remove();
				});
			} else {
				alert(response.error);
			}
		});
	});
	$('div.bullet_cancel a').click(function() {
		var bullet = $(this).parent().parent().parent().parent();
		$(bullet).find('div.bullet_control a').trigger('click');
	});
	$('div.bullet_delete a').click(function() {
		var bullet = $(this).parent().parent().parent().parent();
		var postID = $(bullet).find('span.id').html();
		$.post(rootUrl + 'delete', {csrfmiddlewaretoken:csrfToken, id:postID}, function(response) {
			response = jQuery.parseJSON(response);
			if (response.status == 'OK') {
				$(bullet).animate({height:0}, 300, function() {
					$(bullet).remove();
				});
			} else {
				alert(response.error);
			}
		});
	});
});
