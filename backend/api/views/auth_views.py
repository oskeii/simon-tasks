from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework import status
from django.conf import settings
from datetime import timedelta


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom view to obtain JWT access and refresh tokens and set them as HttpOnly cookies.
    """
    def post(self, request, *args, **kwargs):
        print(f"Request object type: {type(request)}")
        
        # parent class method to generate tokens
        response = super().post(request, *args, **kwargs)

        access = response.data.get('access')
        refresh = response.data.get('refresh')

        # set tokens as HttpOnly cookies
        response.set_cookie(
            key='access_token',
            value=access,
            httponly=True,  # Prevents access to the token by JavaScript (XSS protection)
            secure=settings.DEBUG == False,  # Only set Secure in production (HTTPS)
            samesite='Strict',  # CSRF protection
            # expires=timedelta(minutes=5),  # Adjust token expiration time here
            max_age=timedelta(minutes=5)
        )

        response.set_cookie(
            key='refresh_token',
            value=refresh,
            httponly=True,  # Prevents access to the token by JavaScript (XSS protection)
            secure=settings.DEBUG == False,  # Only set Secure in production (HTTPS)
            samesite='Strict',  # CSRF protection
            # expires=timedelta(hours=1),  # Adjust token expiration time here
            max_age=timedelta(minutes=10)
        )
        print(f"Response object type: {type(response)}")
        # return response with tokens set as cookies
        return response


@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    response = Response("Logged out successfully", status=status.HTTP_200_OK)
    for cookie in request.COOKIES:
        response.delete_cookie(cookie)

    return response


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def refresh_token_view(request):
    # print('made it to view')
    refresh_token = request.COOKIES.get('refresh_token')
    print(refresh_token)
    if not refresh_token:
        return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        refresh = RefreshToken(refresh_token)
        new_access = refresh.access_token
        print(refresh_token)
        print(type(refresh), refresh)
        print(type(new_access),new_access)

        response = Response({'message':'Token refreshed successfully'})
        response.set_cookie(
            key='access_token',
            value=new_access,
            httponly=True,  
            secure=settings.DEBUG == False,  
            samesite='Strict',  
            # expires=timedelta(minutes=5),
            max_age=timedelta(minutes=5)
        )

        return response
    except TokenError as e:
        print('invalid refresh token')
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    

