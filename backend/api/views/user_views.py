from rest_framework import viewsets
from users.models import Profile
from api.serializers import ProfileSerializer
from rest_framework.permissions import IsAuthenticated


class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Profile.objects.filter(user=user)