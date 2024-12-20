from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (CustomTokenObtainPairView, refresh_token_view, 
                       TaskViewSet, 
                       UserProfileView,
                       UserRegistrationView)

router = DefaultRouter()
router.register(r'tasks', TaskViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('register/', UserRegistrationView.as_view(), name='user_registration'),
    path('auth/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', refresh_token_view, name='token_refresh')
]