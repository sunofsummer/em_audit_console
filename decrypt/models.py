from django.db import models
from datetime import datetime

# Create your models here.


class Audit(models.Model):
    id = models.AutoField(primary_key=True)
    module_id = models.BigIntegerField()
    request_ip = models.CharField(max_length=20)
    is_success = models.CharField(max_length=1)
    create_date = models.DateTimeField()
    error_msg = models.TextField()


class Limit(models.Model):
    id = models.AutoField(primary_key=True)
    bind_ip = models.CharField(max_length=100)
    memo = models.CharField(max_length=500)


class PrtDict(models.Model):
    module_id = models.AutoField(primary_key=True)
    product_name = models.CharField(max_length=200)
    module_name = models.CharField(max_length=200)
    create_date = models.DateTimeField(default=datetime.now())
    modify_date = models.DateTimeField(default=datetime.now())

    class Meta:
        db_table = 'prt_dict'
        unique_together = (("module_id", "product_name", "module_name"),)