# -*- coding: UTF-8 -*-
"""
Desc :: views return the json data for extjs 4.1 GridPanel

For Example(ExtJs 4.1) ::
    var data = {
            users: [
                {id: 1, name: '孙悟空', email: 'sun@tian.com'},
                {id: 1, name: '猪八戒', email: 'zhu@tian.com'},
                {id: 1, name: '白骨精', email: 'bai@tian.com'},
                {id: 1, name: '牛魔王', email: 'niu@tian.com'}
            ], total: 5
        };

Query Condition ::
    __exact 精确等于 like 'aaa'
    __iexact 精确等于 忽略大小写 ilike 'aaa'
    __contains 包含 like '%aaa%'
    __icontains 包含 忽略大小写 ilike '%aaa%'，但是对于sqlite来说，contains的作用效果等同于icontains。
    __gt 大于
    __gte 大于等于
    __lt 小于
    __lte 小于等于
    __in 存在于一个list范围内
    __startswith 以...开头
    __istartswith 以...开头 忽略大小写
    __endswith 以...结尾
    __iendswith 以...结尾，忽略大小写
    __range 在...范围内
    __year 日期字段的年份
    __month 日期字段的月份
    __day 日期字段的日
    __isnull=True/False

Usage ::
    from django.db.models import Q

Author :: yang.xia

"""
# import logging
# from django.db.models import Q
#
# from django.http import HttpResponse
# from django.shortcuts import render
# from .models import Audit
# from django.core import serializers
# from django.core.paginator import Paginator
# import json
#
#
# logger = logging.getLogger()
#
#
# def forward_audit_log_list_view(request):
#     return render(request, 'decrypt/audit_logs.html')
#
#
# def get_audit_log_list_data(request):
#     try:
#         has_condition = request.GET.has_key('baseParams')
#         if has_condition:
#             base_params = json.loads(request.GET["baseParams"])
#             q = Q()
#             for field_name in base_params:
#                 if base_params[field_name] != '':
#                     q.add(Q(**{field_name: base_params[field_name]}), Q.AND)
#
#             audits = Audit.objects.using('decrypt').filter(q)
#         else:
#             audits = Audit.objects.using('decrypt').all()
#
#         paginator = Paginator(audits, request.GET["limit"])
#
#         result = serializers.serialize("gp", paginator.page(request.GET["page"]), total=audits.count())
#     except Exception as e:
#         print str.join('StackTrace:', e)
#
#     return HttpResponse(result, content_type="application/json")


if __name__ == '__main__':
    import datetime

    timeStamp = 1381419600
    dateArray = datetime.datetime.utcfromtimestamp(timeStamp)
    print dateArray
    otherStyleTime = dateArray.strftime("%Y-%m-%d %H:%M:%S")
    print otherStyleTime