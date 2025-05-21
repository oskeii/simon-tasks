import logging
from rest_framework import serializers
from tasks.models import Task


logger = logging.getLogger(__name__)


class TaskSerializer(serializers.ModelSerializer):
    
    # Nested serializers for related objects
    component_name = serializers.SerializerMethodField(read_only=True)
    tag_names = serializers.SerializerMethodField(read_only=True)
    has_subtasks = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'estimated_time', 'due_date',
            'completed', 'created_at', 'updated_at', 'completed_at',
            'user', 'parent_task', 'component', 'component_name',
            'tags', 'tag_names', 'has_subtasks'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def get_component_name(self, obj):
        if obj.component:
            return obj.component.name
        return None
    
    def get_tag_names(self, obj):
        return [tag.name for tag in obj.tags.all()]
    
    def get_has_subtasks(self, obj):
        return obj.sub_tasks.exists()
    
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
        # Check that parent_task is not setting itself as parent
        parent_task = data.get('parent_task')
        if (self.instance and parent_task) and (parent_task.id == self.instance.id):
            raise serializers.ValidationError({"parent_task": "A task cannot be its own parent"})
        
        # Check that component belongs to the user
        component = data.get('component')
        if component and component.user.id != self.context['request'].user.id:
            raise serializers.ValidationError({"component": "Invalid component selection"})
        
        # Validate tags
        if 'tags' in data:
            tags = data.get('tags', [])
            user = self.context['request'].user

            # Check that all tags belong to user
            for tag in tags:
                if tag.user.id != user.id:
                    raise serializers.ValidationError({"tags": "One or more tags are invalid"})
        
        return data
    
