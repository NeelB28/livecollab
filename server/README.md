# LiveCollab Backend Server

This is the backend server for the LiveCollab collaborative PDF viewer application.

## Features

- **PDF Upload & Storage**: Handle multipart form uploads and store PDFs
- **Real-time Collaboration**: Socket.IO server for live comments and user presence
- **Comment System**: CRUD operations for PDF comments
- **File Serving**: Serve uploaded PDF files
- **User Management**: Track connected users per PDF session

## Quick Start

1. **Install dependencies:**

   ```bash
   cd server
   npm install
   ```

2. **Start the server:**

   ```bash
   # Development with auto-reload
   npm run dev

   # Production
   npm start
   ```

3. **Server will be running on:**
   - HTTP API: http://localhost:3001/api
   - Socket.IO: http://localhost:3001
   - Health check: http://localhost:3001/api/health

## API Endpoints

### PDF Management

- `GET /api/pdfs` - Get all PDFs
- `GET /api/pdfs/:id` - Get specific PDF metadata
- `POST /api/pdfs/upload` - Upload a new PDF (multipart/form-data)
- `DELETE /api/pdfs/:id` - Delete a PDF
- `GET /api/pdfs/:filename/file` - Serve PDF file

### Comments

- `GET /api/pdfs/:id/comments` - Get comments for a PDF
- `POST /api/pdfs/:id/comments` - Add a comment
- `PUT /api/pdfs/:id/comments/:commentId` - Update a comment
- `DELETE /api/pdfs/:id/comments/:commentId` - Delete a comment

### Health Check

- `GET /api/health` - Server status and statistics

## Socket.IO Events

### Client → Server

- `user:join` - Join a PDF viewing session
- `user:leave` - Leave a PDF viewing session
- `comment:add` - Add a new comment
- `comment:delete` - Delete a comment
- `pdf:page-change` - Notify page change

### Server → Client

- `users:update` - Update connected users list
- `comment:add` - Broadcast new comment
- `comment:update` - Broadcast comment update
- `comment:delete` - Broadcast comment deletion
- `comments:sync` - Sync all comments for a PDF

## File Storage

- Uploaded PDFs are stored in `./uploads/` directory
- Files are renamed with UUID prefixes to avoid conflicts
- File size limit: 10MB
- Only PDF files are accepted

## Development Notes

- Uses in-memory storage (arrays/objects) for simplicity
- In production, replace with proper database (PostgreSQL, MongoDB, etc.)
- Consider adding Redis for session management
- Add authentication/authorization as needed
- Implement proper error logging and monitoring

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
PORT=3001
NODE_ENV=development
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

## Docker Support (Optional)

You can containerize this server:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## Security Considerations

- Add rate limiting for API endpoints
- Implement file type validation beyond MIME type
- Add virus scanning for uploaded files
- Use HTTPS in production
- Add CORS configuration for production domains
- Implement proper authentication and authorization
