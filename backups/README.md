# Database Backups

This directory contains database snapshots for safe rollback.

## Current Snapshots

- `sb_2025-09-12.sql` - V4 UI Phase checkpoint (PROVISIONAL PASS)

## Usage

To restore a snapshot:
1. Go to Supabase Studio
2. Navigate to SQL Editor
3. Upload and run the SQL file
4. Verify data integrity

## Export New Snapshot

```bash
# If using Supabase CLI
supabase db dump -f backups/sb_$(date +%Y-%m-%d).sql

# Manual export from Supabase Studio
# 1. Go to Database > Backups
# 2. Create new backup
# 3. Download SQL file
# 4. Save to this directory
```