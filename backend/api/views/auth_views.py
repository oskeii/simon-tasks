import logging
from api.utils import api_error_response, api_success_response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from django.conf import settings
from datetime import timedelta


logger = logging.getLogger(__name__)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom view to obtain JWT access and refresh tokens and set them as HttpOnly cookies.
    """
    def post(self, request, *args, **kwargs):
        logger.debug("Authentication attempt received")

        # parent class method to generate tokens
        response = super().post(request, *args, **kwargs)

        # successful authentication
        access = response.data.get('access')
        refresh = response.data.get('refresh')

        username = request.data.get('username', 'unknown_user')
        logger.info(f"User {username} authenticated successfully")

        # set tokens as HttpOnly cookies
        response.set_cookie(
            key='access_token',
            value=access,
            httponly=True,  # Prevents access to the token by JavaScript (XSS protection)
            secure=settings.DEBUG == False,  # Only set Secure in production (HTTPS)
            samesite='Strict',  # CSRF protection
            max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME']  # timedelta(minutes=5)
        )

        response.set_cookie(
            key='refresh_token',
            value=refresh,
            httponly=True,  
            secure=settings.DEBUG == False, 
            samesite='Strict',  
            max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME']  # timedelta(minutes=30)
        )

        del response.data['access']
        del response.data['refresh']

        response.data['success'] = True
        response.data['message'] = 'Authentication successful'

        logger.debug(f"Authentication cookies set successfully")
        return response


@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    logger.info(f"Logout requested for user {request.user.username if request.user.is_authenticated else '-anonymous-'}")
    response = api_success_response(message="Logged out successfully", status_code=status.HTTP_200_OK)
    
    for cookie in request.COOKIES:
        logger.debug(f"Deleting cookie: {cookie}")
        response.delete_cookie(cookie)

    logger.info("User logged out successfully")
    return response


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token_view(request):
    logger.debug("Token refresh requested")
    refresh_token = request.COOKIES.get('refresh_token')
    
    if not refresh_token:
        logger.warning("Token refresh failed: No refresh token in cookies")
        return api_error_response(message="Refresh token is required", status_code=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Create RefreshToken instance
        refresh = RefreshToken(refresh_token)
        # Get the new access token
        new_access = str(refresh.access_token)
        # Get the new refresh token (generated when ROTATE_REFRESH_TOKENS is True)
        new_refresh = str(refresh)

        logger.info(f"Token refreshed successfully for user ID: {refresh.payload.get('user_id')}")

        response = api_success_response(message="Token refreshed successfully")
        response.set_cookie(
            key='access_token',
            value=new_access,
            httponly=True,  
            secure=settings.DEBUG == False,  
            samesite='Strict',  
            max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME']  # timedelta(minutes=5)
        )

        response.set_cookie(
            key='refresh_token',
            value=new_refresh,
            httponly=True,  
            secure=settings.DEBUG == False, 
            samesite='Strict',  
            max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME']  # timedelta(minutes=30)
        )

        return response
    
    except TokenError as e:
        logger.warning(f"Invalid refresh token: {str(e)}")
        return api_error_response(errors=str(e), status_code=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.exception("Unexpected error during token refresh")
        return api_error_response(message="An unexpected error occurred", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

