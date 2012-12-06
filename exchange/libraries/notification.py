from django.core.mail import EmailMessage

class NotificationManager:

	@staticmethod
	def email(subject, body, receivers, cc, bcc):
		email = EmailMessage(subject, body, to = receivers, cc = cc, bcc = bcc)
		email.send()
		
	def text(message, receivers):
		pass
