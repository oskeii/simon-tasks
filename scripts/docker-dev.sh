#!/bin/bash

case "$1" in
  "up")
    echo "Starting development environment..."
    echo "Frontend: http://localhost:3000"
    echo "Backend: http://localhost:8000"
    echo "Press Ctrl+C to stop"
    docker-compose up --build
    ;;
  "down")
    echo "Stopping development environment..."
    docker-compose down
    ;;
  "logs")
    if [ -z "$2" ]; then
      docker-compose logs -f
    else
      docker-compose logs -f $2
    fi
    ;;
  "shell")
    if [ "$2" = "backend" ]; then
      docker-compose exec backend python manage.py shell
    elif [ "$2" = "db" ]; then
      docker-compose exec db psql -U todouser -d todoapp
    else
      echo "Usage: $0 shell [backend|db]"
    fi
    ;;
  "migrate")
    echo "Running migrations..."
    docker-compose exec backend python manage.py migrate
    ;;
  "demo")
    echo "Setting up demo data..."
    docker-compose exec backend python manage.py setup_demo --no-reset
    ;;
  "test")
    echo "Running backend tests..."
    docker-compose exec backend python -m pytest $2
    ;;
  "clean")
    echo "Cleaning up Docker resources..."
    docker-compose down -v
    docker system prune -f
    ;;
  *)
    echo "Usage: $0 {up|down|logs|shell|migrate|demo|test|clean}"
    echo ""
    echo "Simple commands for development:"
    echo "  up      - Start everything (frontend + backend + database)"
    echo "  down    - Stop everything"
    echo "  logs    - View logs (add 'backend', 'frontend', or 'db' to see specific logs)"
    echo "  shell   - Access Django shell or database shell"
    echo "  migrate - Run database migrations"
    echo "  demo    - Load demo data"
    echo "  test    - Run tests"
    echo "  clean   - Remove everything and start fresh"
    exit 1
    ;;
esac