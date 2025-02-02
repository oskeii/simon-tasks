from rest_framework import viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from users.models import Profile
from api.serializers import (
    ProfileSerializer, 
    UserSerializer, 
    UserRegistrationSerializer
)


class UserProfileView(APIView):

    def get(self, request):
        print("---- UserProfileView (get) -----\n\tREQUEST:\n", request)
        try:
            profile = Profile.objects.get(user=request.user)
            # Serialize the profile (including nested user data)   
            serializer = ProfileSerializer(profile, context={"request": request})
            # profile_data = ProfileSerializer(profile, context={"request": request}).data
            # user_data = profile_data.pop('user')

            return Response(
                serializer.data,
                # {'user': user_data, 'profile': profile_data},
                status=status.HTTP_200_OK
            )
        
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
        
    def put(self, request):
        """
        Full update (similar logic, but expects all required fields).
        """
        print("---- UserProfileView (put) -----\n\tREQUEST DATA:\n", request.data)
        try:
            profile = Profile.objects.get(user=request.user)
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ProfileSerializer(profile, data=request.data, partial=False)
        print("Serializer initial data:", serializer.initial_data)
        if serializer.is_valid():
            updated_profile = serializer.save()
            return Response(ProfileSerializer(updated_profile).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request):
        """
        Partial update of the Profile (including nested user fields).
        Use PATCH for partial updates if you only want to update certain fields.
        """
        print("---- UserProfileView (patch) -----\n\tREQUEST DATA:\n", request.data)
        try:
            profile = Profile.objects.get(user=request.user)
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        print("Serializer initial data:", serializer.initial_data)
        if serializer.is_valid():
            updated_profile = serializer.save()
            return Response(ProfileSerializer(updated_profile).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserRegistrationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'User created successfully',
                'user': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)