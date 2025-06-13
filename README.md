# LiveCollab - Collaborative PDF Viewer

A real-time collaborative PDF viewer application built with Next.js, React, and Socket.IO. Users can upload PDFs, view them together, add comments on specific pages, and see who else is viewing the document in real-time.

![LiveCollab Demo](https://img.shields.io/badge/Status-Active-green) ![Next.js](https://img.shields.io/badge/Next.js-12.3.0-black) ![React](https://img.shields.io/badge/React-18.2.0-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue)

## 🚀 Features

### Core Features

- **📄 PDF Upload & Viewing**: Drag-and-drop PDF upload with real-time preview
- **👥 Real-time Collaboration**: See connected users and their activity
- **💬 Page-specific Comments**: Add, edit, and delete comments on specific PDF pages
- **🔄 Live Synchronization**: Real-time updates using Socket.IO
- **📱 Responsive Design**: Mobile-first design using Chakra UI
- **🎯 Zoom & Navigation**: PDF zoom controls and page navigation

### Technical Features

- **Type-safe**: Full TypeScript implementation
- **Component Architecture**: Reusable React components following cursor rules
- **Real-time Engine**: Socket.IO for instant collaboration
- **File Management**: Secure file upload with validation
- **Modern UI**: Chakra UI with custom theming
- **Memory Efficient**: Optimized PDF rendering with react-pdf

## 🏗️ Project Structure

```
livecollab/
├── public/                     # Static assets
├── src/
│   ├── components/            # React components
│   │   ├── PDFViewer.tsx     # PDF rendering component
│   │   ├── CommentSection.tsx # Comment management
│   │   ├── CommentItem.tsx   # Individual comment display
│   │   └── SocketProvider.tsx # Real-time context
│   ├── hooks/
│   │   └── usePDF.ts         # PDF state management hook
│   ├── lib/
│   │   ├── api.ts            # Axios HTTP client
│   │   └── socket.ts         # Socket.IO client manager
│   ├── pages/                # Next.js pages
│   │   ├── index.tsx         # Home page with upload
│   │   ├── viewer/[id].tsx   # PDF viewer page
│   │   └── _app.tsx          # App wrapper with providers
│   ├── styles/
│   │   └── globals.css       # Global styles and theme
│   └── types/
│       └── index.ts          # TypeScript type definitions
├── server/                    # Backend server
│   ├── server.js             # Express + Socket.IO server
│   ├── package.json          # Server dependencies
│   └── uploads/              # PDF file storage
├── env.example               # Frontend environment template
├── env.server.example        # Backend environment template
└── package.json              # Frontend dependencies
```

## 🛠️ Tech Stack

### Frontend

- **Next.js 12.3.0** - React framework with Pages Router
- **React 18.2.0** - UI library
- **TypeScript 4.9.5** - Type safety
- **Chakra UI 2.2.4** - Component library and theming
- **react-pdf 5.7.2** - PDF rendering
- **Socket.IO Client 4.5.2** - Real-time communication
- **Axios 0.27.2** - HTTP client
- **React Hook Form 7.46.2** - Form management

### Backend

- **Node.js** - Runtime environment
- **Express.js 4.18.2** - Web framework
- **Socket.IO 4.7.2** - Real-time engine
- **Multer 1.4.5** - File upload handling
- **pdf-parse 1.1.1** - PDF metadata extraction
- **UUID 9.0.0** - Unique identifier generation

## 🚀 Quick Start

### Prerequisites

- **Node.js** (version 16 or higher)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd livecollab
   ```

2. **Install frontend dependencies:**

   ```bash
   npm install
   ```

3. **Install backend dependencies:**

   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Set up environment files:**

   ```bash
   # Copy frontend environment
   cp env.example .env

   # Copy backend environment
   cp env.server.example server/.env
   ```

5. **Start the backend server:**

   ```bash
   cd server
   npm start
   # Server runs on http://localhost:3002
   ```

6. **Start the frontend development server:**
   ```bash
   # In the root directory
   npm run dev
   # Frontend runs on http://localhost:3000
   ```

### Environment Configuration

#### Frontend (.env)

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3002/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3002

# File Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=application/pdf
```

#### Backend (server/.env)

```bash
# Server Configuration
PORT=3002
NODE_ENV=development

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002
```

## 📖 Usage Guide

### Uploading a PDF

1. Navigate to the home page (`http://localhost:3000`)
2. Drag and drop a PDF file or click "Upload PDF"
3. Wait for the upload to complete
4. You'll be automatically redirected to the viewer

### Viewing and Collaborating

1. Open a PDF from the home page or share the viewer URL
2. Use navigation controls to move between pages
3. Zoom in/out using the zoom controls
4. See connected users in the sidebar
5. Add comments by typing in the comment section
6. Comments are synchronized in real-time across all users

### Real-time Features

- **User Presence**: See who's currently viewing the PDF
- **Live Comments**: Comments appear instantly for all users
- **Page Sync**: See when other users navigate to different pages
- **Auto-refresh**: New uploads appear automatically

## 🔧 Development

### Available Scripts

#### Frontend

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

#### Backend

```bash
npm start        # Start production server
npm run dev      # Start with nodemon (auto-reload)
```

### Component Architecture

The application follows a modular component architecture:

- **PDFViewer**: Handles PDF rendering and navigation
- **CommentSection**: Manages comment display and form
- **CommentItem**: Individual comment with user info
- **SocketProvider**: Manages real-time connections

### API Endpoints

#### PDF Management

- `GET /api/pdfs` - List all PDFs
- `GET /api/pdfs/:id` - Get PDF metadata
- `POST /api/pdfs/upload` - Upload new PDF
- `GET /api/pdfs/:filename/file` - Serve PDF file
- `DELETE /api/pdfs/:id` - Delete PDF

#### Comments

- `GET /api/pdfs/:id/comments` - Get comments for PDF
- `POST /api/pdfs/:id/comments` - Add comment
- `PUT /api/pdfs/:id/comments/:commentId` - Update comment
- `DELETE /api/pdfs/:id/comments/:commentId` - Delete comment

### Socket.IO Events

#### Client → Server

- `user:join` - Join PDF viewing session
- `user:leave` - Leave PDF viewing session
- `comment:add` - Add new comment
- `comment:delete` - Delete comment
- `pdf:page-change` - Notify page change

#### Server → Client

- `users:update` - Connected users list
- `comment:add` - New comment broadcast
- `comment:delete` - Comment deletion broadcast
- `comments:sync` - Full comment synchronization

## 🚀 Deployment

### Production Build

1. **Build the frontend:**

   ```bash
   npm run build
   ```

2. **Set production environment variables:**

   ```bash
   # Update .env with production URLs
   NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
   NEXT_PUBLIC_SOCKET_URL=https://your-api-domain.com
   ```

3. **Deploy backend server:**

   - Deploy to platforms like Heroku, Railway, or DigitalOcean
   - Set environment variables for production
   - Configure file storage (consider AWS S3 for production)

4. **Deploy frontend:**
   - Deploy to Vercel, Netlify, or similar platforms
   - Configure environment variables

### Production Considerations

- **Database**: Replace in-memory storage with PostgreSQL/MongoDB
- **File Storage**: Use AWS S3 or similar cloud storage
- **Authentication**: Implement user authentication
- **Rate Limiting**: Add API rate limiting
- **SSL**: Enable HTTPS for production
- **Monitoring**: Add error tracking and analytics

## 🔒 Security

### Current Security Measures

- File type validation (PDF only)
- File size limits (10MB)
- CORS configuration
- Input sanitization

### Recommended Additions

- User authentication and authorization
- Rate limiting for API endpoints
- File virus scanning
- Input validation and sanitization
- SQL injection protection (when using database)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and TypeScript conventions
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **PDF not loading (404 error)**

   - Ensure backend server is running on port 3002
   - Check that .env files are properly configured
   - Verify file exists in server/uploads directory

2. **Real-time features not working**

   - Check Socket.IO connection in browser console
   - Ensure CORS is properly configured
   - Verify Socket.IO server is running

3. **File upload fails**

   - Check file size (must be under 10MB)
   - Ensure file is a valid PDF
   - Verify server has write permissions to uploads directory

4. **Build errors**
   - Clear node_modules and reinstall dependencies
   - Check TypeScript configurations
   - Verify all environment variables are set

### Getting Help

- Check the browser console for error messages
- Review server logs for backend issues
- Open an issue on GitHub with detailed error information

## 📊 Performance

### Optimization Features

- Lazy loading of PDF pages
- Efficient Socket.IO event handling
- Optimized bundle size with Next.js
- Chakra UI component optimization
- Memory-efficient PDF rendering

### Monitoring

- Real-time user count tracking
- File upload success rates
- Socket connection health
- API response times

---

**Built with ❤️ using Next.js, React, and Socket.IO**
