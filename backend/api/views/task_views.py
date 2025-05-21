import logging
from django.utils import timezone
from datetime import timedelta
from django.db import models
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from tasks.models import Task
from api.serializers import TaskSerializer
from api.utils import api_error_response, api_success_response

logger = logging.getLogger(__name__)


class TaskListCreateView(APIView):
    """
    View for creating and listing user's tasks
    """
    def get(self, request):
        user = request.user
        queryset = Task.objects.filter(user=user)

        # --- APPLY FILTERS based on query parameters ---
        # > Filter by parent task (for subtasks)
        parent_id = request.query_params.get('parent_task')
        if parent_id:
            if parent_id.lower() == 'null':
                # Get top-level tasks (those without a parent)
                queryset = queryset.filter(parent_task__isnull=True)
            else:
                # Get subtasks of a specific parent
                queryset = queryset.filter(parent_task=parent_id)
            
        # > Filter by completion status
        status_filter = request.query_params.get('completed')
        if status_filter:
            if status_filter.lower() == 'true':
                queryset = queryset.filter(completed=True)
            elif status_filter.lower() == 'false':
                queryset = queryset.filter(completed=False)
            
        # > Filter by component (category)
        component_id = request.query_params.get('component')
        if component_id:
            if component_id.lower() == 'null':
                queryset = queryset.filter(component__isnull=True)
            else:
                queryset = queryset.filter(component=component_id)

        # > Filter by due date
        due_date_filter = request.query_params.get('due_date')
        if due_date_filter:
            today = timezone.now().date()

            match due_date_filter:
                case 'past':
                    queryset = queryset.filter(due_date__lt=today)
                case 'overdue': # Only uncomplete tasks
                    queryset = queryset.filter(due_date__lt=today, completed=False)
                case 'today':
                    queryset = queryset.filter(due_date__date=today)
                case 'week':
                    week_from_now = today + timedelta(days=7)
                    queryset = queryset.filter(due_date__gte=today, due_date__lt=week_from_now)
                case 'future':
                    week_from_now = today + timedelta(days=7)
                    queryset = queryset.filter(due_date__gt=week_from_now)
                case 'none':
                    queryset = queryset.filter(due_date__isnull=True)
                case _: # default case
                    pass


        # > Filter by tag
        tag_id = request.query_params.get('tag')
        if tag_id:
            queryset = queryset.filter(tags__id=tag_id)
            
        # > Search by title or description
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(title__icontains=search) |
                models.Q(description__icontains=search)
            )
        # -----------------------------------------------

        # Default ordering: due date, then creation date
        queryset = queryset.order_by(
            models.F('due_date').asc(nulls_last=True),
            '-created_at'
        )

        serializer = TaskSerializer(queryset, many=True, context={'request':request})
        return api_success_response(
            data=serializer.data,
            message="Tasks retrieved successfully",
            status_code=status.HTTP_200_OK
        )
    
    def post(self, request):
        serializer = TaskSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return api_success_response(
                data=serializer.data,
                message="Task created successfully",
                status_code=status.HTTP_201_CREATED
            )
        return api_error_response(
            message="Failed to create task",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
    

class TaskDetailView(APIView):
    """
    View for retrieving, updating, and deleting a specific task
    """
    def get_object(self, pk, user):
        """
        Helper method to get task object
        """
        try:
            task = Task.objects.get(pk=pk)

            if task.user != user:
                return None
            return task
        except Task.DoesNotExist:
            return None
        
    def get(self, request, pk):
        """
        Retrieve a task
        """
        task = self.get_object(pk, request.user)
        if not task:
            return api_error_response(
                message="Task not found for this user",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = TaskSerializer(task, context={'request': request})
        return api_success_response(
            data=serializer.data,
            message="Task retrieved successfully",
            status_code=status.HTTP_200_OK
        )
    
    def put(self, request, pk):
        """
        Task full update
        """
        task = self.get_object(pk, request.user)
        if not task:
            return api_error_response(
                message="Task not found for this user",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = TaskSerializer(task, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return api_success_response(
                data=serializer.data,
                message="Task (fully) updated successfully",
                status_code=status.HTTP_200_OK
            )
        return api_error_response(
            message="Failed to update task",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    def patch(self, request, pk):
        """
        Task partial update
        """
        task = self.get_object(pk, request.user)
        if not task:
            return api_error_response(
                message="Task not found for this user",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = TaskSerializer(task, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return api_success_response(
                data=serializer.data,
                message="Task (partially) updated successfully",
                status_code=status.HTTP_200_OK
            )
        return api_error_response(
            message="Failed to update task",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        task = self.get_object(pk, request.user)
        if not task:
            return api_error_response(
                message="Task not found for this user",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        task.delete()
        return api_success_response(
            message="task deleted successfully",
            status_code=status.HTTP_204_NO_CONTENT
        )


class TaskSubtasksView(APIView):
    """
    View for getting subtasks of a specific task
    """
    def get(self, request, pk):
        try:
            parent_task = Task.objects.get(pk=pk, user=request.user)

            subtasks = Task.objects.filter(parent_task=parent_task).order_by(
                models.F('due_date').asc(nulls_last=True),
                '-created_at'
            )
            serializer = TaskSerializer(subtasks, many=True, context={'request': request})
            return api_success_response(
                data=serializer.data,
                message="Subtasks retrieved successfully",
                status_code=status.HTTP_200_OK
            )
        except Task.DoesNotExist:
            return api_error_response(
                message="Parent task not found for this user",
                status_code=status.HTTP_404_NOT_FOUND
            )


class TopLevelTasksView(APIView):
    """
    View for getting top-level tasks (tasks without a parent)
    """
    def get(self, request):
        tasks = Task.objects.filter(
            user=request.user,
            parent_task__isnull=True
        ).order_by(
            models.F('due_date').asc(nulls_last=True),
            '-created_at'
        )

        serializer = TaskSerializer(tasks, many=True, context={'request':request})
        return api_success_response(
            data=serializer.data,
            message="Top-level tasks retrieved successfully",
            status_code=status.HTTP_200_OK
        )
    
