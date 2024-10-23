from django.shortcuts import render
from datetime import datetime


dummy_tasks = [
    {
        'title': 'task #1',
        'description': 'this is the first task',
        'complete': True,
        'created_at': datetime.now(),
        'other': 'some link',

    },
        {
        'title': 'task #2',
        'description': 'this is the second task',
        'complete': False,
        'created_at': datetime.now(),
        'other': 'some link',

    },
        {
        'title': 'task #3',
        'description': 'this is the third task',
        'complete': False,
        'created_at': datetime.now(),
        'other': 'some link',

    }
]

# Create your views here.
def home(request):
    context = {
        'tasks': dummy_tasks
    }
    return render(request, 'todo/home.html', context=context)

def about(request):
    return render(request, 'todo/about.html', context={'title': 'About'})