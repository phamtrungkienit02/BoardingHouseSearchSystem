# Generated by Django 5.0.2 on 2024-05-24 06:00

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('boardingHouseApp', '0009_follow_active_follow_updated_date'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='post',
            name='street',
        ),
        migrations.RemoveField(
            model_name='room',
            name='street',
        ),
        migrations.RemoveField(
            model_name='post',
            name='city',
        ),
        migrations.RemoveField(
            model_name='room',
            name='city',
        ),
        migrations.DeleteModel(
            name='Street',
        ),
    ]