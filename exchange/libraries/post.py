from main.models import *

class PostManager:

	@staticmethod
	def postType(post):
		try:
			offer = post.post_money.offer
			return Post_money
		except Exception:
			offer = post.post_other.offer
			return Post_other
	
	@staticmethod
	def fetch(page = 1, serialized = False):
		startIndex = (int(page) - 1) * 12
		posts = []
		if startIndex >= 0:		
			posts = Post.objects.filter(claimer = None).order_by('created_time').reverse()[startIndex:startIndex + 12]
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
		pageCount = postCount / 12
		if postCount % 12 != 0:
			pageCount = pageCount + 1
		return pageCount 

	@staticmethod
	def paging(page = 1):
		pageCount = PostManager.countPage()
		paging = []
		page = int(page)
		if page > 0 and pageCount != 0:
			paging.append(1)
			for i in range(max(2, page - 2), min(pageCount - 1, page + 2)):
				paging.append(i)
			if pageCount != 1:
				paging.append(pageCount)
		return paging

	@staticmethod
	def uncheckMessageCount(user):
		moneyMessages = Message_money.objects.filter(to = user, checked = False, approved = None)
		otherMessages = Message_other.objects.filter(to = user, checked = False, approved = None)
		return len(list(moneyMessages) + list(otherMessages))

	@staticmethod
	def fetchBulletin(user):
		bullets = {
			'swaps':[],
			'offers':[]
		}
		moneyMessages = Message_money.objects.filter(to = user)
		otherMessages = Message_other.objects.filter(to = user)
		swapMessages = list(moneyMessages) + list(otherMessages)
		swMe = {
			'unchecked':{},
			'checked':{},
			'through':{}
		}
		swapMessages = sorted(swapMessages, key = lambda k: k.created_time, reverse = True)
		for m in swapMessages:
			if m.approved is None:
				if not m.checked:
					swMe['unchecked'][m.about.id] = m
				else:
					swMe['checked'][m.about.id] = m
			elif m.approved is True:
				swMe['through'][m.about.id] = m
		ownSwaps = Post.objects.filter(owner = user).order_by('created_time').reverse()
		inactiveSwaps = []
		for s in ownSwaps:
			if not (swMe['unchecked'].has_key(s.id) or swMe['checked'].has_key(s.id) or swMe['through'].has_key(s.id)):
				inactiveSwaps.append(s)
		bullets['swaps'] = [k[1] for k in swMe['unchecked'].items()] + [k[1] for k in swMe['checked'].items()] + [k[1] for k in swMe['through'].items()] + inactiveSwaps
		return bullets
