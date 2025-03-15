import logging
from api.utils import api_error_response, api_success_response
from rest_framework import viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from users.models import Profile
from api.serializers import (
    ProfileSerializer, 
    UserSerializer, 
    UserRegistrationSerializer
)

logger = logging.getLogger(__name__)


class UserProfileView(APIView):

    def get(self, request):
        logger.debug(f"Profile retrieval requested by user: {request.user.username}")
        try:
            # Serialize the profile (including nested user data)   
            profile = Profile.objects.get(user=request.user)
            serializer = ProfileSerializer(profile, context={"request": request})
            logger.info(f"Successfully retrieved profile for user: {request.user.username}")

            return api_success_response(
                data=serializer.data,
                message="Profile retrieved successfully",
                status_code=status.HTTP_200_OK
            )
        
        except Profile.DoesNotExist:
            logger.warning(f"Profile not found for user: {request.user.username}")
            return api_error_response(
                message="Profile not found", 
                status_code=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.exception(f"Error retreiving profile for user: {request.user.username}")
            return api_error_response(
                message="An unexpected error occured",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
    def put(self, request):
        """
        Full update (expects all required fields).
        """
        logger.debug(f"FUll profile update requested by user: {request.user.username}")
        logger.debug(f"Request data: {request.data}")

        try:
            profile = Profile.objects.get(user=request.user)
        except Profile.DoesNotExist:
            logger.warning(f"Profile not found for user: {request.user.username}")
            return api_error_response(
                message="Profile not found", 
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = ProfileSerializer(profile, data=request.data, partial=False)
        logger.debug("Serializer initial data: {serializer.initial_data}")

        if serializer.is_valid():
            updated_profile = serializer.save()
            logger.info(f"Profile successfully updated for user: {request.user.username}")

            return api_success_response(
                data=ProfileSerializer(updated_profile).data, 
                message="Profile updated successfully",
                status_code=status.HTTP_200_OK
            )
        
        logger.warning(f"Invalid data for profile update. \nErrors: {serializer.errors}")
        return api_error_response(
            message="Invalid data for profile update", 
            errors=serializer.errors, 
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    def patch(self, request):
        """
        Partial update of the Profile (including nested user fields).
        Use PATCH for partial updates if you only want to update certain fields.
        """
        logger.debug(f"Partial profile update requested by user: {request.user.username}")
        logger.debug(f"Request data: {request.data}")

        try:
            profile = Profile.objects.get(user=request.user)
        except Profile.DoesNotExist:
            logger.warning(f"Profile not found for user: {request.user.username}")
            return api_error_response(
                message="Profile not found", 
                status_code=status.HTTP_404_NOT_FOUND
            )
            
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        logger.debug(f"Serializer initial data: {serializer.initial_data}")

        if serializer.is_valid():
            updated_profile = serializer.save()
            logger.info(f"Profile partially updated for user: {request.user.username}")

            return api_success_response(
                data=ProfileSerializer(updated_profile).data, 
                message="Profile partially updated successfully",
                status_code=status.HTTP_200_OK
            )

        logger.warning(f"Invalid data for profile partial update. \nErrors: {serializer.errors}")
        return api_error_response(
            message="Invalid data for profile update", 
            errors=serializer.errors, 
            status_code=status.HTTP_400_BAD_REQUEST
        )

class UserRegistrationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        logger.debug(f"New user registration requested with username: {request.data.get('username')}")
        serializer = UserRegistrationSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            logger.info(f"User successfully registered: {user.username}")
            return api_success_response(
                data= serializer.data, 
                message='User created successfully',
                status_code=status.HTTP_201_CREATED
            )
        
        logger.warning(f"User registration failed. \nErrors: {serializer.errors}")
        return api_error_response(message="User registration failed.", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)