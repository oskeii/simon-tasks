from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse

# Create your models here.
class Task(models.Model):
    title = models.CharField(max_length=225, default="Untitled")
    description = models.TextField(blank=True, null=True)
    estimated_time = models.DurationField(null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    completed = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    parent_task = models.ForeignKey('self', on_delete=models.CASCADE, null=True, 
                                    blank=True, related_name='sub_tasks')
    dependencies = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='dependent_tasks')
    # category = models.ForeignKey('users.LifeComponent', on_delete=models.SET_NULL, null=True )

    def get_absolute_url(self):
        return reverse('task-detail', kwargs={'pk': self.pk})
    
    def __str__(self):
        return self.title