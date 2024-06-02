# import pathlib

from django.urls import path, include
from rest_framework import routers

from . import views


router = routers.DefaultRouter()
router.register('users', views.UserViewSet, basename='users')
router.register('categories', views.CategoryViewSet, basename='categories')
router.register('rooms', views.RoomViewSet, basename='rooms')
router.register('owners', views.OwnerViewSet, basename='owners')
router.register('posts', views.PostViewSet, basename='posts')
router.register('room-comment', views.CommentRoomViewSet, basename='room-comment')
router.register('post-comment', views.CommentPostViewSet, basename='post-comment')

urlpatterns = [
    path('', include(router.urls))
]