import logging
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

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )
        
        except Profile.DoesNotExist:
            logger.warning(f"Profile not found for user: {request.user.username}")
            return Response(
                {"error": "Profile not found"}, 
                status=status.HTTP_404_NOT_FOUND
                )
        except Exception as e:
            logger.exception(f"Profile not found for user: {request.user.username}")
            return Response(
                {"error": "An unexpected error occured"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
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
            return Response(
                {"error": "Profile not found"}, 
                status=status.HTTP_404_NOT_FOUND
                )
        
        serializer = ProfileSerializer(profile, data=request.data, partial=False)
        logger.debug("Serializer initial data: {serializer.initial_data}")

        if serializer.is_valid():
            updated_profile = serializer.save()
            logger.info(f"Profile successfully updated for user: {request.user.username}")

            return Response(ProfileSerializer(updated_profile).data, status=status.HTTP_200_OK)
        
        logger.warning(f"Invalid data for profile update. \nErrors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
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
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        logger.debug(f"Serializer initial data: {serializer.initial_data}")

        if serializer.is_valid():
            updated_profile = serializer.save()
            logger.info(f"Profile partially updated for user: {request.user.username}")

            return Response(ProfileSerializer(updated_profile).data, status=status.HTTP_200_OK)

        logger.warning(f"Invalid data for profile partial update. \nErrors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserRegistrationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        logger.debug(f"New user registration requested with username: {request.data.get('username')}")
        serializer = UserRegistrationSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            logger.info(f"User successfully registered: {user.username}")
            return Response({
                'message': 'User created successfully',
                'user': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        logger.warning(f"User registration failed. \nErrors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)