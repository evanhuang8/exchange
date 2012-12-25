from django.core.mail import EmailMessage
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from twilio.rest import TwilioRestClient
from celery.task import task

class NotificationManager:

	@staticmethod
	def email(subject, body, receivers, cc = [], bcc = []):
		email = EmailMessage(subject, body, to = receivers, cc = cc, bcc = bcc)
		email.send()
		return email

	@staticmethod
	def htmlEmail(subject, html, receivers, cc = [], bcc = []):
		textContent = strip_tags(html)
		email = EmailMultiAlternatives(subject, textContent, to = receivers, cc = cc, bcc = bcc)
		email.attach_alternative(html, 'text/html')
		email.send
		return email
		
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

def asyncHtmlEmail(subject, html, receivers, cc = [], bcc = []):
	return celeryHtmlEmail.delay(subject, html, receivers, cc, bcc)

@task()
def celeryHtmlEmail(subject, html, receivers, cc = [], bcc = []):
	NotificationManager.email(subject, html, receivers, cc, bcc)

def asyncText(message, receivers):
	return celeryText.delay(message, receivers)

@task()
def celeryText(message, receivers):
	NotificationManager.text(message, receivers)
