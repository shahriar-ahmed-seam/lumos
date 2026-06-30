# Database Setup - PostgreSQL

Loomos uses PostgreSQL with Prisma ORM for data persistence.

## Quick Start with Neon (Recommended - FREE)

Neon provides a free PostgreSQL database with no credit card required.

1. **Create a Neon Account**
   - Go to [https://neon.tech](https://neon.tech)
   - Sign up with GitHub (fastest)

2. **Create a Project**
   - Click "Create Project"
   - Name: `loomos`
   - Region: Choose closest to you
   - Click "Create Project"

3. **Get Connection String**
   - Copy the connection string (starts with `postgresql://`)
   - It looks like: `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb`

4. **Update .env.local**
   ```bash
   DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb"
   ```

5. **Run Migrations**
   ```bash
   npx prisma db push
   ```

6. **Start the App**
   ```bash
   npm run dev
   ```

## Alternative: Local PostgreSQL

If you prefer running PostgreSQL locally:

### Windows
1. Download PostgreSQL from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Install with default settings (remember your password!)
3. Create database:
   ```sql
   createdb loomos
   ```

### macOS
```bash
brew install postgresql@15
brew services start postgresql@15
createdb loomos
```

### Linux
```bash
sudo apt-get install postgresql
sudo -u postgres createdb loomos
```

### Connection String
```
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/loomos"
```

## Other Free Options

### Supabase (FREE)
- [https://supabase.com](https://supabase.com)
- Includes PostgreSQL + Auth + Storage
- Get connection string from: Settings → Database → Connection string

### Railway (FREE)
- [https://railway.app](https://railway.app)
- Provides PostgreSQL plugin
- Get connection string from database service

## Troubleshooting

### Connection Issues
- Verify DATABASE_URL is correct in `.env.local`
- For Neon: Enable "Pooler" connection string if you get timeout errors
- For local: Ensure PostgreSQL service is running

### Migration Errors
```bash
# Reset database (CAUTION: Deletes all data)
npx prisma migrate reset

# Push schema without migration
npx prisma db push
```

### View Database
```bash
# Open Prisma Studio
npx prisma studio
```
