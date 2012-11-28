from django import template
from main.models import *

register = template.Library()

@register.filter
def offer(post):
	offerVal = ''
	try:
		offerVal = post.post_money.offer
	except Exception:
		offerVal = post.post_other.offer
	return offerVal

@register.filter
def isMoneyPost(post):
	try:
		moneyPost = post.post_money
	except Exception:
		return False
	else:
		return True

@register.filter
def isPostOwner(user, post):
	return post.owner.fb_id == user.fb_id
