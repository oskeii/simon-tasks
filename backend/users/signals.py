from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Profile
import os
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        logger.info(f"Creating new profile for user: {instance.username}")
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_profile(sender, instance, **kwargs):
    instance.profile.save()


@receiver(pre_save, sender=Profile)
def delete_old_profile_image(sender, instance, **kwargs):
    """
    Delete the old profile image when a new one is uploaded.
    """
    # Check if we've already processed this instance during this request
    if hasattr(instance, '_image_check_complete'):
        logger.debug(f"Skipping duplicate signal execution (flagged)")
        return
    instance._image_check_complete = True  # Mark as processed to avoid duplicate processing
    
    # Skip for new instances (nothing to delete)
    if not instance.pk:
        logger.debug(f"New profile instance, no old image to delete")
        return
    
    try:
        # Get previous instance from database
        old_instance = Profile.objects.get(pk=instance.pk)

        logger.debug(f"Old image: {old_instance.image}")
        logger.debug(f"New image: {instance.image}")

        # Skip if image hasn't change
        if old_instance.image == instance.image:
            logger.debug(f"Image hasn't been changed, skipping deletion")
            return
        # Skip if image is default image
        if not old_instance.image or ('default.jpg' in str(old_instance.image.path)):
            logger.debug(f"Updating from default image, skipping deletion")
            return
        
        # Convert image path to absolute file path
        old_image_path = old_instance.image.path
        logger.debug(f"Full path to delete: {old_image_path}")

        # Skip if file does not exist
        if not os.path.isfile(old_image_path):
            logger.warning(f"Old image file doesn't exist: {old_image_path}")
            return
        
        # We have a valid image to be deleted
        logger.info(f"Deleting old profile image for user: {instance.user.username}")
        try:
            os.remove(old_instance.image.path)
            logger.debug(f"Old image deleted: {old_instance.image.path}")
        except Exception as e:
            logger.exception(f"Failed to delete file {old_image_path}: {e}")

    except Profile.DoesNotExist:
        logger.warning(f"Profile not found when attempting to delete old image. ID: {instance.pk}")
    except (ValueError, FileNotFoundError) as e:
        # Log error but continue with save process
        logger.warning(f"Error deleting the old profile image for user {instance.user.username}: {e}")
    except Exception as e:
        # Log unexpected errors
        logger.exception(f"Unexpected error when deleting old profile image: {e}")