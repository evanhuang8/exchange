from django.db import models

class User(models.Model):
	
	email = models.CharField(max_length = 30, unique = True, null = True, default = None)
	password = models.CharField(max_length = 128, null = True, default = None)
	active = models.BooleanField(default = True)
	last_login = models.DateTimeField()
	created_time = models.DateTimeField(auto_now_add = True)
	parent_community = models.ForeignKey('Community', null = True, default = None)
	profile = models.OneToOneField('User_profile')
	facebook = models.OneToOneField('User_facebook', null = True)

	def save(self, *args, **kwargs):
		if self.password is not None and len(self.password) != 128:
			import hashlib
			self.password = hashlib.sha512(self.password).hexdigest()
		super(User, self).save(*args, **kwargs)

class User_profile(models.Model):

	display_name = models.CharField(max_length = 50)
	phone = models.CharField(max_length = 10, null = True, default = None)
	NOTIFICATION_OPTIONS = (
		('M', 'Email'),
		('T', 'Text'),
		('N', 'None'),
	)
	notification = models.CharField(max_length = 1, choices = NOTIFICATION_OPTIONS)

class User_facebook(models.Model):

	fbid = models.CharField(max_length = 30, unique = True)
	access_token = models.CharField(max_length = 160)

class Community(models.Model):

	name = models.CharField(max_length = 50)
	description = models.CharField(max_length = 200)
	latitude = models.FloatField(null = True, default = None)
	longitude = models.FloatField(null = True, default = None)
	alias = models.CharField(max_length = 20, unique = True)
	active = models.BooleanField(default = True)
	verified = models.BooleanField(default = False)
	created_time = models.DateTimeField(auto_now_add = True)
	parent = models.ForeignKey('self', null = True, default = None)
	admins = models.ManyToManyField('User', through = 'Community_admin_role')

class Community_admin_role(models.Model):

	admin = models.ForeignKey('User')
	community = models.ForeignKey('Community')
	ROLE_CHOICES = (
		('S', 'Super Admin'),
		('N', 'Normal Admin'),
	)
	role = models.CharField(max_length = 1, choices = ROLE_CHOICES, default = 'N')
	created_time = models.DateTimeField(auto_now_add = True)
	
class Community_normal(Community):

	email = models.CharField(max_length = 30)
	password = models.CharField(max_length = 128)

	def save(self, *args, **kwargs):
		if self.password is not None and len(self.password) != 128:
			import hashlib
			self.password = hashlib.sha512(self.password).hexdigest()
		super(Community_normal, self).save(*args, **kwargs)

class Community_school(Community):

	email_subfix = models.CharField(max_length = 15)

class Post(models.Model):

	owner = models.ForeignKey(User, related_name = '+')
	claimer = models.ForeignKey(User, null = True, blank = True)
	want = models.CharField(max_length = 150)
	approved = models.BooleanField(default = False)
	created_time = models.DateTimeField(auto_now_add = True)
	claimed_time = models.DateTimeField(null = True, blank = True)
	community = models.ForeignKey('Community')

class Post_money(Post):

	offer = models.FloatField()

class Post_other(Post):

	offer = models.CharField(max_length = 150)

class Message(models.Model):

	to = models.ForeignKey(User)
	email = models.CharField(max_length = 50)
	text = models.CharField(max_length = 10)
	note = models.CharField(max_length = 50)
	checked = models.BooleanField(default = False)
	approved = models.NullBooleanField(default = None, null = True, blank = True)
	created_time = models.DateTimeField(auto_now_add = True)

	class Meta:
		abstract = True

class Message_money(Message):

	about = models.ForeignKey('Post_money')

class Message_other(Message):

	about = models.ForeignKey('Post_other')

class Keyword(models.Model):

	name = models.CharField(max_length = 100)
	siblings = models.ManyToManyField('self', null = True)
	weight = models.IntegerField(max_length = 4, default = 0)
