from rest_framework import viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from users.models import Profile
from api.serializers import ProfileSerializer, UserSerializer


class UserProfileView(APIView):

    def get(self, request):
        print(request)
        try:
            profile = Profile.objects.get(user=request.user)

            profile_data = ProfileSerializer(profile, context={"request": request}).data
            user_data = profile_data.pop('user')

            return Response({'user': user_data, 'profile': profile_data}, status=status.HTTP_200_OK)
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=404)
        
    def post(self, request):
        serializer = ProfileSerializer(data=request.data)
        print(request)
        print(serializer)
        if serializer.is_valid():
            return Response({
                'message': 'User profile updated successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class UserRegistrationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'User created successfully',
                'user': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)