from django.urls import path
from .views import (
    CustomTokenObtainPairView, refresh_token_view, logout_view,
    CurrentUserView, 
    UserProfileView,
    UserRegistrationView,

    TaskListCreateView,
    TaskDetailView,
    TaskSubtasksView, TopLevelTasksView,

    ComponentListCreateView,
    ComponentDetailView,

    TagListCreateView,
    TagDetailView
)


urlpatterns = [
    # User and Auth URLs
    path('users/me/', CurrentUserView.as_view(), name='current_user'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('register/', UserRegistrationView.as_view(), name='user_registration'),

    path('auth/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', refresh_token_view, name='token_refresh'),
    path('logout/', logout_view, name='logout'),

    # Task URLs
    path('tasks/', TaskListCreateView.as_view(), name='task_list_create'),
    path('tasks/<int:pk>/', TaskDetailView.as_view(), name='task_detail'),
    path('tasks/<int:pk>/subtasks/', TaskSubtasksView.as_view(), name='task_subtasks'),
    path('tasks/top-level/', TopLevelTasksView.as_view(), name='task_toplevel'),

    # Component URLs
    path('components/', ComponentListCreateView.as_view(), name='component_list_create'),
    path('components/<int:pk>/', ComponentDetailView.as_view(), name='component_detail'),

    # Tag URLs
    path('tags/', TagListCreateView.as_view(), name='tag_list_create'),
    path('tags/<int:pk>/', TagDetailView.as_view(), name='tag_detail'),
]
