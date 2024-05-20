from django import forms
from ckeditor_uploader.widgets import CKEditorUploadingWidget
from django.contrib import admin
from django.shortcuts import render
from django.template.response import TemplateResponse
from django.urls import path
from django.utils.safestring import mark_safe
from . import dao
from .models import Room, ImageRoom, User, Street, District, City, Category, Follow, Post, PostComment, RoomComment


class BoardingHouseAdminSite(admin.AdminSite):
    site_header = 'HỆ THỐNG HỖ TRỢ TÌM KIẾM NHÀ TRỌ'
    index_title = 'QUẢN LÍ HỆ THỐNG'
    # site_url = '/admin/user-stats/'

    def stats(self):
        pass

    def get_urls(self):
        return [
                   path('user-stats/', self.stats_view)
               ] + super().get_urls()

    def stats_view(self, request):
        return TemplateResponse(request, 'admin/stats.html', {
            # 'course_stats': dao.count_courses_by_cate(),
            # 'course_count': dao.count_courses(),

        })

    # def my_view(request):
    #     return render(request, 'header.html',)


class RoomForm(forms.ModelForm):
    description = forms.CharField(widget=CKEditorUploadingWidget)

    class Meta:
        model = Room
        fields = '__all__'


class PostForm(forms.ModelForm):
    description = forms.CharField(widget=CKEditorUploadingWidget)

    class Meta:
        model = Post
        fields = '__all__'


class RoomAdmin(admin.ModelAdmin):
    form = RoomForm
    list_display = ['id', 'title', 'created_date', 'updated_date', 'price', 'active']
    list_filter = ['created_date', 'title']
    search_fields = ['title', 'created_date']


class PostAdmin(admin.ModelAdmin):
    form = PostForm
    list_display = ['id', 'title', 'created_date', 'updated_date', 'active']
    list_filter = ['title', 'created_date', 'title']
    search_fields = ['title', 'created_date']


class ImageRoomAdmin(admin.ModelAdmin):
    list_display = ['id', 'created_date', 'updated_date', 'active', 'room']
    readonly_fields = ['img']

    def img(self, instance):
        if instance:
            return mark_safe(f'<img width="200" src="https://res.cloudinary.com/dmjcqxek3/{instance.image}"/>')


class CommentRoomAdmin(admin.ModelAdmin):
    list_display = ['id', 'content', 'created_date', 'updated_date', 'user', 'room']


class CommentPostAdmin(admin.ModelAdmin):
    list_display = ['id', 'content', 'created_date', 'updated_date', 'user', 'post']


class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'role', 'last_login']


# Register your models here.
admin_site = BoardingHouseAdminSite(name='myadmin')
admin_site.register(Room, RoomAdmin)
admin_site.register(ImageRoom, ImageRoomAdmin)
admin_site.register(User, UserAdmin)
admin_site.register(Follow)
admin_site.register(Post, PostAdmin)
admin_site.register(PostComment, CommentPostAdmin)
admin_site.register(RoomComment, CommentRoomAdmin)
admin_site.register(Category)

admin_site.register(Street)
admin_site.register(District)
admin_site.register(City)

