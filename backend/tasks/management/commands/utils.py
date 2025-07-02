import re
from datetime import timedelta
from django.utils import timezone
from django.utils.dateparse import parse_datetime


def parse_due_date(date_str):
    """Parse various date formats"""
    if not date_str:
        return None
    
    now =  timezone.now()

    # Relative dates
    if date_str.startswith('+') or date_str.startswith('-'):
        # Parse "+2 days", "-1 day", "+3 weeks", etc.
        sign = 1 if date_str.startswith('+') else -1
        parts = date_str[1:].strip().split()
        
        if len(parts) == 2:
            number, unit = parts
            number = int(number) * sign
            
            if unit.startswith('day'):
                return now + timedelta(days=number)
            elif unit.startswith('week'):
                return now + timedelta(weeks=number)
            elif unit.startswith('hour'):
                return now + timedelta(hours=number)
            elif unit.startswith('minute'):
                return now + timedelta(minutes=number)
    
    # Special keywords
    elif date_str == 'today':
        return now
    elif date_str == 'tomorrow':
        return now + timedelta(days=1)
    elif date_str == 'yesterday':
        return now - timedelta(days=1)
    
    # ISO format dates
    elif 'T' in date_str or '-' in date_str:
        try:
            return parse_datetime(date_str)
        except (ValueError, TypeError):
            pass
    
    return None

def parse_duration(duration_str):
    """Parse duration strings like '2h30m', '1h', '45m', '30s'"""
    if not duration_str:
        return None
    
    # Pattern to match combinations like: 2h30m, 1h, 45m, 30s
    pattern = r'(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?'
    match = re.match(pattern, duration_str.strip())

    if not match:
        return None
    hours, minutes, seconds = match.groups()

    return timedelta(
        hours=int(hours) if hours else 0,
        minutes=int(minutes) if minutes else 0,
        seconds=int(seconds) if seconds else 0
    )