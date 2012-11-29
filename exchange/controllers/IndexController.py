from django.http import HttpResponse
from django.shortcuts import render, redirect
from exchange.libraries.helpers.url import UrlHelper
from exchange.libraries.post import PostManager
from main.models import *
import facebook
import json

import pdb

def index(request):
	userFbID = request.session.get('userFbID', False)
	user = None
	posts = []
	if userFbID:
		user = User.objects.get(fb_id = userFbID)
		posts = PostManager.fetch()
	return render(request, 'index.html', locals())

def login(request):
	response = {
		'status':'FAIL',
		'error':'ACCESS_FORBIDDEN'
	}
	if request.POST:
		urlHelper = UrlHelper()
		params = urlHelper.validate(request.POST, {'accessToken'})
		if params == False:
			response = {
				'status':'FAIL',
				'error':'BAD_REQUEST'
			}
		else:
			fb = facebook.GraphAPI(params['accessToken'])
			try:
				fbUserProfile = fb.get_object('me')
			except facebook.GraphAPIError as graphError:
				response = {
					'status':'FAIL',
					'error':'INVALID_OAUTH_TOKEN'
				}
			else:
				user = User.objects.filter(fb_id = fbUserProfile['id'])
				if user.count() > 0:
					user = user[0]
					request.session['userFbID'] = user.fb_id
					response = {
						'status':'OK'
					}
				else:
					response = {
						'status':'FAIL',
						'error':'NOT_WASHU'
					}
					if fbUserProfile.has_key('education'):
						isWashU = False
						for edu in fbUserProfile['education']:
							if edu['school']['id'] == '112795212068138':
								isWashU = True
						if isWashU:
							user = User(
								fb_id = fbUserProfile['id'],
								access_token = params['accessToken'],
								name = fbUserProfile['name'],
								email = '',
							)
							user.save()
							request.session['userFbID'] = user.fb_id
							response = {
								'status':'OK'
							}
	return HttpResponse(json.dumps(response))

def logout(request):
	for sessKey in request.session.keys():
		del request.session[sessKey]
	return redirect('exchange-home')

def post(request):
	response = {
		'status':'FAIL',
		'error':'ACCESS_FORBIDDEN'
	}
	userFbID = request.session.get('userFbID', False)
	if request.POST and userFbID:
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
			user = User.objects.get(fb_id = userFbID)
			post = None
			if params['type'] == 'money':
				post = Post_money(
					owner = user,
					want = params['want'],
					offer = float(params['offer'])
				)
				post.save()
			elif params['type'] == 'other':
				post = Post_other(
					owner = user,
					want = params['want'],
					offer = params['offer']
				)
				post.save()
			response = {
				'status':'OK',
				'post':{
					'id':post.id,
					'owner':{
						'fb_id':post.owner.fb_id,
						'name':post.owner.name
					},
					'want':post.want,
					'offer':params['offer'],
					'created_time':post.created_time.strftime('%Y-%m-%d %X')
				}
			}
	return HttpResponse(json.dumps(response))
