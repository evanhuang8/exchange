from django.http import HttpResponse
from django.shortcuts import render, redirect
from exchange.libraries.helpers.url import UrlHelper
from exchange.libraries.post import PostManager
from main.models import *
import facebook
import json
import re

import pdb

def page(request, page = 1):
	posts = []
	paging = []
	page = int(page)
	pageCount = PostManager.countPage()
	prevPage = page - 1 if page - 1 >= 1 else 1
	nextPage = page + 1 if page + 1 <= pageCount else pageCount
	paging = PostManager.paging(page)
	posts = PostManager.fetch(page = page, serialized = True)
	response = {
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
					'type':params['type'],
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

def delete(request):
	response = {
		'status':'FAIL',
		'error':'ACCESS_FORBIDDEN'
	}
	userFbID = request.session.get('userFbID', False)
	if request.POST and userFbID:
		urlHelper = UrlHelper()
		params = urlHelper.validate(request.POST, {'id'})
		if params == False:
			response = {
				'status':'FAIL',
				'error':'BAD_REQUEST'
			}
		else:
			post = Post.objects.get(id = params['id'], claimer = None)
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
