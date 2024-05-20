from django.db.models import Count

from .models import User


def count_user_by_month(year):

    result = {}
    for month in range(1,13):
        users_by_month = User.objects.filter(date_joined__year=year, date_joined__month=month).values('role','date_joined__month').annotate(total=Count('id'))
        result[month] = list(users_by_month)

    return result