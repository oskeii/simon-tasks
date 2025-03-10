import logging
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import HTTP_HEADER_ENCODING

logger = logging.getLogger(__name__)


class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        logger.debug('Attempting cookie authentication')

        raw_token = self.get_raw_token(request)
        if raw_token is None:
            logger.debug('No token found in cookies')
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
            user = self.get_user(validated_token)
            logger.info(f'User {user.username} authenticated successfully via cookie')
            return user, validated_token
        except AuthenticationFailed as e:
            # an expected authentication failure (invalid token, etc.)
            logger.error(f'Authentication failed: {str(e)}')
            raise
        except Exception as e:
            # an unexpected error (database connection issue, etc.)
            logger.exception(f'Unexpected error during authentication: {str(e)}')
            raise AuthenticationFailed(f'Authentication failed due to an unexpected error')

        

    def get_header(self, request):
        """
        Return None because we're not using headers
        to get the token. Instead, we'll look in the cookies.
        """
        return None
    
    
    def get_raw_token(self, request):
        # check for token in the cookies
        token = request.COOKIES.get('access_token')

        if token is None:
            return None
        
        if isinstance(token, str):
            token = token.encode(HTTP_HEADER_ENCODING)
        
        return token