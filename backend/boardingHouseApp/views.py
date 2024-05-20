from django.core import paginator
from django.shortcuts import render
from rest_framework import viewsets, generics, parsers, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from . import serializers, paginators, perms
from .admin import CommentRoomAdmin
from .models import User, Category, Room, Post, ImageRoom, RoomComment, Follow, PostComment


# Create your views here.
class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser]

    def get_permissions(self):
        if self.action in ['get_current_user', 'follow']:
            return [permissions.IsAuthenticated()]
        if self.action in ['owner']:
            return [perms.AdminPerm()]
        return [permissions.AllowAny()]

    @action(methods=['get', 'patch'], detail=False, url_path='current-user')
    def get_current_user(self, request):
        user = request.user
        if request.method.__eq__('PATCH'):
            for k, v in request.data.items():
                setattr(user, k, v)
            user.save()

        return Response(serializers.UserSerializer(user).data,
                        status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True, url_path='follow')
    def follow(self, request, pk):
        f, created = Follow.objects.get_or_create(follower=request.user, be_followed=self.get_object())
        if not created:
            f.active = not f.active
            f.save()
        return Response(status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True, url_path='owner')
    def owner(self, request, pk):
        u = self.get_object()
        if u.role == 'CUSTOMER':
            u.role = 'OWNER'
        u.save()
        return Response(status=status.HTTP_200_OK)


class CategoryViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = serializers.CategorySerializer


class RoomViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = Room.objects.prefetch_related('imageroom_set').filter(active=True)
    # queryset = ImageRoom.objects.all()
    serializer_class = serializers.RoomSerializer
    pagination_class = paginators.RoomPaginator

    def get_queryset(self):
        queries = self.queryset
        q = self.request.query_params.get('q')
        cate_id = self.request.query_params.get('category_id')
        if q:
            queries = queries.filter(title__icontains=q)
        if cate_id:
            queries = queries.filter(category_id=cate_id)
        return queries

    def get_permissions(self):
        if self.action in ['add_comments']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    @action(methods=['get'], detail=True, url_path='comments')
    def get_comments(self, request, pk):
        comments = self.get_object().roomcomment_set.select_related('user').order_by('-id')

        paginator = paginators.CommentPaginator()
        page = paginator.paginate_queryset(comments, request)
        if page is not None:
            serializer = serializers.CommentSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        return Response(serializers.CommentSerializer(comments, many=True, context={'request': request}).data,
                        status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True, url_path='comments')
    def add_comments(self, request, pk):
        c = self.get_object().roomcomment_set.create(content=request.data.get('content'),
                                                 user=request.user)
        return Response(serializers.CommentSerializer(c).data,
                        status=status.HTTP_201_CREATED)


class PostViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Post.objects.filter(active=True)
    serializer_class = serializers.PostSerializer

    def get_permissions(self):
        if self.action in ['add_comments']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    @action(methods=['get'], detail=True, url_path='comments')
    def get_comments(self, request, pk):
        comments = self.get_object().postcomment_set.select_related('user').order_by('-id')

        paginator = paginators.CommentPaginator()
        page = paginator.paginate_queryset(comments, request)
        if page is not None:
            serializer = serializers.CommentSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        return Response(serializers.CommentSerializer(comments, many=True, context={'request': request}).data,
                        status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True, url_path='comments')
    def add_comments(self, request, pk):
        c = self.get_object().postcomment_set.create(content=request.data.get('content'),
                                                     user=request.user)
        return Response(serializers.CommentSerializer(c).data,
                        status=status.HTTP_201_CREATED)


class CommentRoomViewSet(viewsets.ViewSet, generics.DestroyAPIView):
    queryset = RoomComment.objects.all()
    serializer_class = serializers.CommentSerializer
    permission_classes = [perms.CommentOwner]


class CommentPostViewSet(viewsets.ViewSet, generics.DestroyAPIView):
    queryset = PostComment.objects.all()
    serializer_class = serializers.CommentSerializer
    permission_classes = [perms.CommentOwner]
