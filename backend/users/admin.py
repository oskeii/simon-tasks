from django.contrib import admin
from .models import Profile, Category, Tag

# Register your models here.
admin.site.register(Profile)
admin.site.register(Category)
admin.site.register(Tag)