import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  IconButton,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
} from "@chakra-ui/react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  AddIcon,
  MinusIcon,
} from "@chakra-ui/icons";
import type { PDFViewerState } from "../types";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfUrl: string;
  currentPage: number;
  totalPages: number;
  scale: number;
  isLoading: boolean;
  error?: string;
  onDocumentLoadSuccess: ({ numPages }: { numPages: number }) => void;
  onDocumentLoadError: (error: Error) => void;
  onPageChange: (page: number) => void;
  onScaleChange: (scale: number) => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  canZoomIn: boolean;
  canZoomOut: boolean;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  currentPage,
  totalPages,
  scale,
  isLoading,
  error,
  onDocumentLoadSuccess,
  onDocumentLoadError,
  onPageChange,
  onScaleChange,
  canGoNext,
  canGoPrevious,
  canZoomIn,
  canZoomOut,
}) => {
  const [pageLoading, setPageLoading] = useState(false);

  const handlePreviousPage = () => {
    if (canGoPrevious) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (canGoNext) {
      onPageChange(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    if (canZoomIn) {
      onScaleChange(scale + 0.25);
    }
  };

  const handleZoomOut = () => {
    if (canZoomOut) {
      onScaleChange(scale - 0.25);
    }
  };

  if (error) {
    return (
      <Box
        w="full"
        h="full"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Alert status="error" maxW="md">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <VStack spacing={4} w="full" h="full">
      {/* Navigation Controls */}
      <HStack spacing={4} w="full" justify="center">
        <HStack spacing={2}>
          <IconButton
            aria-label="Previous page"
            icon={<ChevronLeftIcon />}
            onClick={handlePreviousPage}
            isDisabled={!canGoPrevious}
            size="sm"
            colorScheme="brand"
            variant="outline"
          />
          <Flex
            align="center"
            justify="center"
            bg="brand.100"
            px={4}
            py={2}
            borderRadius="md"
            minW="100px"
          >
            <Text fontSize="sm" fontWeight="medium">
              {totalPages > 0 ? `${currentPage}/${totalPages}` : "0/0"}
            </Text>
          </Flex>
          <IconButton
            aria-label="Next page"
            icon={<ChevronRightIcon />}
            onClick={handleNextPage}
            isDisabled={!canGoNext}
            size="sm"
            colorScheme="brand"
            variant="outline"
          />
        </HStack>
      </HStack>

      {/* PDF Document */}
      <Box
        flex={1}
        w="full"
        overflow="auto"
        display="flex"
        justifyContent="center"
        alignItems="flex-start"
        bg="gray.100"
        borderRadius="lg"
        position="relative"
      >
        {isLoading && (
          <Flex
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            align="center"
            justify="center"
            bg="white"
            zIndex={2}
          >
            <VStack spacing={2}>
              <Spinner size="lg" color="brand.500" />
              <Text fontSize="sm" color="gray.600">
                Loading PDF...
              </Text>
            </VStack>
          </Flex>
        )}

        {pdfUrl && (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
          >
            <Page
              pageNumber={currentPage}
              scale={scale}
              onLoadSuccess={() => setPageLoading(false)}
              onLoadError={() => setPageLoading(false)}
              loading={
                <Flex align="center" justify="center" minH="600px">
                  <Spinner size="md" color="brand.500" />
                </Flex>
              }
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        )}
      </Box>

      {/* Zoom Controls */}
      <HStack spacing={2}>
        <IconButton
          aria-label="Zoom out"
          icon={<MinusIcon />}
          onClick={handleZoomOut}
          isDisabled={!canZoomOut}
          size="sm"
          colorScheme="gray"
          variant="outline"
          bg="white"
        />
        <IconButton
          aria-label="Zoom in"
          icon={<AddIcon />}
          onClick={handleZoomIn}
          isDisabled={!canZoomIn}
          size="sm"
          colorScheme="gray"
          variant="outline"
          bg="white"
        />
      </HStack>
    </VStack>
  );
};
 