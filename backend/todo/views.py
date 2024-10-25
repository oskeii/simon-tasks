from django.shortcuts import render
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

def about(request):
    return render(request, 'todo/about.html', context={'title': 'About'})