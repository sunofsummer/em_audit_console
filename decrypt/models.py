from django.db import models

# Create your models here.


class A(models.Model):
    a1 = models.CharField(max_length=10)
    # a2 = models.IntegerField
    class Meta:
        db_table = 'a'


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