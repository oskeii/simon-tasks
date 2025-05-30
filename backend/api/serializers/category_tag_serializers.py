import logging
from rest_framework import serializers
from users.models import Category, Tag

logger = logging.getLogger(__name__)


class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'as_workload']
        read_only_fields = ['id']
    
    def create(self, validated_data):
        logger.info(f"Creating new category: {validated_data.get('name')}")
        try:
            return super().create(validated_data)
        except Exception as e:
            logger.exception(f"Failed to create category: {str(e)}")
            raise serializers.ValidationError("Failed to create category")
    
    def update(self, instance, validated_data):
        logger.info(f"Updating category: {instance.name}")
        try:
            return super().update(instance, validated_data)
        except Exception as e:
            logger.exception(f"Failed to update category: {str(e)}")
            raise serializers.ValidationError("Failed to update category")



class TagSerializer(serializers.ModelSerializer):

    class Meta:
        model = Tag
        fields = ['id', 'name']
        read_only_fields = ['id']

    def create(self, validated_data):
        logger.info(f"Creating new tag: {validated_data.get('name')}")
        try:
            return super().create(validated_data)
        except Exception as e:
            logger.exception(f"Failed to create tag: {str(e)}")
            raise serializers.ValidationError("Failed to create tag")
    
    def update(self, instance, validated_data):
        logger.info(f"Updating tag: {instance.name}")
        try:
            return super().update(instance, validated_data)
        except Exception as e:
            logger.exception(f"Failed to update tag: {str(e)}")
            raise serializers.ValidationError("Failed to update tag")