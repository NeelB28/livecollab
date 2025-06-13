// Types (Comment, PDFMeta, etc.)

export interface User {
  id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  pageNumber: number;
  timestamp: string;
  position?: {
    x: number;
    y: number;
  };
}

export interface PDFMeta {
  id: string;
  filename: string;
  title: string;
  totalPages: number;
  uploadedAt: string;
  uploadedBy: string;
  fileSize: number;
  thumbnail?: string;
  url?: string;
}

export interface SocketEvents {
  // User events
  "user:join": { userId: string; pdfId: string };
  "user:leave": { userId: string; pdfId: string };
  "users:update": { users: User[] };

  // Comment events
  "comment:add": Comment;
  "comment:update": Comment;
  "comment:delete": { commentId: string };
  "comments:sync": { comments: Comment[] };

  // PDF events
  "pdf:page-change": { userId: string; pageNumber: number };
  "pdf:upload": PDFMeta;
}

export interface PDFViewerState {
  currentPage: number;
  totalPages: number;
  scale: number;
  isLoading: boolean;
  error?: string;
}

export interface CommentFormData {
  content: string;
  pageNumber: number;
}
