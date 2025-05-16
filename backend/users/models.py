from django.db import models
from django.contrib.auth.models import User
from PIL import Image
import os
import uuid
import logging

logger = logging.getLogger(__name__)

def get_profile_image_path(instance, filename):
    """
    Generate a unique filename for profile images.
    Format: 'profile_pics/username_uuid.extension'
    """
    # Get file extension
    ext = filename.split('.')[-1]

    # Generate new filename with username and uuid
    new_filename = f"{instance.user.username}_{uuid.uuid4().hex}.{ext}"

    # Return file path
    return os.path.join('profile_pics', new_filename)


# Create your models here.
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image = models.ImageField(default='profile_pics/default.jpg', upload_to=get_profile_image_path)


    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        # Resize image if needed
        if self.image:
            try:
                img = Image.open(self.image.path)
                if img.height > 300 or img.width > 300:
                    output_size = (300, 300)
                    img.thumbnail(output_size)
                    img.save(self.image.path)
            except Exception as e:
                logger.exception(f"Error resizing profile image for user {self.user.username}: {e}")
    
    def __str__(self):
        return f'{self.user.username} Profile'
    

class Component(models.Model):
    # might rename...
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='components')
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