from django.db import models
from django.contrib.auth.models import User
from PIL import Image

# Create your models here.
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image = models.ImageField(default='profile_pics/default.jpg', upload_to='profile_pics')


    def save(self):
        super().save()

        img = Image.open(self.image.path)
        if img.height > 300 or img.width > 300:
            output_size = (300, 300)
            img.thumbnail(output_size)
            img.save(self.image.path)
    
    
    def __str__(self):
        return f'{self.user.username} Profile'
    

class Component(models.Model):
    # might rename...
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='component')
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True, null=True)
    as_workload = models.BooleanField(default=True)  # should this component be counted towards workload limit?

    def __str__(self):
        return self.name



class Tag(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tags')
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name