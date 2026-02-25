# Supabase Setup Guide

To get your Snooker Club Management app running, you need to connect it to a Supabase project.

## 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com/) and create a new project.
2. Choose a name (e.g., `Snooker Elite`) and a secure database password.

## 2. Initialize the Database
1. In your Supabase Dashboard, go to the **SQL Editor**.
2. Create a **New Query**.
3. Copy the contents of the local file [schema.sql](file:///Users/hensi/Desktop/PROJECTS%20Tech/Snooker%20Management/supabase/schema.sql) and paste them into the SQL Editor.
4. Click **Run**. This will create the tables, roles, and security policies (RLS).

## 3. Configure Environment Variables
1. Go to **Project Settings > API**.
2. Copy the **Project URL** and the **Anon Key**.
3. Create a `.env.local` file in your project root (same directory as `package.json`).
4. Paste your keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## 4. Create your First User (Owner)
1. Go to **Authentication > Users** in Supabase.
2. Click **Add User** and create an account with your email.
3. Once created, go back to the **SQL Editor** and run this command:
   ```sql
   -- 1. Ensure the email column exists
   ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;

   -- 2. If the update below says "0 rows affected", run this manual insert:
   -- (Get your ID from Authentication > Users)
   INSERT INTO public.users (id, email, role)
   VALUES ('YOUR_ID_HERE', 'hensibaghel43@gmail.com', 'owner')
   ON CONFLICT (id) DO UPDATE SET role = 'owner', email = 'hensibaghel43@gmail.com';
   ```

## 5. Run the App
```bash
npm run dev
```
Navigate to `http://localhost:3000` and login with your credentials.
