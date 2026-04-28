# PrintLab

A full-stack application for campus printing services, featuring a clean frontend, an Express Node.js backend, and a Supabase PostgreSQL database.

## 1. Supabase Database Setup

1. Create a new project in [Supabase](https://supabase.com/).
2. Navigate to the **SQL Editor** in your Supabase dashboard.
3. Copy the contents of `backend/supabase.sql` and run it in the SQL Editor. This will create the `products` and `orders` tables, set up Row Level Security (RLS) policies, and seed the initial products data.
4. Go to **Project Settings -> API** to get your `Project URL` and `anon public` key.

## 2. Local Development

### Backend
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder (you can copy from `.env.example` if it exists) and add your Supabase credentials:
   ```
   SUPABASE_URL=your_project_url
   SUPABASE_KEY=your_anon_public_key
   PORT=5005
   ```
4. Start the server:
   ```bash
   npm start
   ```
   The backend will run on `http://localhost:5005`.

### Frontend
1. Open a new terminal and navigate to the root directory (or `frontend` if served specifically).
2. Open `frontend/index.html` in your browser. (You can use an extension like Live Server in VS Code, or just open the file directly).
3. The frontend is configured to automatically connect to `http://localhost:5005` when running on `localhost` or `127.0.0.1`.

## 3. Deployment

### Backend (Render)
1. Push your repository to GitHub.
2. Log in to [Render](https://render.com/) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Configure the Web Service:
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. In the **Environment Variables** section on Render, add:
   - `SUPABASE_URL`: (your Supabase URL)
   - `SUPABASE_KEY`: (your Supabase anon key)
6. Click **Create Web Service**.
7. Once deployed, Render will provide a URL (e.g., `https://printlab-backend.onrender.com`).

### Frontend (Vercel)
1. Before deploying the frontend, copy your Render backend URL.
2. Open `frontend/script.js` and locate line 4:
   ```javascript
   : 'https://your-render-app.onrender.com';
   ```
   Replace `https://your-render-app.onrender.com` with your actual Render URL.
3. Push the change to GitHub.
4. Log in to [Vercel](https://vercel.com/) and click **Add New -> Project**.
5. Import your GitHub repository.
6. Configure the Project:
   - **Framework Preset**: Other
   - **Root Directory**: `frontend`
7. Click **Deploy**. Vercel will host your static files and give you a live URL.

## Folder Structure
```
project-root/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── supabase.sql
│   ├── .env
│   ├── package.json
│
├── .gitignore
├── README.md
```
