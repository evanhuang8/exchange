from django.core.mail import EmailMessage
from twilio.rest import TwilioRestClient

class NotificationManager:

	@staticmethod
	def email(subject, body, receivers, cc = [], bcc = []):
		email = EmailMessage(subject, body, to = receivers, cc = cc, bcc = bcc)
		email.send()
		
	@staticmethod
	def text(message, receivers):
		accountSid = 'ACdba535130b950cc4c5e50994d41bbb98'
		authToken = '3d3a69b94d0b28a242af2ae2aabd811b'
		fromNumber = '+14177080977'
		twilio = TwilioRestClient(accountSid, authToken)
		texts = []
		if len(message) <= 160:
			for receiver in receivers:
				text = twilio.sms.messages.create(to = receiver, from_ = fromNumber, body = message)
				texts.append(text)
		return texts
