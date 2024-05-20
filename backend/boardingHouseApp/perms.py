from rest_framework import permissions


class CommentOwner(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, instance):
        # instance ở đây là comment
        return super().has_permission(request, view) and request.user == instance.user


class AdminPerm(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, instance):
        return super().has_permission(request, view) and request.user.is_superuser is True

