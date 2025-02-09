from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from tasks.models import Task
from users.models import Profile
from django.http.request import QueryDict


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
        password = data.get('password')
        confirm_password = data.get('confirm_password')
        if confirm_password != password:
            raise serializers.ValidationError("Passwords do not match.")
        return data
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate_password(self, value):
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(f"Password is invalid: {', '.join(e.messages)}")
        return value
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user
    

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
        # Make a mutable copy of the data if it's a QueryDict
        if isinstance(data, QueryDict):
            print("THIS IS QUERYDICT")
            data = data.copy()
            print(data)

        # Handle flat data and nest it under 'user'
        user_fields = ['username', 'email', 'first_name', 'last_name']
        # user_data = {field: data.pop(field)[0] for field in user_fields if field in data}
        user_data = {}
        for field in user_fields:
            if field in data:
                # print(field, data[field])
                if data[field]:
                    user_data[field] = data.pop(field)[0]
                else:
                    data.pop(field)
                # print('\nuser-data:', user_data)
                # print(data)
        print(user_data)
        data['user'] = user_data
        print(data)
        return data
    
    def update(self, instance, validated_data):
        # pop the nested user data to be handled separately
        print("Validated data:", validated_data)
        validated_data = {field: data[0] for (field, data) in validated_data.items() if isinstance(data, list)}
        print("Reformat validated data:", validated_data)
        user_data = validated_data.pop('user', None)
        print(user_data, type(user_data))

        # Update profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update user fields
        if user_data:
            user = instance.user
            for attr, value, in user_data.items():
                setattr(user, attr, value)
            user.save()

        return instance

    