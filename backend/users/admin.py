from django.contrib import admin
from .models import Profile, Component, Tag

# Register your models here.
admin.site.register(Profile)
admin.site.register(Component)
admin.site.register(Tag)