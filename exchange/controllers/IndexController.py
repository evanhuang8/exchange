from django.http import HttpResponse
from django.shortcuts import render, redirect
from main.models import *

def index(request):
	userFbID = request.session.get('userFbID', False)
	posts = [1]
	return render(request, 'index.html', locals())
