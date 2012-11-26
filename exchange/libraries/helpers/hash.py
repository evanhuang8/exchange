from random import *
import hashlib
import uuid
import string

class HashHelper:

	def password(self, rawPass):
		return hashlib.sha512(rawPass).hexdigest()
	
	def randomPass(self):
		chars = string.ascii_letters + string.digits
		return "".join(choice(chars) for x in range(randint(8, 16)))

	def uid(self):
		return uuid.uuid1().hex
