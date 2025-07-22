# NotesApp

A web-based note-taking application built with Node.js, Express, MongoDB, and EJS. NotesApp allows users to sign up, log in, create, edit, search, and delete notes. Each note can have tags, and users can search notes by title, content, or ID.

## Features

- **User Authentication:** Sign up and log in with email and password.
- **Create Notes:** Add new notes with a title, content, and tags.
- **Edit Notes:** Update existing notes, including their tags.
- **Delete Notes:** Remove notes you no longer need.
- **Search:** Full-text search by title, content, or note ID.
- **Tagging:** Organize notes with tags for easy retrieval.
- **Responsive UI:** Clean, modern interface using EJS templates and Bootstrap.
- **Session Management:** User sessions are managed securely with `express-session` and `connect-mongo`.

## Technologies Used

- Node.js, Express.js
- MongoDB, Mongoose
- EJS templating
- Bootstrap (for UI)
- Passport.js (for authentication)
- dotenv (for environment variables)

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Create a `.env` file with at least:
     ```
     SESSION_SECRET=your_secret_key
     PORT=3000
     ```

3. **Start MongoDB:**  
   Make sure MongoDB is running locally on the default port.

4. **Run the app:**
   ```bash
   npm start
   ```

5. **Open your browser:**  
   Visit [http://localhost:3000](http://localhost:3000)

## Folder Structure

- `app.js` - Main Express app and route definitions
- `index.js` - Entry point, connects to MongoDB and starts the server
- `views/` - EJS templates for UI
- `public/` - Static assets (CSS, images)

## Screenshots

Yet to be filled

## License

Yet to be filled