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
