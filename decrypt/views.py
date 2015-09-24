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
import logging
from django.db.models import Q

from django.http import HttpResponse
from django.shortcuts import render
from .models import Audit, Limit
from django.core import serializers
from django.core.paginator import Paginator
import json


logger = logging.getLogger()
q = Q()
result = ''


def forward_audit_log_list_view(request):
    return render(request, 'decrypt/audit_logs.html')


def get_audit_log_list_data(request):
    """
    :param request:
    :return:审计日志结果列表数据
    """
    try:
        global q, result
        q = build_q(request)
        audits = Audit.objects.using('decrypt').filter(q)

        paginator = Paginator(audits, request.GET["limit"])

        result = serializers.serialize("gp", paginator.page(request.GET["page"]), total=audits.count())
    except Exception as e:
        print str.join('StackTrace:', e)

    return HttpResponse(result, content_type="application/json")


def del_audit_log_data(request):
    pks = request.GET["pks"]
    Audit.objects.using('decrypt').extra(where=['id IN (' + pks + ')']).delete()
    return HttpResponse('{msg : "删除解密日志数据成功"}', content_type="application/json")


def white_list_view(request):
    return render(request, 'decrypt/white_list.html')


def get_white_list_data(request):
    try:
        global q, result
        q = build_q(request)
        limits = Limit.objects.using('decrypt').filter(q)

        paginator = Paginator(limits, request.GET["limit"])

        result = serializers.serialize("gp", paginator.page(request.GET["page"]), total=limits.count())
    except Exception as e:
        print str.join('StackTrace:', e)

    return HttpResponse(result, content_type="application/json")


def del_white_list_data(request):
    pks = request.GET["pks"]
    Limit.objects.using('decrypt').extra(where=['id IN (' + pks + ')']).delete()
    return HttpResponse('{msg : "删除白名单数据成功"}', content_type="application/json")


def save_or_update_white_list_data(request):
    params = json.loads(request._body)
    Limit.objects.using('decrypt').create(bind_ip=params.get('bind_ip'), memo=params.get('memo'))
    return HttpResponse('{msg : "保存白名单数据成功"}', content_type="application/json")


def build_q(request):
    global q
    has_condition = request.GET.has_key('baseParams')
    if has_condition:
        base_params = json.loads(request.GET["baseParams"])
        q = Q()
        for field_name in base_params:
            if base_params[field_name] != '':
                q.add(Q(**{field_name: base_params[field_name]}), Q.AND)

    return q