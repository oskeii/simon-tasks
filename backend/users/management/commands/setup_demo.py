import os
import json
from pathlib import Path
from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.conf import settings
from django.contrib.auth.models import User
from users.models import Category, Tag
from tasks.models import Task
from .utils import parse_due_date, parse_duration

class Command(BaseCommand):
    help = 'Resets database and creates demo data for the application'
    # help = 'Sets up demo data for the application (optional)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--no-reset',
            action='store_true',
            help='Skip database reset, just add demo data',
        )

        parser.add_argument(
            '--skip-admin',
            action='store_true',
            help='Skip creating admin user',
        )

        parser.add_argument(
            '--user',
            type=str,
            default='A',
            help='Select a specific user to create from demo data (A, B, C, or D)'
        )

    def handle(self, *args, **options):
        if not options['no_reset']:
            self.stdout.write('Resetting database...')
            self.reset_database()

        self.stdout.write('Creating demo data...')

        # Create admin user only if it doesn't exist
        if not options['skip_admin']:
            admin_user, created = User.objects.get_or_create(
                username='admin',
                defaults={
                    'email': 'admin@example.com',
                    'is_staff': True,
                    'is_superuser': True
                }
            )
            if created:
                admin_user.set_password('adminpass123')
                admin_user.save()
                self.stdout.write(
                    self.style.SUCCESS('✓ Admin user created')
                )
            else:
                self.stdout.write(
                    self.style.WARNING('✓ Admin user already exists')
                )
            self.stdout.write('🔧 Admin panel: http://localhost:8000/admin/')
            self.stdout.write('👤 Admin user: admin / adminpass123')

        # Create demo user, tasks, etc.
        self.stdout.write(f'User Selected: {options['user']}')
        username = self.load_from_json(options['user'])

        self.stdout.write(self.style.SUCCESS('✅ Demo setup complete!'))
        self.stdout.write(f'👤 Demo user: {username} / demopass123')
        self.stdout.write('🚀 Try it: http://localhost:3000')


    def reset_database(self):
        """Delete database and run fresh migrations"""
        db_path = settings.DATABASES['default']['NAME']

        if os.path.exists(db_path):
            os.remove(db_path)
            self.stdout.write('  ✓ Database file deleted')

        call_command('migrate', verbosity=0)
        self.stdout.write('  ✓ Database recreated')


    def load_from_json(self, selected_user):
        """Load demo data from JSON file"""
        data_file = Path(__file__).parent / 'data' / f'demo_{selected_user}.json'
        try:
            with open(data_file, 'r') as f:
                data = json.load(f)
        except FileNotFoundError:
            self.stdout.write( self.style.ERROR(f'Demo data file not found: {data_file}') )
            return

        # Check if user already exists
        username = data['user']['username']
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': data['user']['email']
            }
        )
        if created:
            user.set_password(data['user']['password'])
            user.save()
            self.stdout.write(f'✓ Created new user: {username}')
        else:
            self.stdout.write(f'✓ User {username} already exists, skipping creation')
            return username


        # Create categories
        categories = {}
        for cat_data in data['categories']:
            cat = Category.objects.create(user=user, **cat_data)
            categories[cat_data['name']] = cat

        # Create tags
        tags = {}
        for tag_data in data['tags']:
            tag = Tag.objects.create(user=user, **tag_data)
            tags[tag_data['name']] = tag

        # Create tasks
        created_tasks = {}
        for task_data in data['tasks']:
            # Extract and parse fields
            tag_names = task_data.pop('tags', [])
            cat_name = task_data.pop('category')
            estimated_time_str = task_data.pop('estimated_time', None)
            due_date_str = task_data.pop('due_date', None)

            # Parse time fields
            estimated_time = parse_duration(estimated_time_str)
            due_date = parse_due_date(due_date_str)
            
            # Create task
            task = Task.objects.create(
                user=user,
                category=categories[cat_name],
                estimated_time=estimated_time,
                due_date=due_date,
                **task_data
            )
            # Add tags
            task.tags.set([ tags[name] for name in tag_names ])
            # Store for subtask creation
            created_tasks[task.title] = task

        # Create subtasks
        if 'subtasks' in data:
            for subtask_group in data['subtasks']:
                parent_title = subtask_group['parent_title']
                parent_task = created_tasks.get(parent_title)

                if parent_task:
                    # create task
                    for subtask_data in subtask_group['subtasks']:
                        estimated_time_str = subtask_data.pop('estimated_time', None)
                        estimated_time = parse_duration(estimated_time_str)

                        Task.objects.create(
                            user=user,
                            parent_task=parent_task,
                            estimated_time=estimated_time,
                            **subtask_data
                        )

        self.stdout.write('✓ Demo data loaded from JSON')
        self.stdout.write(f'✓ Created user "demo" with {len(created_tasks)} tasks')

        # Show some examples of parsed times
        for task in Task.objects.filter(user=user)[:3]:
            if task.estimated_time:
                self.stdout.write(f'  - "{task.title}": {task.estimated_time}')
            if task.due_date:
                self.stdout.write(f'    Due: {task.due_date.strftime("%Y-%m-%d %H:%M")}')

        return username