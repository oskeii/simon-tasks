import logging
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, F, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from tasks.models import Task
from api.serializers import TaskSerializer, SubtaskSerializer
from api.utils import api_error_response, api_success_response

logger = logging.getLogger(__name__)


class TaskListCreateView(APIView):
    """
    View for creating and listing user's tasks
    """
    def apply_filters(self, queryset, params):
        """
        Helper function to apply filters to queryset
        """
        # > Filter by parent task (for subtasks)
        parent_id = params.get('parent_task')
        if parent_id:
            if parent_id.lower() == 'null':
                # Get top-level tasks (those without a parent)
                queryset = queryset.filter(parent_task__isnull=True)
            else:
                # Get subtasks of a specific parent
                queryset = queryset.filter(parent_task=parent_id)
            
        # > Filter by completion status
        status_filter = params.get('status')
        if status_filter:
            if status_filter.lower() == 'true':
                queryset = queryset.filter(completed=True)
            elif status_filter.lower() == 'false':
                queryset = queryset.filter(completed=False)
            
        # > Filter by category
        category_id = params.get('category')
        if category_id:
            if category_id.lower() == 'null':
                queryset = queryset.filter(category__isnull=True)
            else:
                queryset = queryset.filter(category=category_id)

        # > Filter by due date
        due_date_filter = params.get('due_date')
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
        tag_id = params.get('tag')
        if tag_id:
            queryset = queryset.filter(tags__id=tag_id)
            
        # > SEARCH by title or description
        search = params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search)
            )

        return queryset


    def apply_sorting(self, queryset, sorting):
        """
        Helper function to apply sorting to queryset
        Note: Any previous sorting on queryset will be overwritten
        """
        field = sorting[0]
        ordering = sorting[1]
        sort_by = None
        secondary_sort = F('due_date').asc(nulls_last=True)

        match field:
            case 'dueDate':
                sort_by = 'due_date'
                secondary_sort = '-created_at'
            case 'categoryPriority':
                sort_by = 'category__priority'
            case 'duration':
                sort_by = 'estimated_time'
            
            # Otherwise, sort directly and return early
            case 'createdAt':
                return queryset.order_by(F('-created_at'))
            case 'numOfSubtasks':
                queryset = queryset.annotate(subtask_count=Count('sub_tasks'))
                sort_expr = (
                    F('subtask_count').desc(nulls_last=True)
                    if ordering == 'desc'
                    else F('subtask_count').asc(nulls_first=True)
                )
                return queryset.order_by(sort_expr, secondary_sort)
            case _:
                return queryset
            
        if sort_by:
            sort_expr = (
                F(sort_by).desc(nulls_last=True)
                if ordering == 'desc'
                else F(sort_by).asc(nulls_first=True)
            )
            queryset = queryset.order_by(sort_expr, secondary_sort)

        return queryset


    def get(self, request):
        user = request.user
        queryset = Task.objects.filter(user=user)  # will prefetch subtasks

        sorting = request.query_params.getlist('sort_by')
        logger.debug(f"SORTING Query Params received: {sorting}")

        # --- APPLY FILTERS based on query parameters ---
        if request.query_params:
            logger.debug(f"Checking for filtering parameters: {request.query_params}")
            queryset = self.apply_filters(queryset, params=request.query_params)
        # -----------------------------------------------
        # PRE-FETCH all related data
        queryset = queryset.select_related(
            'category', 'parent_task__category'
        ).prefetch_related(
            'tags',
            'sub_tasks'
        )
        # -----------------------------------------------

        # --- APPLY SORTING based on query parameters ---
        if sorting:
            logger.debug(f"Applying sorting to queryset")
            queryset = self.apply_sorting(queryset, sorting)
        else:
            # Default ORDERING: due date, then creation date
            logger.debug(f"No sorting parameters found. Applying default sorting to queryset")
            queryset = queryset.order_by(
                F('due_date').asc(nulls_last=True),
                '-created_at'
            )

        # -----------------------------------------------
        serializer = TaskSerializer(queryset, many=True, context={'request':request})
        
        # ORGANIZE for the response data structure
        incomplete_sorted = []
        complete_sorted = []
        all_tasks = {}

        for task in serializer.data:
            all_tasks[task['id']] = task  # insert dictionary values as {task_id: task_data}
            if not task['parent_task']:  # This task is not a subtask
                if task['completed']:
                    complete_sorted.append(task['id'])
                else:
                    incomplete_sorted.append(task['id'])
        
        response_data = {
            'total_count': len(serializer.data),
            'parent_count': len(incomplete_sorted) + len(complete_sorted),
            'incomplete_count': len(incomplete_sorted),
            'complete_count': len(complete_sorted),
            'incomplete_tasks': incomplete_sorted,
            'complete_tasks': complete_sorted,
            'tasks': all_tasks
        } 
        
        return api_success_response(
            data=response_data,
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
            task = Task.objects.select_related('category').prefetch_related('tags', 'sub_tasks__tags').get(pk=pk)

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

    def cleanup_object(self, request, subtask_ids, keep_subtasks=True):
        """
        Helper method for task deletion
        Returns dictionary with updated data for subtasks.
        """
        if not subtask_ids:
            return {'keep_subtasks': True, 'sub_count': 0}
        
        if not keep_subtasks:
            Task.objects.filter(id__in=subtask_ids).delete()
            response_data = {
                'keep_subtasks': False,
                'sub_count': len(subtask_ids),
                'deleted_subtasks': subtask_ids
            }
            return response_data
        
        # Keeping subtasks; Query subtasks by ID to get their updated state
        updated_subtasks = Task.objects.filter(id__in=subtask_ids).select_related(
                'category'
            ).prefetch_related('tags').order_by(
                F('due_date').asc(nulls_last=True),
                '-created_at'
            )
        
        serializer = TaskSerializer(updated_subtasks, many=True, context={'request':request})
        # ORGANIZE for the response data structure
        incomplete_sorted = []
        complete_sorted = []
        subtasks = {}

        for item in serializer.data:
            subtasks[item['id']] = item
            if item['completed']:
                complete_sorted.append(item['id'])
            else:
                incomplete_sorted.append(item['id'])
        
        response_data = {
            'keep_subtasks': True,
            'sub_count': len(serializer.data),
            'incomplete_count': len(incomplete_sorted),
            'complete_count': len(complete_sorted),
            'incomplete_tasks': incomplete_sorted,
            'complete_tasks': complete_sorted,
            'tasks': subtasks
        }
        return response_data
    

    def delete(self, request, pk):
        task = self.get_object(pk, request.user)
        logger.debug(f"task to delete: {task}")
        if not task:
            return api_error_response(
                message="Task not found for this user",
                status_code=status.HTTP_404_NOT_FOUND
            )
        # Get the keep_subtasks parameter from query params (defaults to True)
        keep_subtasks = request.query_params.get('keep_subtasks', 'true').lower() == 'true'
        # Get subtask IDs before task deletion
        subtask_ids = None
        if task.sub_tasks.exists():
            logger.debug("Task to be deleted has subtasks")
            subtask_ids = list(task.sub_tasks.values_list('id', flat=True))
        
        task.delete()

        # Send updated subtask data in response
        response_data = self.cleanup_object(request, subtask_ids, keep_subtasks)
        return api_success_response(
            data=response_data,
            message="Task deleted successfully",
            status_code=status.HTTP_200_OK
        )


class TaskSubtasksView(APIView):
    """
    View for getting subtasks of a specific task
    """
    def get(self, request, pk):
        try:
            parent_task = Task.objects.get(pk=pk, user=request.user)

            subtasks = Task.objects.filter(parent_task=parent_task).order_by(
                F('due_date').asc(nulls_last=True),
                '-created_at'
            )
            serializer = TaskSerializer(subtasks, many=True, context={'request': request})

            subtasks_sorted = []
            subtasks_data = {}
            for task in serializer.data:
                subtasks_sorted.append(task['id'])
                subtasks_data[task['id']] = task  # insert dictionary values as {task_id: task_data}

            return api_success_response(
                data={'task_ids': subtasks_sorted, 'tasks': subtasks_data},
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
            F('due_date').asc(nulls_last=True),
            '-created_at'
        )

        serializer = TaskSerializer(tasks, many=True, context={'request':request})
        return api_success_response(
            data=serializer.data,
            message="Top-level tasks retrieved successfully",
            status_code=status.HTTP_200_OK
        )
    
