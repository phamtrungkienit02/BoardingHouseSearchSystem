import datetime

from django.core.mail import send_mail
from django.db.models import Count
from django.db.models.functions import Extract
from datetime import datetime

from .models import User, Follow
# from celery import shared_task


def count_user_by_year(request={}):
    year = request.get('year')
    quarter = request.get('quarter')
    month = request.get('month')
    user_counts = User.objects.none()
    if year is None:
        year = datetime.now().year
    # user_counts = User.objects.filter(date_joined=year).values('role').annotate(counter=Count('id'))
    # .annotate(y=Extract('date_joined', 'year'))\
    if month is None and quarter is None:
        user_counts = User.objects.filter(date_joined__year=year)\
            .values('role')\
            .annotate(counter=Count('id'))
    elif quarter is not None:
        user_counts = User.objects.filter(date_joined__year=year, date_joined__quarter=quarter) \
            .values('role') \
            .annotate(counter=Count('id'))
    elif month is not None:
        user_counts = User.objects.filter(date_joined__year=year, date_joined__month=month) \
            .values('role') \
            .annotate(counter=Count('id'))
    return user_counts


def count_user():
    return User.objects.filter(role='CUSTOMER').count()


def count_user_owner():
    return User.objects.filter(role='OWNER').count()


def count_by_month(request={}):
    year = request.get('year')
    quarter = request.get('quarter')
    month = request.get('month')
    if year is None:
        year = datetime.now().year
    # if month is None or quarter is None:
    #     result = {}
    #     for month in range(1, 13):
    #         users_by_month = User.objects.filter(date_joined__year=year, date_joined__month=month)\
    #             .values('role', total=Count('id'))
    #         result[month] = list(users_by_month)
    result = None
    if month is None and quarter is None:

        u = User.objects.filter(date_joined__year=year)
        result = u.annotate(month=Extract('date_joined', 'month')) \
                 .values('month').annotate(total=Count('id')).order_by('date_joined')

    return result


def send_email(user, room):
    # c1
    # follows = Follow.objects.filter(be_followed=user)
    # followers = [follow.follower for follow in follows]
    # emails = [follower.email for follower in followers]
    # c2
    # follows = Follow.objects.filter(be_followed=user)
    # emails = [f.follower.email for f in follows]

    emails = Follow.objects.filter(be_followed=user).values_list('follower__email', flat=True)

    subject = f'THÔNG TIN MỚI TỪ {user.username}'
    message = f'Chủ trọ {user.username} mà bạn theo dõi vừa đăng một bài viết mới cho thuê phòng trọ với tiêu đề: {room.title}. Hãy vào app để xem ngay!!!'
    from_email = user.email
    recipient_list = emails
    send_mail(subject, message, from_email, recipient_list)
