from django.shortcuts import render
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.views.generic import (
    ListView, 
    DetailView, 
    CreateView, 
    UpdateView, 
    DeleteView
)
from .models import Task
from datetime import datetime
from django.utils import timezone
from zoneinfo import ZoneInfo


# Create your views here.
def home(request):
    # # Get the user's time zone from their profile or default to UTC
    # user_timezone = request.user.userprofile.timezone if request.user.is_authenticated else 'UTC'

    # # Activate the user's time zone
    # timezone.activate(ZoneInfo(user_timezone))
    timezone.activate('America/Chicago')

    context = {
        'tasks': Task.objects.all()
    }
    return render(request, 'todo/home.html', context=context)

# <app>/<model>_<viewtype>.html
class TaskListView(ListView):
    model = Task
    ordering = ['-created_at']  #newest to oldest

    template_name = 'todo/home.html'
    context_object_name = 'tasks'


class TaskDetailView(DetailView):
    model = Task


class TaskCreateView(LoginRequiredMixin, CreateView):
    model = Task
    fields = ['title', 'description', 'due_date']
    
    def form_valid(self, form):
        form.instance.user = self.request.user
        return super().form_valid(form)
    

class TaskUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Task
    fields = ['title', 'description', 'due_date']
    
    def form_valid(self, form):
        form.instance.user = self.request.user
        return super().form_valid(form)
    
    def test_func(self):
        task = self.get_object()
        if self.request.user == task.user:
            return True
        return False
    

class TaskDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Task
    success_url = '/'  
    
    def test_func(self):
        task = self.get_object()
        if self.request.user == task.user:
            return True
        return False
    

def about(request):
    return render(request, 'todo/about.html', context={'title': 'About'})