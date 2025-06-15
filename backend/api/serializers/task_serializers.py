import logging
from rest_framework import serializers
from tasks.models import Task


logger = logging.getLogger(__name__)


class SubtaskSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField(read_only=True)
    tag_names = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'estimated_time', 'due_date',
            'completed', 'category_name', 'tag_names'
        ]

    def get_tag_names(self, obj):
        return [tag.name for tag in obj.tags.all()]
    
    def get_category_name(self, obj):
        if obj.category:
            return obj.category.name
        elif obj.parent_task and obj.parent_task.category:
            return obj.parent_task.category.name
        return None



class TaskSerializer(serializers.ModelSerializer):
    
    # Nested serializers for related objects
    has_subtasks = serializers.SerializerMethodField(read_only=True)
    sub_tasks = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField(read_only=True)
    tag_names = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'estimated_time', 'due_date',
            'completed', 'created_at', 'updated_at', 'completed_at',
            'user', 'parent_task', 'has_subtasks', 'sub_tasks', 
            'category', 'category_name', 'tags', 'tag_names'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def get_category_name(self, obj):
        if obj.category:
            return obj.category.name
        return None
    
    def get_tag_names(self, obj):
        return [tag.name for tag in obj.tags.all()]
    
    def get_has_subtasks(self, obj):
        return obj.sub_tasks.exists()
    
    def get_sub_tasks(self, obj):
        return SubtaskSerializer(obj.sub_tasks.all(), many=True, context=self.context).data
    
    def create(self, validated_data):
        logger.info(f"Creating new task: {validated_data.get('title')}")
        try:
            # Extract tags
            tags_data = validated_data.pop('tags', [])
            # Create the task
            task = Task.objects.create(**validated_data)

            # Add any provided tags
            if tags_data:
                task.tags.set(tags_data)
            
            return task
        except Exception as e:
            logger.exception(f"Failed to create task: {str(e)}")
            raise serializers.ValidationError("Failed to create task")

    def update(self, instance, validated_data):
        logger.info(f"Updating task: {instance.title}")
        try:
            # Extract tags
            tags_data = validated_data.pop('tags', None)

            # Update task fields
            for attr, value in validated_data.items():
                setattr(instance, attr, value)

            # save the task
            instance.save()
            # Update tags if provided
            if tags_data:
                instance.tags.set(tags_data)

            return instance
        except Exception as e:
            logger.exception(f"Failed to update task: {str(e)}")
            raise serializers.ValidationError("Failed to update task")

    def validate(self, data):
        parent_task = data.get('parent_task')
        # Check that parent_task is not setting itself as parent
        if (self.instance and parent_task) and (parent_task.id == self.instance.id):
            raise serializers.ValidationError({"parent_task": "A task cannot be its own parent"})
        # Check that sub_task is not exceeding max depth of 1
        if parent_task and parent_task.parent_task:
            raise serializers.ValidationError({"parent_task": "Subtasks cannot have their own subtasks"})
        
        # Check that category belongs to the user
        category = data.get('category')
        if category and category.user.id != self.context['request'].user.id:
            raise serializers.ValidationError({"category": "Invalid category selection"})
        
        # Validate tags
        if 'tags' in data:
            tags = data.get('tags', [])
            user = self.context['request'].user

            # Check that all tags belong to user
            for tag in tags:
                if tag.user.id != user.id:
                    raise serializers.ValidationError({"tags": "One or more tags are invalid"})
        
        return data
    
