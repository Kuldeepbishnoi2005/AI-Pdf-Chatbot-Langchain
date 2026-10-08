# Supabase Database Setup

Follow these steps to set up your Supabase database with `pgvector` for the AI PDF Chatbot.

## 1. Access Supabase SQL Editor
1. Go to your Supabase project dashboard: [https://wcjzxpletzyouxrmkcwp.supabase.co](https://wcjzxpletzyouxrmkcwp.supabase.co)
2. In the left navigation bar, click on **SQL Editor**.

## 2. Run Migration SQL
1. Open `supabase/schema.sql` from this repository.
2. Paste the entire SQL script into the SQL Editor.
3. Click **Run**.

## Verification
You can verify the setup by running the following query in the SQL Editor:

```sql
SELECT extname FROM pg_extension WHERE extname = 'vector';
SELECT * FROM documents LIMIT 1;
```

This ensures:
- The `vector` extension is enabled.
- The `documents` table exists with a 1536-dimensional `embedding` column.
- The `match_documents` RPC function is created for similarity retrieval.
