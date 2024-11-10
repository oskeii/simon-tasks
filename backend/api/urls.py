from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import TaskViewSet, ProfileViewSet


router = DefaultRouter()
router.register(r'tasks', TaskViewSet)
router.register(r'profile', ProfileViewSet)

urlpatterns = [
    path('', include(router.urls)),
]