from api.utils import api_error_response, api_success_response
from rest_framework import permissions, viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from tasks.models import Task
from api.serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    def get_queryset(self):
        user = self.request.user
        return Task.objects.filter(user=user).order_by('-due_date', 'created_at')
    
    @action(detail=True, methods=['patch'], url_path='update')
    def update_task(self, request, pk):
        task = self.get_object()
        serializer = self.get_serializer(task, data=request.data, partial=True)

        # Ensure that the task belongs to the authenticated user
        if task.user != request.user:
            return api_error_response(message="You do not have permission to update this task.", status_code=status.HTTP_403_FORBIDDEN)
        
        if serializer.is_valid():
            serializer.save()
            return api_success_response(data=serializer.data, message="Task successully updated", status_code=status.HTTP_200_OK)
        return api_error_response(message="Invalid data for task update", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)