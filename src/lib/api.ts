// Axios instance
import axios from "axios";
import type { PDFMeta, Comment } from "../types";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("auth-token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("auth-token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// API endpoints with proper typing
export const pdfApi = {
  // Get all PDFs
  getPDFs: () => api.get<PDFMeta[]>("/pdfs"),

  // Get specific PDF
  getPDF: (id: string) => api.get<PDFMeta>(`/pdfs/${id}`),

  // Upload PDF
  uploadPDF: (formData: FormData) =>
    api.post<PDFMeta>("/pdfs/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // Delete PDF
  deletePDF: (id: string) => api.delete(`/pdfs/${id}`),
};

export const commentApi = {
  // Get comments for PDF
  getComments: (pdfId: string) => api.get<Comment[]>(`/pdfs/${pdfId}/comments`),

  // Add comment
  addComment: (pdfId: string, comment: Omit<Comment, "id" | "timestamp">) =>
    api.post<Comment>(`/pdfs/${pdfId}/comments`, comment),

  // Update comment
  updateComment: (pdfId: string, commentId: string, content: string) =>
    api.put<Comment>(`/pdfs/${pdfId}/comments/${commentId}`, { content }),

  // Delete comment
  deleteComment: (pdfId: string, commentId: string) =>
    api.delete(`/pdfs/${pdfId}/comments/${commentId}`),
};
