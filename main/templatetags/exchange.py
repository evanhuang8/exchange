from django import template
from main.models import *

register = template.Library()

@register.filter
def isEmpty(collection):
	return len(collection) == 0

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
	return post.owner.fb_id == user.fb_id and user

@register.filter
def shortenName(name):
	sName = name
	parts = name.split(' ')
	if len(parts) > 1:
		sName = parts[0] + ' ' + parts[len(parts) - 1][:1] + '.'
	return sName
