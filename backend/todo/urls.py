from django.urls import path
from .views import (
    TaskListView, 
    TaskDetailView, 
    TaskCreateView, 
    TaskUpdateView,
    TaskDeleteView
)
from . import views

urlpatterns = [
    path('', TaskListView.as_view(), name='todo-home'),
    path('task/<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
    path('task/new/', TaskCreateView.as_view(), name='task-create'),  #<model>_<form>.html
    path('task/<int:pk>/update/', TaskUpdateView.as_view(), name='task-update'), 
    path('task/<int:pk>/delete/', TaskDeleteView.as_view(), name='task-delete'), #<model>_confirm_delete.html
    path('about/', views.about, name='todo-about'),
]
