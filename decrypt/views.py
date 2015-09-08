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

Usage ::

"""
import logging

from django.http import HttpResponse
from django.shortcuts import render
from .models import Audit
from django.core import serializers
from django.core.paginator import Paginator


logger = logging.getLogger()


def forward_list_view(request):
    return render(request, 'decrypt/audit_logs.html')


def get_list_data(request):
    audits = Audit.objects.using('decrypt').all()
    paginator = Paginator(audits, request.REQUEST["limit"])

    result = serializers.serialize("gp", paginator.page(request.REQUEST["page"]), total=audits.count())

    return HttpResponse(result, content_type="application/json")