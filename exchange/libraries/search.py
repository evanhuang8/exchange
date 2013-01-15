from main.models import *
from django.db.models import Q
import operator

class SearchManager:

	@staticmethod
	def wantResults(query, user):
		wordList = []
		uselessWords = ['is', 'a', 'or', 'at', 'the', 'and', 'of', 'in']
		keywordsUnfiltered = query.split(' ')
		keywords = [x for x in keywordsUnfiltered if x not in uselessWords]
		for keyword in keywords:
			wordList.append(keyword)
			dbwords = Keyword.objects.filter(siblings__name = keyword).order_by('siblings__weight')
			for value in dbwords:
				wordList.append(value.name)
		results = Post.objects.filter(reduce(operator.or_, (Q(want__icontains = x) for x in wordList))).filter(claimer = None, community = user.parent_community).exclude(owner = user)
		return list(results)

	@staticmethod
	def offerResults(query, user):
		wordList = []
		uselessWords = ['is', 'a', 'or', 'at', 'the', 'and', 'of', 'in']
		keywordsUnfiltered = query.split(' ')
		keywords = [x for x in keywordsUnfiltered if x not in uselessWords]
		for keyword in keywords:
			wordList.append(keyword)
			dbwords = Keyword.objects.filter(siblings__name = keyword).order_by('siblings__weight')
			for value in dbwords:
				wordList.append(value.name)
		moneyResults = Post_money.objects.filter(reduce(operator.or_, (Q(offer__icontains = x) for x in wordList))).filter(claimer = None, community = user.parent_community).exclude(owner = user)
		otherResults = Post_other.objects.filter(reduce(operator.or_, (Q(offer__icontains = x) for x in wordList))).filter(claimer = None, community = user.parent_community).exclude(owner = user)
		return list(moneyResults) + list(otherResults)
