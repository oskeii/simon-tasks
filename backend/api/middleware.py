from rest_framework.permissions import IsAuthenticated
from django.http import HttpRequest

class CookieToAuthHeaderMiddleware:
    """
    Middleware that sets the Authorization header from the access token cookie.
    """

    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request: HttpRequest):
        print(0)
        token = request.COOKIES.get('access_token')
        print(1, token)

        request.META['HTTP_AUTHORIZATION'] = 'AUTH HERE'
        print(2, request.META['HTTP_AUTHORIZATION'])

        if token:
            request.META['HTTP_AUTHORIZATION']= f"Bearer {token}"
        print(3, request.META['HTTP_AUTHORIZATION'])  

        response = self.get_response(request)
        return response