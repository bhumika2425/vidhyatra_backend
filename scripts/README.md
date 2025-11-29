# Database Management Scripts

This folder contains scripts to manage the Vidhyatra database schema and tables.

## Available Scripts

### 1. `initDatabase.js` - Safe Table Creation
Creates all missing tables without affecting existing data.

**Usage:**
```bash
npm run db:init
# OR
node scripts/initDatabase.js
```

**What it does:**
- ✅ Creates missing tables
- ✅ Preserves existing data
- ✅ Safe for production
- ✅ Shows table summary with record counts

**When to use:**
- First-time database setup
- Adding new tables after code updates
- Verifying database structure

---

### 2. `resetDatabase.js` - Complete Database Reset
⚠️ **DANGER**: Drops ALL tables and recreates them. All data will be LOST!

**Usage:**
```bash
npm run db:reset
# OR
node scripts/resetDatabase.js
```

**What it does:**
- ❌ DROPS all existing tables
- ❌ DELETES all data
- ✅ Creates fresh tables with correct schema
- ⚠️ 3-second countdown before execution

**When to use:**
- Development environment only
- Fixing schema conflicts
- Starting with a clean database
- Testing purposes

**⚠️ NEVER use in production!**

---

## Quick Start Guide

### First Time Setup
```bash
# 1. Ensure MySQL is running
mysql -u root

# 2. Initialize the database
npm run db:init
```

### Fix Schema Issues (Development Only)
```bash
# If you have foreign key conflicts or schema issues
npm run db:reset
```

### Check Tables After Creation
```bash
mysql -u root
mysql> USE vidhyatra;
mysql> SHOW TABLES;
mysql> DESCRIBE users;  # Check specific table structure
mysql> EXIT;
```

---

## All Models/Tables

The scripts will create these tables:

1. **admins** - Admin user accounts
2. **users** - Student/Teacher accounts
3. **profiles** - User profile information
4. **blog** - Blog posts
5. **like** - Blog likes
6. **comment** - Blog comments
7. **friend_requests** - Friend request management
8. **friends** - Friend relationships
9. **Feedbacks** - User feedback
10. **events** - College events
11. **fees** - Fee structure
12. **paid_fees** - Payment records
13. **payments** - Payment transactions
14. **routine_configs** - Class routine configuration
15. **routine_entries** - Individual routine entries
16. **deadlines** - Assignment deadlines
17. **time_slots** - Teacher appointment slots
18. **appointments** - Booked appointments
19. **academic_calendar** - Academic events
20. **lost_and_found** - Lost & found items
21. **notifications** - Push notifications

---

## Troubleshooting

### Error: "Unknown database 'vidhyatra'"
```bash
mysql -u root
mysql> CREATE DATABASE vidhyatra;
mysql> EXIT;
npm run db:init
```

### Error: "Foreign key constraint fails"
This means tables were created in the wrong order or with incorrect data types.
```bash
# Drop the database and start fresh
mysql -u root
mysql> DROP DATABASE vidhyatra;
mysql> CREATE DATABASE vidhyatra;
mysql> EXIT;

# Run reset script
npm run db:reset
```

### Error: "Access denied for user 'root'"
```bash
# Try without password
mysql -u root

# Or with password
mysql -u root -p

# Use credentials from .env file
mysql -u vidhyatra_admin -p
# Password: vidhyatra2024
```

---

## Environment Variables Required

Make sure your `.env` file contains:
```env
VIDHYATRA_DB_NAME=vidhyatra
VIDHYATRA_DB_USER=root
VIDHYATRA_DB_PASSWORD=
DB_HOST=localhost
```

---

## Notes

- Always backup your database before running `db:reset`
- Use `db:init` for adding new tables safely
- Use `db:reset` only in development
- Check the console output for detailed information
- All tables use InnoDB engine for foreign key support

---

## Support

If you encounter issues:
1. Check MySQL is running: `mysql -u root`
2. Verify database exists: `SHOW DATABASES;`
3. Check `.env` file configuration
4. Review error messages in console output
