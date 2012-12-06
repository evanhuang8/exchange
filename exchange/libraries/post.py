from main.models import *

class PostManager:

	@staticmethod
	def postType(post):
		try:
			offer = p.post_money.offer
			return Post_money
		except Exception:
			offer = p.post_other.offer
			return Post_other
	
	@staticmethod
	def fetch(page = 1, serialized = False):
		startIndex = (int(page) - 1) * 10
		posts = []
		if startIndex >= 0:		
			posts = Post.objects.filter(claimer = None).order_by('created_time').reverse()[startIndex:startIndex + 10]
			if posts.count() == 0 and page != 1:
				posts = None
			if posts and serialized:
				serializedPosts = []
				for p in posts:
					postType = ''
					offer = ''
					try:
						offer = p.post_money.offer
						postType = 'money'
					except Exception:
						offer = p.post_other.offer
						postType = 'other'
					post = {
						'id':p.id,
						'type':postType,
						'owner':{
							'fb_id':p.owner.fb_id,
							'name':p.owner.name
						},
						'want':p.want,
						'offer':offer,
						'created_time':p.created_time.strftime('%Y-%m-%d %X')
					}
					serializedPosts.append(post)
					posts = serializedPosts
		return posts

	@staticmethod
	def countActive():
		return Post.objects.filter(claimer = None).count()

	@staticmethod
	def countPage():
		postCount = PostManager.countActive()
		pageCount = postCount / 10
		if postCount % 10 != 0:
			pageCount = pageCount + 1
		return pageCount 

	@staticmethod
	def paging(page = 1):
		pageCount = PostManager.countPage()
		paging = []
		page = int(page)
		if page > 0:
			if pageCount != 0:
				paging.append(1)
				left = 2
				if page - 2 > 2:
					paging.append('...')
					left = page - 2
				right = pageCount - 1
				if page + 3 < pageCount:
					right = page + 3
				for i in range(left, right):
					paging.append(i)
				if right == page + 3:
					paging.append('...')
				if pageCount != 1:
					paging.append(pageCount)
		return paging
