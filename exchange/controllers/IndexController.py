from django.http import HttpResponse
from django.shortcuts import render, redirect
from main.models import *

def index(request):
	userFbID = True
	posts = [1]
	return render(request, 'index.html', locals())
