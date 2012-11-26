from django.conf.urls import patterns, include, url
import os.path

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',

	# Static Files
	url(r'^static/(?P<path>.*)$', 'django.views.static.serve', {'document_root':os.path.join(os.path.dirname(__file__), '../static'),}),
	
	# Index
	url(r'^$', 'exchange.controllers.IndexController.index', name = 'exchange-home'),

    # Examples:
    # url(r'^$', 'exchange.views.home', name='home'),
    # url(r'^exchange/', include('exchange.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)
