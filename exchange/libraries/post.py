from main.models import *

class PostManager:
	
	@staticmethod
	def fetch(page = 0):
		posts = Post.objects.filter(claimer = None).order_by('created_time').reverse()[0 * page:20]
		return posts

		
		
		
