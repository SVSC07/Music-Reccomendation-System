from backup_scheduler import get_scheduler
from database import init_db, create_backup
import config
import atexit

def main():
    # Initialize database
    init_db()
    
    # Create initial backup
    if config.BACKUP_ENABLED:
        print("Creating initial backup...")
        create_backup()
        
        # Start backup scheduler
        scheduler = get_scheduler(
            interval_hours=config.BACKUP_INTERVAL_HOURS,
            keep_backups=config.KEEP_BACKUP_COUNT
        )
        scheduler.start()
        
        # Ensure cleanup on exit
        atexit.register(scheduler.stop)
    
    # ...existing code...

if __name__ == '__main__':
    main()