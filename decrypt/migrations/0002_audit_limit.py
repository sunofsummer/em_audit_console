# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('decrypt', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Audit',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True)),
                ('module_id', models.BigIntegerField()),
                ('request_ip', models.CharField(max_length=20)),
                ('is_success', models.CharField(max_length=1)),
                ('create_date', models.DateTimeField()),
                ('error_msg', models.TextField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Limit',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True)),
                ('bind_ip', models.CharField(max_length=100)),
                ('memo', models.CharField(max_length=500)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
