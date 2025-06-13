// Hook for PDF state

import { useState, useCallback, useEffect } from "react";
import type { PDFViewerState, PDFMeta } from "../types";
import { pdfApi } from "../lib/api";

export const usePDF = (pdfId?: string) => {
  const [state, setState] = useState<PDFViewerState>({
    currentPage: 1,
    totalPages: 0,
    scale: 1.0,
    isLoading: false,
    error: undefined,
  });

  const [pdfMeta, setPdfMeta] = useState<PDFMeta | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Load PDF metadata and URL
  useEffect(() => {
    if (pdfId) {
      loadPDF(pdfId);
    }
  }, [pdfId]);

  const loadPDF = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const response = await pdfApi.getPDF(id);
      const meta = response.data;

      setPdfMeta(meta);
      // Use the absolute URL from meta.url if available, otherwise construct it properly
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";
      setPdfUrl(
        meta.url
          ? `${apiBaseUrl.replace("/api", "")}${meta.url}`
          : `${apiBaseUrl}/pdfs/${id}/file`
      );

      setState((prev) => ({
        ...prev,
        totalPages: meta.totalPages,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load PDF",
      }));
    }
  }, []);

  const setCurrentPage = useCallback((page: number) => {
    setState((prev) => ({
      ...prev,
      currentPage: Math.max(1, Math.min(page, prev.totalPages)),
    }));
  }, []);

  const nextPage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentPage: Math.min(prev.currentPage + 1, prev.totalPages),
    }));
  }, []);

  const previousPage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentPage: Math.max(prev.currentPage - 1, 1),
    }));
  }, []);

  const setScale = useCallback((newScale: number) => {
    setState((prev) => ({
      ...prev,
      scale: Math.max(0.5, Math.min(newScale, 3.0)),
    }));
  }, []);

  const zoomIn = useCallback(() => {
    setState((prev) => ({
      ...prev,
      scale: Math.min(prev.scale + 0.25, 3.0),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setState((prev) => ({
      ...prev,
      scale: Math.max(prev.scale - 0.25, 0.5),
    }));
  }, []);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setState((prev) => ({
        ...prev,
        totalPages: numPages,
        isLoading: false,
      }));
    },
    []
  );

  const onDocumentLoadError = useCallback((error: Error) => {
    setState((prev) => ({
      ...prev,
      isLoading: false,
      error: error.message,
    }));
  }, []);

  return {
    // State
    ...state,
    pdfMeta,
    pdfUrl,

    // Actions
    setCurrentPage,
    nextPage,
    previousPage,
    setScale,
    zoomIn,
    zoomOut,
    loadPDF,
    onDocumentLoadSuccess,
    onDocumentLoadError,

    // Computed values
    canGoNext: state.currentPage < state.totalPages,
    canGoPrevious: state.currentPage > 1,
    canZoomIn: state.scale < 3.0,
    canZoomOut: state.scale > 0.5,
  };
};
