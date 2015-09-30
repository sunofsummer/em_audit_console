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
    url(r'^forward_prt_dict_view/$', views.forward_prt_dict_view),
    url(r'^get_prt_dict_data/$', views.get_prt_dict_data),
    url(r'^del_prt_dict_data/$', views.del_prt_dict_data),
    url(r'^save_or_update_prt_dict_data/$', views.save_or_update_prt_dict_data),
]