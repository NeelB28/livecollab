import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  GridItem,
  HStack,
  Text,
  Avatar,
  AvatarGroup,
  Spinner,
  Alert,
  AlertIcon,
  IconButton,
  useToast,
  VStack,
  Flex,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import Link from "next/link";
import { PDFViewer } from "../../components/PDFViewer";
import { CommentSection } from "../../components/CommentSection";
import { usePDF } from "../../hooks/usePDF";
import { useSocket } from "../../components/SocketProvider";
import type { User } from "../../types";

export default function ViewerPage() {
  const router = useRouter();
  const { id } = router.query;
  const pdfId = typeof id === "string" ? id : "";

  const {
    pdfMeta,
    pdfUrl,
    currentPage,
    totalPages,
    scale,
    isLoading,
    error,
    setCurrentPage,
    setScale,
    zoomIn,
    zoomOut,
    onDocumentLoadSuccess,
    onDocumentLoadError,
    canGoNext,
    canGoPrevious,
    canZoomIn,
    canZoomOut,
  } = usePDF(pdfId);

  const { joinRoom, leaveRoom, connectedUsers, currentUser, isConnected } =
    useSocket();

  const toast = useToast();

  // Join room when component mounts and user is available
  useEffect(() => {
    if (pdfId && currentUser && isConnected) {
      joinRoom(pdfId, currentUser);
    }

    // Cleanup when leaving the page
    return () => {
      if (pdfId && currentUser) {
        leaveRoom(pdfId);
      }
    };
  }, [pdfId]); // Only depend on pdfId to avoid infinite re-renders

  // Show connection status
  useEffect(() => {
    if (isConnected && pdfId) {
      toast({
        title: "Connected",
        description: "Real-time collaboration is active",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
  }, [isConnected, pdfId, toast]);

  if (!pdfId) {
    return (
      <Box p={6}>
        <Alert status="error">
          <AlertIcon />
          Invalid PDF ID
        </Alert>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <VStack spacing={4}>
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
          <Link href="/">
            <IconButton
              aria-label="Go back to home"
              icon={<ArrowBackIcon />}
              colorScheme="brand"
            />
          </Link>
        </VStack>
      </Box>
    );
  }

  if (isLoading || !pdfMeta) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text color="gray.600">Loading PDF...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="white" borderBottom="1px" borderColor="gray.200" px={6} py={4}>
        <HStack justify="space-between" align="center">
          <HStack spacing={4}>
            <Link href="/">
              <IconButton
                aria-label="Go back to home"
                icon={<ArrowBackIcon />}
                variant="ghost"
                size="sm"
              />
            </Link>
            <VStack spacing={0} align="flex-start">
              <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                {pdfMeta.title || pdfMeta.filename}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {totalPages} pages •{" "}
                {Math.round((pdfMeta.fileSize || 0) / 1024)} KB
              </Text>
            </VStack>
          </HStack>

          {/* Connected Users */}
          <HStack spacing={3}>
            {!isConnected && (
              <Text fontSize="sm" color="gray.500">
                Connecting...
              </Text>
            )}

            {connectedUsers.length > 0 && (
              <HStack spacing={2}>
                <Text fontSize="sm" color="gray.600">
                  Online:
                </Text>
                <AvatarGroup size="sm" max={5}>
                  {connectedUsers.map((user: User) => (
                    <Avatar
                      key={user.id}
                      name={user.name}
                      bg="brand.500"
                      color="white"
                      title={user.name}
                    />
                  ))}
                </AvatarGroup>
              </HStack>
            )}
          </HStack>
        </HStack>
      </Box>

      {/* Main Content */}
      <Grid
        templateColumns={{ base: "1fr", lg: "1fr 400px" }}
        gap={0}
        h="calc(100vh - 80px)"
      >
        {/* PDF Viewer */}
        <GridItem bg="white" p={6}>
          {pdfUrl ? (
            <PDFViewer
              pdfUrl={pdfUrl}
              currentPage={currentPage}
              totalPages={totalPages}
              scale={scale}
              isLoading={isLoading}
              error={error}
              onDocumentLoadSuccess={onDocumentLoadSuccess}
              onDocumentLoadError={onDocumentLoadError}
              onPageChange={setCurrentPage}
              onScaleChange={setScale}
              canGoNext={canGoNext}
              canGoPrevious={canGoPrevious}
              canZoomIn={canZoomIn}
              canZoomOut={canZoomOut}
            />
          ) : (
            <Flex align="center" justify="center" h="full">
              <VStack spacing={4}>
                <Spinner size="lg" color="brand.500" />
                <Text color="gray.600">Loading PDF content...</Text>
              </VStack>
            </Flex>
          )}
        </GridItem>

        {/* Comments Section */}
        <GridItem
          bg="gray.50"
          borderLeft="1px"
          borderColor="gray.200"
          p={6}
          display={{ base: "none", lg: "block" }}
        >
          <CommentSection
            pdfId={pdfId}
            currentPage={currentPage}
            currentUserId={currentUser?.id}
          />
        </GridItem>
      </Grid>

      {/* Mobile Comments Toggle - Hidden for now but can be implemented */}
      <Box display={{ base: "block", lg: "none" }}>
        {/* TODO: Add mobile comments modal/drawer */}
      </Box>
    </Box>
  );
}
 