from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import (CustomTokenObtainPairView, refresh_token_view, 
                       TaskViewSet, 
                       ProfileViewSet,
                       UserRegistrationView)

router = DefaultRouter()
router.register(r'tasks', TaskViewSet)
router.register(r'profile', ProfileViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path('register/', UserRegistrationView.as_view(), name='user-registration'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', refresh_token_view, name='token_refresh')
]