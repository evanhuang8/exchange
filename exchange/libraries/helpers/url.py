class UrlHelper:

	def validate(self, requestArray, identifiers, optionalIdentifiers = False):
		parameters = {}
		for i in identifiers:
			param = requestArray.get(i, None)
			if param is None:
				return False
			else:
				parameters[i] = param
		if optionalIdentifiers:
			for oI in optionalIdentifiers:
				parameters[oI] = requestArray.get(oI, None)
		return parameters
