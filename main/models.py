from django.db import models

class User(models.Model):

	fb_id = models.CharField(max_length = 30, unique = True)
	access_token = models.CharField(max_length = 160)
	active = models.BooleanField(default = True)
	created_time = models.DateTimeField(auto_now_add = True)

class Post(models.Model):
	
	owner = models.ForeignKey('User')
	claimer = models.ForeignKey('User', null = True, blank = True)
	want = models.CharField(max_length = 150)
	approved = models.BooleanField()
	created_time = models.DateTimeField(auto_now_add = True)
	claimed_time = models.DateTimeField(null = True, blank = True)

	class Meta:
		abstract = True

class Post_money(Post):
	
	offer = models.FloatField()
	
class Post_other(Post):

	offer = models.CharField(max_length = 150)
	
class Message(models.Model):
	
	email = models.CharField(max_length = 50)
	note = models.CharField(max_length = 50)

	class Meta:
		abstract = True

class Message_money(Message):

	about = models.ForeignKey('Post_money')

class Message_other(Message):

	about = models.ForeignKey('Post_other')
	
