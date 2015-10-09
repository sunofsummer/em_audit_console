from django.contrib.auth import views as auth_views
from django.conf.urls import url

from . import views


urlpatterns = [
    url(r'^login/$', auth_views.login, {'template_name': 'login.html'}),
    url(r'^logout/$', auth_views.logout, {'template_name': 'login.html'}),
    url(r'^profile/$', views.index),
    url(r'^password_change/$', auth_views.password_change),
    url(r'^password_reset/$', auth_views.password_reset),
    url(r'^$', views.index),
]