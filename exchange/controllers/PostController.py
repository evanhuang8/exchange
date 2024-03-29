from django.http import HttpResponse
from django.shortcuts import render, redirect
from exchange.libraries.helpers.url import UrlHelper
from exchange.libraries.post import PostManager
from exchange.libraries.notification import *
from main.models import *
from datetime import datetime
import facebook
import json
import re

import pdb

def page(request, page = 1):
	response = {
		'status':'FAIL',
		'error':'ACCESS_FORBIDDEN'
	}
	userID = request.session.get('id', False)
	user = None
	posts = []
	paging = []
	if userID:
		user = User.objects.get(id = userID)
		page = int(page)
		pageCount = PostManager.countPage(user.parent_community)
		prevPage = max(1, page - 1)
		nextPage = min(pageCount, page + 1)
		paging = PostManager.paging(page, user.parent_community)
		posts = PostManager.fetch(page, user.parent_community, serialized = True)
		if posts == None or len(posts) == 0:
			response = {
				'status':'FAIL',
				'error':'NO_RECORD'
			}
		else:
			response = {
				'status':'OK',
				'posts':posts,
				'page_count':pageCount,
				'paging':paging,
				'previous_page':prevPage,
				'next_page':nextPage
			}
	return HttpResponse(json.dumps(response))

def post(request):
	response = {
		'status':'FAIL',
		'error':'ACCESS_FORBIDDEN'
	}
	userID = request.session.get('id', False)
	if request.POST and userID:
		urlHelper = UrlHelper()
		params = urlHelper.validate(request.POST, {'want', 'offer', 'type'})
		if params == False:
			response = {
				'status':'FAIL',
				'error':'BAD_REQUEST'
			}
		elif len(params['want']) > 150 or params['want'] == '' or not ((params['type'] == 'money' and params['offer'] != '' and float(params['offer']) > 0) or (params['type'] == 'other' and len(params['offer']) <= 150 and params['offer'] != '')):
			response = {
				'status':'FAIL',
				'error':'FORMAT_INCORRECT'
			}
		else:
			user = User.objects.get(id = userID)
			post = None
			if params['type'] == 'money':
				post = Post_money(
					owner = user,
					want = params['want'],
					offer = float(params['offer']),
					community = user.parent_community
				)
				post.save()
			elif params['type'] == 'other':
				post = Post_other(
					owner = user,
					want = params['want'],
					offer = params['offer'],
					community = user.parent_community
				)
				post.save()
			response = {
				'status':'OK',
				'post':{
					'id':post.id,
					'type':params['type'],
					'owner':{
						'id':post.owner.id,
						'name':post.owner.profile.display_name
					},
					'want':post.want,
					'offer':params['offer'],
					'created_time':post.created_time.strftime('%Y-%m-%d %X')
				}
			}
	return HttpResponse(json.dumps(response))

def delete(request):
	response = {
		'status':'FAIL',
		'error':'ACCESS_FORBIDDEN'
	}
	userID = request.session.get('id', False)
	if request.POST and userID:
		urlHelper = UrlHelper()
		params = urlHelper.validate(request.POST, {'id'})
		user = User.objects.get(id = userID)
		if params == False:
			response = {
				'status':'FAIL',
				'error':'BAD_REQUEST'
			}
		else:
			post = Post.objects.get(id = params['id'], claimer = None, owner = user)
			if post:
				post.delete()
				response = {
					'status':'OK'
				}
			else:
				response = {
					'status':'FAIL',
					'error':'INVALID_POST'
				}
	return HttpResponse(json.dumps(response))

def claim(request):
	response = {
		'status':'FAIL',
		'error':'ACCESS_FORBIDDEN'
	}
	userID = request.session.get('id', False)
	if request.REQUEST and userID:
		urlHelper = UrlHelper()
		params = urlHelper.validate(request.REQUEST, {'id', 'phone', 'email', 'note'})
		if params == False:
			response = {
				'status':'FAIL',
				'error':'BAD_REQUEST'
			}
		else:
			user = User.objects.get(id = userID)
			post = Post.objects.filter(id = params['id'], claimer = None, community = user.parent_community)
			if post.count() > 0 and post[0].owner.id != user.id:
				post = post[0]
				postType = PostManager.postType(post)
				message = None
				if postType == Post_money:
					message = Message_money(
						to = post.owner,
						email = '',
						text = '',
						note = params['note'],
						about = post.post_money
					)
				else:
					message = Message_other(
						to = post.owner,
						email = '',
						text = '',
						note = params['note'],
						about = post.post_other
					)
				contact = False
				if re.search(r'^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.(([0-9]{1,3})|([a-zA-Z]{2,3})|(aero|coop|info|museum|name))$', params['email']):
					message.email = params['email']
					contact = True
				if re.search(r'^[0-9]{10}$', params['phone']):
					message.text = params['phone']
					contact = True
				if contact:
					post.claimer = user
					post.claimed_time = datetime.now() 
					post.save()
					message.save()
					response = {
						'status':'OK'
					}
				else:
					response = {
						'status':'FAIL',
						'error':'INVALID_CONTACT_INFO'
					}
			else:
				response = {
					'status':'FAIL',
					'error':'INVALID_POST'
				}
	return HttpResponse(json.dumps(response))

def check(request):
	response = {
		'status':'FAIL',
		'error':'ACCESS_FORBIDDEN'
	}
	userID = request.session.get('id', False)
	if request.POST and userID:
		urlHelper = UrlHelper()
		params = urlHelper.validate(request.POST, {'id', 'type'})
		if params == False or (params['type'] != 'money' and params['type'] != 'other'):
			response = {
				'status':'FAIL',
				'error':'BAD_REQUEST'
			}
		else:
			user = User.objects.get(id = userID)
			message = None
			if params['type'] == 'money':
				message = Message_money.objects.get(id = params['id'])
			else:
				message = Message_other.objects.get(id = params['id'])
			message.checked = True
			message.save()
	return HttpResponse(json.dumps(response))

def respond(request):
	response = {
		'status':'FAIL',
		'error':'ACCESS_FORBIDDEN'
	}
	userID = request.session.get('id', False)
	if request.POST and userID:
		urlHelper = UrlHelper()
		params = urlHelper.validate(request.POST, {'id', 'type', 'action'})
		if params == False or (params['action'] != 'accept' and params['action'] != 'decline') or (params['type'] != 'money' and params['type'] != 'other'):
			response = {
				'status':'FAIL',
				'error':'BAD_REQUEST'
			}
		else:
			user = User.objects.get(id = userID)
			message = None
			if params['type'] == 'money':
				message = Message_money.objects.get(id = params['id'])
			else:
				message = Message_other.objects.get(id = params['id'])
			if params['action'] == 'accept':
				message.about.approved = True
				message.about.save()
				message.approved = True
				message.checked = True
				message.save()
				response = {
					'status':'OK'
				}
				if message.text != '':
					response['phone'] = message.text
				if message.email != '':
					response['email'] = message.email
			else:
				message.about.claimer = None
				message.about.save()
				message.approved = False
				message.checked = True
				message.save()
				response = {
					'status':'OK'
				}
	return HttpResponse(json.dumps(response))
