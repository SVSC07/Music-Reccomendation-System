import threading
import time
from datetime import datetime
from database import create_backup, cleanup_old_backups

class BackupScheduler:
    """Scheduler for periodic database backups"""
    
    def __init__(self, interval_hours=24, keep_backups=10):
        self.interval_hours = interval_hours
        self.keep_backups = keep_backups
        self.running = False
        self.thread = None
    
    def start(self):
        """Start the backup scheduler"""
        if self.running:
            print("Backup scheduler is already running")
            return
        
        self.running = True
        self.thread = threading.Thread(target=self._run_scheduler, daemon=True)
        self.thread.start()
        print(f"Backup scheduler started (interval: {self.interval_hours}h)")
    
    def stop(self):
        """Stop the backup scheduler"""
        self.running = False
        if self.thread:
            self.thread.join(timeout=5)
        print("Backup scheduler stopped")
    
    def _run_scheduler(self):
        """Internal method to run the backup loop"""
        while self.running:
            try:
                # Create backup
                create_backup()
                cleanup_old_backups(self.keep_backups)
                
                # Wait for next interval
                time.sleep(self.interval_hours * 3600)
            except Exception as e:
                print(f"Backup error: {e}")
                time.sleep(300)  # Wait 5 minutes before retry
    
    def backup_now(self):
        """Trigger an immediate backup"""
        try:
            create_backup()
            cleanup_old_backups(self.keep_backups)
            return True
        except Exception as e:
            print(f"Manual backup failed: {e}")
            return False

# Global scheduler instance
_scheduler = None

def get_scheduler(interval_hours=24, keep_backups=10):
    """Get or create the global backup scheduler"""
    global _scheduler
    if _scheduler is None:
        _scheduler = BackupScheduler(interval_hours, keep_backups)
    return _scheduler
