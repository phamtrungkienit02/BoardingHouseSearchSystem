from rest_framework import serializers
from .models import User, Category, Room, Post, ImageRoom, PostComment, District
from urllib.parse import urljoin
from cloudinary.models import CloudinaryField


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = ['name']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # read_only_fields = ['role']
        fields = ['id', 'first_name', 'last_name', 'username', 'password', 'email', 'phone_number', 'avatar', 'role']
        extra_kwargs = {
            'password': {'write_only': True},
            'role': {'read_only': True}
        }

    def to_representation(self, instance):
        req = super().to_representation(instance)
        req['avatar'] = instance.avatar.url
        return req

    def create(self, validated_data):
        data = validated_data.copy()
        user = User(**data)
        user.set_password(user.password)
        user.save()
        return user


class AuthenticatedUserSerializer(UserSerializer):
    followed = serializers.SerializerMethodField()

    def get_followed(self, user):
        return user.be_followed.filter(active=True).exists()
        # return user.followers.filter(active=True).exists()

    class Meta:
        model = UserSerializer.Meta.model
        fields = UserSerializer.Meta.fields + ['followed']


class ImageSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        req = super().to_representation(instance)
        req['image'] = instance.image.url
        return req

    class Meta:
        model = ImageRoom
        fields = ['image']
        # fields = '__all__'


# class BaseImageSerializer(serializers.ModelSerializer):
#     images = serializers.SerializerMethodField('get_images')
#
#     def get_images(self, obj):
#         return ImageSerializer(obj.imageroom_set.all(), many=True).data


class RoomSerializer(serializers.ModelSerializer):

    district = DistrictSerializer()
    user = AuthenticatedUserSerializer()
    # user = UserSerializer()
    images = serializers.SerializerMethodField('get_images')

    def get_images(self, obj):
        return ImageSerializer(obj.imageroom_set.all(), many=True).data

    class Meta:
        model = Room
        # fields = ['id', 'title', 'description', 'price', 'user', 'category']
        fields = ['id', 'title', 'user', 'images', 'district', 'created_date', 'updated_date', 'price']


class RoomDetailSerializer(RoomSerializer):
    category = CategorySerializer()

    class Meta:
        model = RoomSerializer.Meta.model
        fields = RoomSerializer.Meta.fields + ['name', 'num_of_people', 'area', 'address',
                                               'longitude', 'latitude', 'category']


class OwnerSerializer(serializers.ModelSerializer):
    category = CategorySerializer()
    user = UserSerializer()

    images = serializers.SerializerMethodField('get_images')

    class Meta:
        model = Room
        fields = ['id', 'name', 'address', 'images', 'user', 'longitude', 'latitude', 'category']

    def get_images(self, obj):
        return ImageSerializer(obj.imageroom_set.all(), many=True).data


class PostSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    district = DistrictSerializer()

    class Meta:
        model = Post
        fields = ['id', 'title', 'created_date', 'updated_date', 'user', 'district']


class PostDetailSerializer(PostSerializer):
    class Meta:
        model = PostSerializer.Meta.model
        fields = PostSerializer.Meta.fields + ['description']


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = PostComment
        fields = ['id', 'content', 'created_date', 'updated_date', 'user']

