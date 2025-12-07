# Backup Configuration
BACKUP_ENABLED = True
BACKUP_INTERVAL_HOURS = 24  # Create backup every 24 hours
KEEP_BACKUP_COUNT = 10  # Keep last 10 backups

# WAL Configuration
WAL_ENABLED = True
WAL_SYNCHRONOUS = 'NORMAL'  # Options: OFF, NORMAL, FULL, EXTRA
