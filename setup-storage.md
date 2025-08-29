# Supabase Storage Setup for Image Upload

To enable image upload functionality in your notes app, you need to set up a storage bucket in your Supabase project.

## Steps to Set Up Storage:

### 1. Go to your Supabase Dashboard
- Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Select your project: `jwdawhgfgzeybfpcamzs`

### 2. Create Storage Bucket
- Navigate to **Storage** in the left sidebar
- Click **"New bucket"**
- Name: `note-images`
- Make it **Public** (so images can be accessed via URL)
- Click **"Create bucket"**

### 3. Set Up Row Level Security (RLS)
- Go to **Storage** → **Policies**
- Click **"New Policy"** for the `note-images` bucket
- Choose **"For full customization"**
- Name: `Users can upload their own images`
- Policy: 
```sql
((auth.uid())::text = (storage.foldername(name))[1])
```
- Click **"Review"** and **"Save policy"**

### 4. Add Another Policy for Reading
- Click **"New Policy"** again
- Name: `Anyone can view images`
- Policy:
```sql
true
```
- Click **"Review"** and **"Save policy"**

### 5. Update Your Database Schema
You need to add an `images` column to your `notes` table:

- Go to **Table Editor** → **notes** table
- Click **"Add Column"**
- Name: `images`
- Type: `text[]` (array of text)
- Default value: `null`
- Click **"Save"**

## That's it! 
Your image upload functionality should now work perfectly. Users can:
- Drag and drop images or click to upload
- See image previews before saving
- View images in full-screen modal
- Edit notes and manage existing images
- Delete individual images from notes

The images will be stored securely in your Supabase storage bucket and accessible via public URLs.