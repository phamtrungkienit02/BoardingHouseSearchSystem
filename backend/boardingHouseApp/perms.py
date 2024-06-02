from rest_framework import permissions


class CommentOwner(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, instance):
        # instance ở đây là comment
        return super().has_permission(request, view) and request.user == instance.user


# class AdminPerm(permissions.IsAuthenticated):
#     def has_object_permission(self, request, view, instance):
#         # return super().has_permission(request, view) and request.user.is_superuser is True
#         return bool(request.user and request.user.is_superuser)

# cho cả admin và chủ trọ được đăng phòng trọ
class OwnerPerm(permissions.IsAuthenticated):
    # def has_object_permission(self, request, view, instance):
        #return super().has_permission(request, view) and request.user.role == 'OWNER'
    def has_permission(self, request, view):
        return super().has_permission(request, view) and (request.user.role in ['OWNER']
                                                          or request.user.is_superuser is True)



