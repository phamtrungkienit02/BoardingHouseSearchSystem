from ckeditor.fields import RichTextField
from django.contrib.auth.models import AbstractUser
from django.db import models
from cloudinary.models import CloudinaryField


# Create your models here. address
class BaseModel(models.Model):
    created_date = models.DateTimeField(auto_now_add=True, null=True)
    updated_date = models.DateTimeField(auto_now=True, null=True)
    active = models.BooleanField(default=True)

    class Meta:
        abstract = True


class User(AbstractUser):
    avatar = CloudinaryField(null=True)
    # follow = models.ManyToManyField('User', blank=True, symmetrical=False, related_name='userFollow')
    # address = models.CharField(max_length=255, null=True)
    phone_number = models.CharField(max_length=11, null=True, unique=True)

    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Quản trị viên'
        CUSTOMER = 'CUSTOMER', 'Khách'
        OWNER = 'OWNER', 'Chủ nhà'

    role = models.CharField(max_length=50, choices=Role.choices, default=Role.CUSTOMER)

    def get_role_name(self):
        return dict(User.Role.choices)[self.role]


class Follow(BaseModel):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    be_followed = models.ForeignKey(User, on_delete=models.CASCADE, related_name='be_followed')

    class Meta:
        unique_together = ('follower', 'be_followed')


class Category(models.Model):
    name = models.CharField(max_length=255, null=True)

    def __str__(self):
        return self.name


# class PostType(models.Model):
#     name = models.CharField(max_length=255, null=True)
#
#     def __str__(self):
#         return self.name


class BasePost(BaseModel):
    title = models.CharField(max_length=255)
    description = models.TextField()
    # post_type = models.ForeignKey(PostType, on_delete=models.RESTRICT)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    # city = models.ForeignKey('City', on_delete=models.RESTRICT)
    district = models.ForeignKey('District', on_delete=models.RESTRICT, null=True)
    # street = models.ForeignKey('Street', on_delete=models.RESTRICT)

    class Meta:
        abstract = True


class Post(BasePost):

    def __str__(self):
        return self.title


class Room(BasePost):
    name = models.CharField(max_length=100, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.0, null=True)
    num_of_people = models.SmallIntegerField(default=0, null=True)
    area = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    address = models.CharField(max_length=100, null=True)
    # vi do
    longitude = models.CharField(max_length=50, null=True)
    latitude = models.CharField(max_length=50, null=True)
    category = models.ForeignKey(Category, on_delete=models.RESTRICT, null=True)
    # post = models.OneToOneField(Post, on_delete=models.CASCADE, primary_key=True, null=True)
    # post = models.ForeignKey(Post, on_delete=models.CASCADE, null=True, unique=True)

    def __str__(self):
        return self.title


class ImageRoom(BaseModel):
    image = CloudinaryField(null=True)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)

    @property
    def url(self):
        return self.image.url

    def __str__(self):
        return self.url


class BaseComment(BaseModel):
    content = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reply = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE)

    class Meta:
        abstract = True


class PostComment(BaseComment):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    # reply = models.ManyToManyField('PostComment', symmetrical=False, related_name='ReplyComment', blank=True)

    def __str__(self):
        return self.content


class RoomComment(BaseComment):
    room = models.ForeignKey(Room, on_delete=models.CASCADE)

    def __str__(self):
        return self.content


# thong tin tp, quan, huyen
class NameBase(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

    class Meta:
        abstract = True


class City(NameBase):
    pass


class District(NameBase):
    city = models.ForeignKey(City, on_delete=models.CASCADE)


# class Street(NameBase):
#     District = models.ForeignKey(District, on_delete=models.CASCADE)
