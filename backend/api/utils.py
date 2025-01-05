from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import HTTP_HEADER_ENCODING


class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        print('cookie auth')
        raw_token = self.get_raw_token(request)
        if raw_token is None:
            print('no token')
            return None

        validated_token = self.get_validated_token(raw_token)
        # print(validated_token)

        return self.get_user(validated_token), validated_token

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
            # raise AuthenticationFailed('Access token cookie is missing.')
        
        if isinstance(token, str):
            token = token.encode(HTTP_HEADER_ENCODING)
        
        return token