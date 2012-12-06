$(document).ready(function() {
	initButtonBehavior();
});

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
