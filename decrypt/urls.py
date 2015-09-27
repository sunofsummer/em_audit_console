from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^forward_audit_log_list_view/$', views.forward_audit_log_list_view),
    url(r'^get_audit_log_list_data/$', views.get_audit_log_list_data),
    url(r'^del_audit_log_data/$', views.del_audit_log_data),
    url(r'^forward_white_list_view/$', views.forward_white_list_view),
    url(r'^get_white_list_data/$', views.get_white_list_data),
    url(r'^del_white_list_data/$', views.del_white_list_data),
    url(r'^save_or_update_white_list_data/$', views.save_or_update_white_list_data),
]