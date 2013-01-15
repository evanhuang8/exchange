from django.http import HttpResponse
from django.shortcuts import render, redirect
from datetime import datetime
from exchange.libraries.helpers.url import UrlHelper
from exchange.libraries.helpers.hash import HashHelper
from exchange.libraries.post import PostManager
from exchange.libraries.search import SearchManager
from main.models import *
import facebook
import json
import re

import pdb

def index(request, page = 1):
	userID = request.session.get('id', False)
	user = None
	posts = []
	paging = []
	page = int(page)
	pageCount = PostManager.countPage()
	prevPage = max(1, page - 1)
	nextPage = min(max(pageCount, 1), page + 1)
	posts = PostManager.fetch(page)
	paging = PostManager.paging(page)
	if posts == None:
		return redirect('exchange-home')
	if userID:
		user = User.objects.get(id = userID)
		if user.profile.notification == '':
			return redirect('exchange-registration')
		else:
			msgCount = PostManager.uncheckMessageCount(user)
		return render(request, 'index.html', locals())
	else:
		return render(request, 'landing.html', locals())

def login(request):
	response = {
		'status':'FAIL',
		'error':'ACCESS_FORBIDDEN',
	}
	if request.method == 'GET' and request.GET is not None and not request.session.has_key('id'):
		urlHelper = UrlHelper()
		params = urlHelper.validate(request.GET, {'email', 'password'})
		if params == False:
			response = {
				'status':'FAIL',
				'error':'BAD_REQUEST'
			}
		else:
			hashHelper = HashHelper()
			user = User.objects.filter(email = params['email'], password = hashHelper.password(params['password']))
			if user.count() == 0:
				response = {
					'status':'FAIL',
					'error':'INCORRECT_COMBO'
				}
			else:
				user = user[0]
				request.session['id'] = user.id
				request.session['type'] = 'individual'
				response = {
					'status':'OK'
				}
	return HttpResponse(json.dumps(response))

def individualRegister(request):
	response = {
		'status':'FAIL',
		'error':'ACCESS_FORBIDDEN',
	}
	if request.method == 'GET' and request.GET is not None and not request.session.has_key('id'):
		urlHelper = UrlHelper()
		params = urlHelper.validate(request.GET, {'email', 'password', 'confirm'})
		if params == False:
			response = {
				'status':'FAIL',
				'error':'BAD_REQUEST'
			}
		elif params['password'] != params['confirm']:
			response = {
				'status':'FAIL',
				'error':'PASSWORDS_NOT_MATCH'
			}
		elif not (re.search(r'^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.(([0-9]{1,3})|([a-zA-Z]{2,3})|(aero|coop|info|museum|name))$', params['email']) and re.search(r'^[a-zA-Z0-9_]{6,20}$', params['password'])):
			response = {
				'status':'FAIL',
				'error':'ILLEGAL_EMAIL_OR_PASSWORD'
			}
		elif User.objects.filter(email = params['email']).count() > 0:
			response = {
				'status':'FAIL',
				'error':'EMAIL_EXISTS'
			}
		else:
			userProfile = User_profile(
				display_name = 'New BBoy'
			)
			userProfile.save()
			user = User(
				email = params['email'],
				password = params['password'],
				last_login = datetime.now(),
				profile = userProfile
			)
			user.save()
			request.session['id'] = user.id
			request.session['type'] = 'individual'
			response = {
				'status':'OK'
			}
	return HttpResponse(json.dumps(response))

def fbAuth(request):
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
				user = User.objects.filter(facebook__fbid = fbUserProfile['id'])
				if user.count() > 0:
					user = user[0]
					request.session['id'] = user.id
					request.session['type'] = 'individual'
					response = {
						'status':'OK'
					}
				else:
					userProfile = User_profile(
						display_name = fbUserProfile['name']
					)
					userProfile.save()
					fbProf = User_facebook(
						fbid = fbUserProfile['id'],
						access_token = params['accessToken']
					)
					fbProf.save()
					user = User(
						email = fbUserProfile['email'] if fbUserProfile.has_key('email') else None,
						last_login = datetime.now(),
						profile = userProfile,
						facebook = fbProf
					)
					user.save()
					request.session['id'] = user.id
					request.session['type'] = 'individual'
					response = {
						'status':'OK'
					}
	return HttpResponse(json.dumps(response))

def logout(request):
	for sessKey in request.session.keys():
		del request.session[sessKey]
	return redirect('exchange-home')

def registration(request):
	userID = request.session.get('id', False)
	if userID:
		user = User.objects.get(id = userID)
		if user.profile.notification == '':
			if request.POST:
				urlHelper = UrlHelper()
				params = urlHelper.validate(request.POST, {'notify_type', 'notify_value'})
				if params != False and (params['notify_type'] != 'text' or re.search(r'^[0-9]{10}$', params['notify_value'])) and (params['notify_type'] != 'email' or re.search(r'^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.(([0-9]{1,3})|([a-zA-Z]{2,3})|(aero|coop|info|museum|name))$', params['notify_value'])):					
					if params['notify_type'] == 'T':
						user.profile.notification = 'T'
						user.profile.phone = params['notify_value']
					elif params['notify_type'] == 'M':
						user.profile.notification = 'M'
						user.email = params['notify_value']
					else:
						user.profile.notification = 'N'
					user.profile.save()
					user.save()
			else:
				return render(request, 'registration.html', locals())
	return redirect('exchange-home')

def dashboard(request):
	userID = request.session.get('id', False)
	if userID:
		user = User.objects.get(id = userID)
		if user.profile.notification == '':
			return redirect('exchange-registration')
		bullets = PostManager.fetchBulletin(user)
		msgCount = PostManager.uncheckMessageCount(user)
	return render(request, 'dashboard.html', locals())

def search(request):
	userID = request.session.get('id', False)
	if userID:
		user = User.objects.get(id = userID)
		if user.profile.notification == '':
			return redirect('exchange-registration')
		else:
			msgCount = PostManager.uncheckMessageCount(user)
		if request.GET:
			urlHelper = UrlHelper()
			params = urlHelper.validate(request.GET, {'q'}, {'p'})
			if params and params['q'] != '':
				page = 0
				if params['p']:
					page = int(params['p'])
				query = params['q']
				results = SearchManager.offerResults(query, user)
				return render(request, 'search.html', locals())
	return redirect('exchange-home')
