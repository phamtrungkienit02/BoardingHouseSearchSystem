from rest_framework import pagination


class RoomPaginator(pagination.PageNumberPagination):
    page_size = 10


class CommentPaginator(pagination.PageNumberPagination):
    page_size = 10