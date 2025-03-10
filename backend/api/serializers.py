import logging
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from tasks.models import Task
from users.models import Profile
from django.http.request import QueryDict

logger = logging.getLogger(__name__)


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'



class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)


    class Meta:
        model = User
        fields = [
            'email', 'username', 
            'password', 'confirm_password', 
            'first_name', 'last_name'
            ]

    def validate(self, data):
        logger.debug(f"Validating user registration data for username: {data.get('username')}")
        password = data.get('password')
        confirm_password = data.get('confirm_password')
        if confirm_password != password:
            logger.warning(f"Password mismatch during registration for username: {data.get('username')}")
            raise serializers.ValidationError("Passwords do not match.")
        return data
    
    def validate_email(self, value):
        logger.debug(f"Validating email: {value}")
        if User.objects.filter(email=value).exists():
            logger.warning(f"Registration attempt with existing email: {value}")
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate_password(self, value):
        logger.debug("Validating password")
        try:
            validate_password(value)
            return value
        except ValidationError as e:
            logger.warning("Password validation failed", extra={"errors": e.messages})
            raise serializers.ValidationError(f"Password is invalid: {', '.join(e.messages)}")
    
    def create(self, validated_data):
        logger.info(f"Creating new user: {validated_data.get('username')}")
        try:
            validated_data.pop('confirm_password')
            user = User.objects.create_user(
                username=validated_data['username'],
                password=validated_data['password'],
                email=validated_data['email'],
                first_name=validated_data.get('first_name', ''),
                last_name=validated_data.get('last_name', '')
            )
            return user
        except Exception as e:
            logger.exception(f"Failed to create user: {validated_data.get('username')}")
            raise
        

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'username',
            'first_name',
            'last_name'
        ]


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Profile
        fields = [
            'id',
            'user',
            'image',
            # Add other Profile fields here
            ]
    
    def to_internal_value(self, data):
        logger.debug("Converting profile data to internal value")
        # Make a mutable copy of the data if it's a QueryDict
        if isinstance(data, QueryDict):
            logger.debug("Converting QueryDict to mutable dictionary")
            data = data.copy()

        # Handle flat data and nest it under 'user'
        user_fields = ['username', 'email', 'first_name', 'last_name']

        user_data = {}
        for field in user_fields:
            if field in data:
                if data[field]:
                    user_data[field] = data.pop(field)[0]
                else:
                    data.pop(field)

        logger.debug(f"Extracted user data: {user_data}")
        data['user'] = user_data

        return data
    
    def update(self, instance, validated_data):
        logger.info(f"Updating profile for user: {instance.user.username}")
        try:
            # pop the nested user data to be handled separately
            validated_data = {field: data[0] for (field, data) in validated_data.items() if isinstance(data, list)}
            logger.debug(f"Reformatted validated data: {validated_data}")

            user_data = validated_data.pop('user', None)

            # Update profile fields
            for attr, value in validated_data.items():
                logger.debug(f"Setting profile attribute {attr} = {value}")
                setattr(instance, attr, value)

            instance.save()
            logger.debug("Profile updated successfully")

            # Update user fields
            if user_data:
                user = instance.user
                for attr, value, in user_data.items():
                    logger.debug(f"Setting user attribute {attr} = {value}")
                    setattr(user, attr, value)

                user.save()
                logger.debug("User updated successfully")

            return instance
        except Exception as e:
            logger.exception(f"Failed to update profile for user: {instance.user.username}")
            raise

    