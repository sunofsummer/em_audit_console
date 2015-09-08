from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^forward_list_view/$', views.forward_list_view),
    url(r'^get_list_data/$', views.get_list_data),
]