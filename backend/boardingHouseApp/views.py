from _lsprof import profiler_entry

from django.core import paginator
from django.core.mail import send_mail
from django.http import Http404, HttpResponse
from django.shortcuts import render
from rest_framework import viewsets, generics, parsers, permissions, status
from rest_framework.decorators import action, parser_classes
from rest_framework.response import Response

# from rest_framework.views import APIView
# from django.template.loader import get_template
# from django.template import RequestContext

from . import serializers, paginators, perms, dao
from .admin import CommentRoomAdmin
from .models import User, Category, Room, Post, ImageRoom, RoomComment, Follow, PostComment, District
from .serializers import ImageSerializer
import base64


# Create your views here.
class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser]

    def get_permissions(self):
        if self.action in ['get_current_user']:
            return [permissions.IsAuthenticated()]
        # if self.action in ['owner']:
        #     return [permissions.IsAdminUser()]
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

    # @action(methods=['post'], detail=True, url_path='follow')
    # def follow(self, request, pk):
    #     f, created = Follow.objects.get_or_create(follower=request.user, be_followed=self.get_object())
    #     if not created:
    #         f.active = not f.active
    #         f.save()
    #     return Response(status=status.HTTP_200_OK)

    # @action(methods=['post'], detail=True, url_path='owner')
    # def owner(self, request, pk):
    #     u = self.get_object()
    #     if u.role == 'CUSTOMER':
    #         u.role = 'OWNER'
    #     u.save()
    #     return Response(status=status.HTTP_200_OK)


class CategoryViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = serializers.CategorySerializer


class RoomViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Room.objects.prefetch_related('imageroom_set').select_related('user', 'district').filter(active=True)
    serializer_class = serializers.RoomSerializer
    pagination_class = paginators.RoomPaginator
    # parser_classes = [parsers.MultiPartParser]

    def get_permissions(self):
        if self.action in ['add_comments', 'follow']:
            return [permissions.IsAuthenticated()]
        if self.action in ['create']:
            return [perms.OwnerPerm()]
        return [permissions.AllowAny()]

    # def list(self, request):
    #     r = Room.objects.prefetch_related('imageroom_set').filter(active=True)
    #     paginator = paginators.CommentPaginator()
    #     page = paginator.paginate_queryset(r, request)
    #     if page is not None:
    #         serializer = serializers.RoomSerializer(page, many=True)
    #         return paginator.get_paginated_response(serializer.data)
    #
    #     return Response(serializers.RoomSerializer(r, many=True).data)
    def create(self, request):
        [parsers.MultiPartParser()]
        user = request.user
        r = Room.objects.create(title=request.data.get('title'),
                                description=request.data.get('description'),
                                name=request.data.get('name'),
                                price=request.data.get('price'),
                                num_of_people=request.data.get('num_of_people'),
                                area=request.data.get('area'),
                                address=request.data.get('address'),
                                longitude=request.data.get('longitude'),
                                latitude=request.data.get('latitude'),
                                category_id=request.data.get('category'),
                                district_id=request.data.get('district'),
                                user=request.user)

        images_data = request.FILES.getlist('images')
        for i in images_data:
            ImageRoom.objects.create(room=r, image=i)
        # images = [ImageRoom(room=r, image=i) for i in images_data]
        # ImageRoom.objects.bulk_create(images)

        # Gửi email
        if Room.objects.filter(id=r.id).exists():
            dao.send_email(user, r)
        return Response(serializers.RoomDetailSerializer(r).data,
                        status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk):
        try:
            r = Room.objects.prefetch_related('imageroom_set').select_related('user', 'district', 'category').get(pk=pk)
        except Room.DoesNotExist:
            return Http404()
        return Response(serializers.RoomDetailSerializer(r).data)

    def get_queryset(self):
        queries = self.queryset
        q = self.request.query_params.get('q')
        cate_id = self.request.query_params.get('cate_id')
        price = self.request.query_params.get('price')
        num = self.request.query_params.get('num')
        district = self.request.query_params.get('district')
        city = self.request.query_params.get('city')

        if q:
            queries = queries.filter(title__icontains=q)
        if cate_id:
            queries = queries.filter(category_id=cate_id)
        if price:
            queries = queries.filter(price__lte=price)
        if num:
            queries = queries.filter(num_of_people=num)
        if district:
            queries = queries.filter(district_id=district)
        if city:
            queries = queries.q = Room.objects.select_related('district').filter(district__city_id=city)
        return queries

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

    @action(methods=['post'], detail=True, url_path='add_comments')
    def add_comments(self, request, pk):
        c = self.get_object().roomcomment_set.create(content=request.data.get('content'),
                                                 user=request.user)
        return Response(serializers.CommentSerializer(c).data,
                        status=status.HTTP_201_CREATED)

    @action(methods=['post'], detail=True, url_path='follow')
    def follow(self, request, pk):
        f, created = Follow.objects.get_or_create(follower=request.user, be_followed=self.get_object().user)
        if not created:
            f.active = not f.active
            f.save()
        return Response(serializers.RoomDetailSerializer(self.get_object()).data, status=status.HTTP_200_OK)


class OwnerViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = Room.objects.prefetch_related('imageroom_set').select_related('user', 'category').filter(active=False)
    serializer_class = serializers.OwnerSerializer
    pagination_class = paginators.RoomPaginator

    def get_permissions(self):
        if self.action in ['create']:
            return [perms.CustomerPerm()]
        if self.action in ['owner']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def create(self, request):
        [parsers.MultiPartParser()]
        r = Room.objects.create(name=request.data.get('name'),
                                address=request.data.get('address'),
                                longitude=request.data.get('longitude'),
                                latitude=request.data.get('latitude'),
                                category_id=request.data.get('category'),
                                user=request.user,
                                active=False)
        images_data = request.FILES.getlist('images')
        for i in images_data:
            ImageRoom.objects.create(room=r, image=i)

        return Response(serializers.OwnerSerializer(r).data,
                        status=status.HTTP_201_CREATED)

    @action(methods=['post'], detail=True, url_path='owner')
    def owner(self, request, pk):
        u = self.get_object().user
        if u.role == 'CUSTOMER':
            u.role = 'OWNER'
        u.save()
        return Response(serializers.OwnerSerializer(self.get_object()).data, status=status.HTTP_200_OK)


class PostViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Post.objects.select_related('user', 'district').filter(active=True)
    serializer_class = serializers.PostSerializer
    pagination_class = paginators.RoomPaginator

    def create(self, request):
        p = Post.objects.create(title=request.data.get('title'),
                                description=request.data.get('description'),
                                user=request.user,
                                district_id=request.data.get('district'))

        return Response(serializers.PostDetailSerializer(p).data,
                        status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk):
        try:
            p = Post.objects.select_related('user', 'district').get(pk=pk)
        except Post.DoesNotExist:
            return Http404()
        return Response(serializers.PostDetailSerializer(p).data)

    def get_permissions(self):
        if self.action in ['add_comments', 'create']:
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

    @action(methods=['post'], detail=True, url_path='add_comments')
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


# class CustomAPIRootView(APIView):
#     def get(self, request, *args, **kwargs):
#         template = get_template('index.html')
#         context = RequestContext(request, {})
#         html = template.render(context)
#         return Response(html, content_type='text/html')

class DistrictViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = District.objects.all()
    serializer_class = serializers.DistrictSerializer




def swagger_image(request):
    return HttpResponse('Image content', content_type='image/png')
