from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^forward_audit_log_list_view/$', views.forward_audit_log_list_view),
    url(r'^get_audit_log_list_data/$', views.get_audit_log_list_data),
]