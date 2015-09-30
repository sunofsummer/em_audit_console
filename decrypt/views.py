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
import json

from django.db.models import Q
from django.http import HttpResponse
from django.shortcuts import render
from django.core import serializers
from django.core.paginator import Paginator
from django.contrib.auth.decorators import permission_required

from .models import Audit, Limit, PrtDict


log = logging.getLogger()
q = Q()
result = ''


def forward_audit_log_list_view(request):
    return render(request, 'decrypt/audit_logs.html')


@permission_required('decrypt.can_vote')
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


def forward_white_list_view(request):
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
    try:
        params = json.loads(request._body)
        if params.get('pk') is not None:
            limit = Limit.objects.using('decrypt').get(pk=params.get('pk'))
            limit.bind_ip = params.get('bind_ip')
            limit.memo = params.get('memo')
            limit.save()
        else:
            Limit.objects.using('decrypt').create(bind_ip=params.get('bind_ip'), memo=params.get('memo'))
    except Exception, e:
        print e

    return HttpResponse('{msg : "保存白名单数据成功"}', content_type="application/json")


def forward_prt_dict_view(request):
    return render(request, 'decrypt/prt_dict.html')


def get_prt_dict_data(request):
    try:
        global q, result
        q = build_q(request)
        prt_dicts = PrtDict.objects.using('decrypt').filter(q)

        paginator = Paginator(prt_dicts, request.GET["limit"])

        result = serializers.serialize("gp", paginator.page(request.GET["page"]), total=prt_dicts.count())
    except Exception as e:
        print str.join('StackTrace:', e)

    return HttpResponse(result, content_type="application/json")


def del_prt_dict_data(request):
    pks = request.GET["pks"]
    PrtDict.objects.using('decrypt').extra(where=['module_id IN (' + pks + ')']).delete()
    return HttpResponse('{msg : "删除产品字典数据成功"}', content_type="application/json")


def save_or_update_prt_dict_data(request):
    try:
        params = json.loads(request._body)
        if params.get('pk') is not None and params.get('pk') <> '':
            prt_dict = PrtDict.objects.using('decrypt').get(pk=params.get('pk'))
            prt_dict.product_name = params.get('product_name')
            prt_dict.module_name = params.get('module_name')
            prt_dict.save()
        else:
            PrtDict.objects.using('decrypt').create(product_name=params.get('product_name'),
                                                    module_name=params.get('module_name'))
    except Exception, e:
        print e.message

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