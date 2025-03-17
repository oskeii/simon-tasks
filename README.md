# Todo Application

A full-stack task management application with advanced features including sub-tasks, dependencies, and customizable categories.

## Technologies Used
- **Backend**: Django, Django REST Framework, JWT Authentication
- **Frontend**: React.js, Axios
- **Database**: SQLite (development), PostgreSQL (planned for production)
- **Tools**: Git, Postman

## Features
- Secure user authentication with JWT tokens and HTTP-only cookies
- User profile management with image upload
- Task creation, editing, deletion, and categorization
- Sub-task functionality and task dependencies
- Custom task categories and tagging system

## Screenshots
*Coming soon. once the UI is more developed...*

## Local Development Setup
```bash
# Clone the repository
git clone https://github.com/oskeii/my-todo-app.git
cd my-todo-app

# BACKEND setup
pip install pipenv

# Install dependencies
pipenv install --ignore-pipfile
#    `--ignore-pipfile` ensures that the exact versions in the Pipfile.lock are installed, avoiding version mismatches.
pipenv shell

# Navigate to backend directory
cd backend

# Run migrations
python manage.py migrate

# Start the server
python manage.py runserver


# FRONTEND setup
cd frontend
npm install
npm run dev
```

## Project Status
Currently in active development. Core user authentication is complete, and task CRUD operations are being implemented.