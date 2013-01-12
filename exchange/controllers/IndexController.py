from django.http import HttpResponse
from django.shortcuts import render, redirect
from exchange.libraries.helpers.url import UrlHelper
from exchange.libraries.post import PostManager
from exchange.libraries.search import SearchManager
from main.models import *
import facebook
import json
import re

import pdb

def index(request, page = 1):
	userFbID = request.session.get('userFbID', False)
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
	if userFbID:
		user = User.objects.get(fb_id = userFbID)
		if user.notification == '':
			return redirect('exchange-registration')
		else:
			msgCount = PostManager.uncheckMessageCount(user)
		return render(request, 'index.html', locals())
	else:
		return render(request, 'landing.html', locals())

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
					#if fbUserProfile.has_key('education'):
					if True:
						isWashU = True
						#isWashU = False
						#for edu in fbUserProfile['education']:
						#	if edu['school']['id'] == '112795212068138':
						#		isWashU = True
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

def registration(request):
	userFbID = request.session.get('userFbID', False)
	if userFbID:
		user = User.objects.get(fb_id = userFbID)
		if user.notification == '':
			if request.POST:
				urlHelper = UrlHelper()
				params = urlHelper.validate(request.POST, {'notify_type', 'notify_value'})
				if params != False and (params['notify_type'] != 'text' or re.search(r'^[0-9]{10}$', params['notify_value'])) and (params['notify_type'] != 'email' or re.search(r'^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.(([0-9]{1,3})|([a-zA-Z]{2,3})|(aero|coop|info|museum|name))$', params['notify_value'])):
					if params['notify_type'] == 'T':
						user.notification = 'T'
						user.phone = params['notify_value']
					elif params['notify_type'] == 'M':
						user.notification = 'M'
						user.email = params['notify_value']
					else:
						user.notification = 'N'
					user.save()
			else:
				return render(request, 'registration.html', locals())
	return redirect('exchange-home')

def dashboard(request):
	userFbID = request.session.get('userFbID', False)
	if userFbID:
		user = User.objects.get(fb_id = userFbID)
		if user.notification == '':
			return redirect('exchange-registration')
		bullets = PostManager.fetchBulletin(user)
		msgCount = PostManager.uncheckMessageCount(user)
	return render(request, 'dashboard.html', locals())

def search(request):
	userFbID = request.session.get('userFbID', False)
	if userFbID:
		user = User.objects.get(fb_id = userFbID)
		if user.notification == '':
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
