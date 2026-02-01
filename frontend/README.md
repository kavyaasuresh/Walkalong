# WalkAlong Frontend

A modern React frontend for the WalkAlong productivity application, featuring a premium book-style WorkDone diary interface.

## Features

### 🏠 Dashboard
- **Points Summary Card**: Displays total and weekly points with detailed breakdown modal
- **Weekly Satisfaction Chart**: Interactive bar chart showing daily satisfaction levels
- **Week Navigation**: Dropdown to view different weeks
- **Responsive Design**: Works on desktop and mobile devices

### 📖 WorkDone Diary
- **Book-Style Interface**: Premium diary design with realistic book appearance
- **Daily Task Management**: Add, edit, and delete daily accomplishments
- **Points System**: Customizable points for each task (5-50 points)
- **Category System**: Organize tasks by Study, Project, Reading, Exercise, Practice, Other
- **Satisfaction Rating**: 5-star rating system with emoji feedback
- **Daily Reflection**: Notes section for personal thoughts
- **Recent Entries**: Quick access to previous diary entries
- **Auto-save**: Seamless saving of diary entries

## Tech Stack

- **React 18** - Modern React with hooks
- **React Router 6** - Client-side routing
- **Axios** - HTTP client for API calls
- **Recharts** - Charts and data visualization
- **Lucide React** - Modern icon library
- **CSS3** - Custom styling with glassmorphism effects

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running on `http://localhost:8080`

## Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend/walkalong-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## API Integration

The frontend connects to the backend API at `http://localhost:8080/api`. Make sure your backend server is running before starting the frontend.

### API Endpoints Used:
- `GET /api/workdone` - Get all entries
- `GET /api/workdone/date/{date}` - Get entry by date
- `POST /api/workdone` - Create new entry
- `PUT /api/workdone/{id}` - Update entry
- `DELETE /api/workdone/{id}` - Delete entry
- `GET /api/workdone/points/summary` - Get points summary
- `GET /api/workdone/satisfaction/weekly` - Get weekly satisfaction data

## Project Structure

```
src/
├── components/
│   ├── Navbar.js          # Navigation component
│   └── Navbar.css         # Navigation styles
├── pages/
│   ├── Dashboard.js       # Dashboard with analytics
│   ├── Dashboard.css      # Dashboard styles
│   ├── WorkDonePage.js    # Main diary interface
│   └── WorkDonePage.css   # Book-style diary styles
├── services/
│   └── api.js            # API service layer
├── App.js                # Main app component with routing
├── App.css               # Global styles
├── index.js              # React entry point
└── index.css             # Base styles
```

## Usage

### Dashboard
1. View your total points and weekly progress
2. Click the Points card to see detailed breakdown
3. Use the week selector to view satisfaction data for different weeks
4. Monitor your productivity trends over time

### WorkDone Diary
1. **Select Date**: Use the date picker to choose which day to log
2. **Add Tasks**: Click "Add Task" to create new accomplishment entries
3. **Categorize**: Choose appropriate categories for your tasks
4. **Set Points**: Assign points based on task complexity (5-50 points)
5. **Rate Satisfaction**: Use the 5-star system to rate your daily satisfaction
6. **Add Notes**: Write personal reflections in the notes section
7. **Save**: Click "Save Entry" to store your diary entry
8. **Navigate**: Use the Recent Entries sidebar to quickly jump between dates

## Styling Features

### Book Design
- Realistic book cover with spine effect
- Paper-like pages with ruled lines
- Vintage color scheme (browns, creams, golds)
- Glassmorphism effects for modern touch

### Interactive Elements
- Smooth hover animations
- Star rating with visual feedback
- Modal popups for detailed views
- Responsive grid layouts
- Loading states and error handling

## Development

### Available Scripts
- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Customization
- Modify colors in CSS custom properties
- Add new categories in `WorkDonePage.js`
- Extend API service in `services/api.js`
- Add new dashboard widgets in `Dashboard.js`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the WalkAlong productivity application.