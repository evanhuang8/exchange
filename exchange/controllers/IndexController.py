from django.http import HttpResponse
from django.shortcuts import render, redirect
from exchange.libraries.helpers.url import UrlHelper
from main.models import *
import facebook
import json

def index(request):
	userFbID = request.session.get('userFbID', False)
	posts = [1]
	return render(request, 'index.html', locals())

def login(request):
	response = {
		'status':'FAIL',
		'error':'ACCESS_FORBIDDEN'
	}
	if request.GET:
		urlHelper = UrlHelper()
		params = urlHelper.validate(request.GET, {'accessToken'})
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
							request.session['userFbID'] = user.fb_id
							response = {
								'status':'OK'
							}
	return HttpResponse(json.dumps(response))

def logout(request):
	for sessKey in request.session.keys():
		del request.session[sessKey]
	return redirect('exchange-home')
