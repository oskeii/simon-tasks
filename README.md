# Todo Application
A full-stack task management application built in the hopes of simplifying my own productivity workflow. Designed with a philosophy that aims to increase productivity and executive coordination whilst decreasing mental strain and energy burnout. The system reduces context-switching through task-batching, supports energy-budgetting, and even eliminates the dilemma of infinite choice. Projected features include smart task suggestions, time-logging, activity tracking with time/energy/context correlations, and daily check-ins for workflow optimization.

## Features
- **Secure Authentication:** JWT-based authentication with HTTP-only cookies for enhanced XSS protection
- **User Profile Management:** Complete profile system with image upload and customization
- **Advanced Task Management:** Create, edit, delete, and organize tasks with rich metadata
- **Hierarchical Organization:** Sub-task functionality with parent-child relationships
- **Smart Categorization:** Custom categories and flexible tagging system for task organization

## Advanced Features (In Development)
- Search & Filter: Comprehensive search, filtering, and sorting capabilities
- Multi-View Interface: Category views, tag views, and custom filtered views
- Calendar Integration: Weekly/daily calendar views with drag-and-drop scheduling
- Smart Planning: Akiflow-inspired planning buckets for task prioritization
- Batch Operations: Multi-select operations for efficient task management

## Screenshots
*Coming soon*


## Technologies Used
**Backend**
- **Framework:** Django 5.1+ with Django REST Framework
- **Authentication:** JWT with custom cookie-based implementation
- **Database:** SQLite (development)
  
**Frontend**
- **Framework:** React.js with modern hooks and functional components
- **HTTP Client:** Axios for API communication
- **State Management:** Custom hooks for efficient state management
  
**Development Tools**
- **API Testing:** Postman for endpoint validation
- **Package Management:** Pipenv (Python), npm (Node.js)

## Project Structure
```bash
my-todo-app/
├── backend/                    # Django backend
│   ├── api/                   # API app with views and URLs
│   ├── tasks/                 # Task models and business logic
│   ├── users/                 # User models and authentication
│   ├── backend/               # Project settings and configuration
│   └── media/                 # User uploaded files
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Main application pages
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API service layer
│   │   └── utils/            # Utility functions
│   ├── public/               # Static assets
│   └── package.json          # Dependencies and scripts
└── README.md                 # Project documentation
```

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
