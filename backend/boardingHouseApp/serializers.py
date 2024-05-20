from rest_framework import serializers
from .models import User, Category, Room, Post, ImageRoom, PostComment
from urllib.parse import urljoin


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


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


class RoomSerializer(serializers.ModelSerializer):
    # images = ImageSerializer(many=True)
    images = serializers.SerializerMethodField('get_images')
    user = AuthenticatedUserSerializer()

    class Meta:
        model = Room
        # fields = ['id', 'title', 'description', 'created_date', 'updated_date', 'name',
        #           'price', 'num_of_people', 'area', 'address', 'longitude', 'latitude', 'category', 'image']
        fields = ['id', 'title', 'description', 'images', 'user']

    def get_images(self, obj):
        return ImageSerializer(obj.imageroom_set.all(), many=True).data


class RoomDetailSerializer(serializers.ModelSerializer):
    pass

    # class Meta:
    #     model = RoomSerializer.Meta.model
    #     fields = RoomSerializer.Meta.fields + ['image']


class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'title', 'description', 'created_date', 'updated_date']


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = PostComment
        fields = ['id', 'content', 'created_date', 'updated_date', 'user']

