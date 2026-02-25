# Supabase Setup Guide

To get your Snooker Club Management app running, you need to connect it to a Supabase project.

## 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com/) and create a new project.
2. Choose a name (e.g., `Snooker Elite`) and a secure database password.

## 2. Initialize the Database
1. In your Supabase Dashboard, go to the **SQL Editor**.
2. Create a **New Query**.
3. Copy/Paste the contents of [schema.sql](file:///Users/hensi/Desktop/PROJECTS%20Tech/Snooker%20Management/supabase/schema.sql) and click **Run**.
4. Create another **New Query**.
5. Copy/Paste the contents of [triggers.sql](file:///Users/hensi/Desktop/PROJECTS%20Tech/Snooker%20Management/supabase/triggers.sql) and click **Run**.
   - These triggers automatically create user profiles in the `public.users` table when someone signs up.

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
1. Go to your app's `/login` page and sign up for a new account using your email.
2. Go back to the **SQL Editor** in Supabase and run this command:
   ```sql
   -- This promotes your account to "owner" so you have full permissions
   UPDATE public.users 
   SET role = 'owner' 
   WHERE email = 'hensibaghel43@gmail.com'; 
   ```
   - *Note: Replace the email with the one you signed up with.*

## 5. Run the App
```bash
npm run dev
```
Navigate to `http://localhost:3000` and login with your credentials.
