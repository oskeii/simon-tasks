import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from users.models import Component, Tag
from api.serializers import ComponentSerializer, TagSerializer
from api.utils import api_error_response, api_success_response

logger = logging.getLogger(__name__)

# --------- COMPONENT VIEWS -----------
class ComponentListCreateView(APIView):
    """
    View for creating and listing user's components (categories)
    """
    def get(self, request):
        """
        List all components for the user
        """
        components = Component.objects.filter(user=request.user).order_by('name')
        serializer = ComponentSerializer(components, many=True, context={'request':request})

        return api_success_response(
            data=serializer.data,
            message="Components retrieved successfully",
            status_code=status.HTTP_200_OK
        )

    def create(self, request):
        serializer = ComponentSerializer(data=request.data, context={'request':request})
        if serializer.is_valid():
            serializer.save(user=request.user)

            return api_success_response(
                data=serializer.data,
                message="Component created successfully",
                status_code=status.HTTP_201_CREATED
            )
        return api_error_response(
            message="Failed to create component",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )



class ComponentDetailView(APIView):
    """
    API view for retrieving, updating and deleting a specific component
    """
    def get_object(self, pk, user):
        """
        Helper method to get component object
        """
        try:
            component = Component.objects.get(pk=pk)

            if component.user != user:
                return None
            return component
        except Component.DoesNotExist:
            return None
    
    def get(self, request, pk):
        """
        Retrieve a component
        """
        component = self.get_object(pk, request.user)
        if not component:
            return api_error_response(
                message="Component not found for this user",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = ComponentSerializer(component, context={'request':request})
        return api_success_response(
            data=serializer.data,
            message="Component retrieved successfully",
            status_code=status.HTTP_200_OK
        )

    def patch(self, request, pk):
        """
        Component partial update
        """
        component = self.get_object(pk, request.user)
        if not component:
            return api_error_response(
                message="Component not found for this user",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = ComponentSerializer(component, data=request.data, partial=True, context={'request':request})
        if serializer.is_valid():
            serializer.save()
            return api_success_response(
                data=serializer.data,
                message="Component updated successfully",
                status_code=status.HTTP_200_OK
            )
        return api_error_response(
            message="Failed to update component",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    def delete( self, request, pk):
        component = self.get_object(pk, request.user)
        if not component:
            return api_error_response(
                message="Component not found for this user",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        component.delete()
        return api_success_response(
            message="Component deleted successfully",
            status_code=status.HTTP_204_NO_CONTENT
        )


# --------- TAG VIEWS -----------
class TagListCreateView(APIView):
    """
    View for creating and listing user's tags
    """
    def get(self, request):
        """
        List all tags for the user
        """
        tags = Tag.objects.filter(user=request.user).order_by('name')
        serializer = TagSerializer(tags, many=True, context={'request':request})

        return api_success_response(
            data=serializer.data,
            message="Tags retrieved successfully",
            status_code=status.HTTP_200_OK
        )
    
    def create(self, request):
        """
        Create a new tag
        """
        serializer = TagSerializer(data=request.data, context={'request':request})
        if serializer.is_valid():
            serializer.save(user=request.user)

            return api_success_response(
                data=serializer.data,
                message="Tag created successfully",
                status_code=status.HTTP_201_CREATED
            )
        return api_error_response(
            message="Failed to create tag",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class TagDetailView(APIView):
    """
    View for retrieving, updating, and deleting a specific tag
    """

    def get_object(self, pk, user):
        """
        Helper method to get tag object
        """
        try:
            tag = Tag.objects.get(pk=pk)

            if tag.user != user:
                return None
            return tag
        except Tag.DoesNotExist:
            return None
        
    def get(self, request, pk):
        """
        Retrieve a tag
        """
        tag = self.get_object(pk, request.user)
        if not tag:
            return api_error_response(
                message="Tag not found for this user",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = TagSerializer(tag, context={'request':request})
        return api_success_response(
            data=serializer.data,
            message="Tag retrieved successfully",
            status_code=status.HTTP_200_OK
        )
    
    def put(self, request, pk): # probably not needed
        """
        Tag full update
        """
        pass

    def patch(self, request, pk):
        """
        Tag partial update
        """
        tag = self.get_object(pk, request.user)
        if not tag:
            return api_error_response(
                message="Tag not found for this user",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = TagSerializer(tag, data=request.data, partial=True, context={'request':request})
        if serializer.is_valid():
            serializer.save()
            return api_success_response(
                data=serializer.data,
                message="Tag updated successfully",
                status_code=status.HTTP_200_OK
            )
        return api_error_response(
            message="Failed to update tag",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        tag = self.get_object(pk, request.user)
        if not tag:
            return api_error_response(
                message="Tag not found for this user",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        tag.delete()
        return api_success_response(
            message="Tag deleted successfully",
            status_code=status.HTTP_204_NO_CONTENT
        )