from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status


class CustomTokenObtainPairView(TokenObtainPairView):

    pass


@api_view(['POST'])
def refresh_token_view(request):
    try:
        refresh = request.data.get('refresh')
        if not refresh:
            return Response({"error": "Refresh token is required"}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        token = RefreshToken(refresh)
        new_token = token.access_token
        return Response({'access': str(new_token)}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
