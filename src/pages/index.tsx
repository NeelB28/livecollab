import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Avatar,
  Grid,
  GridItem,
  useToast,
  Spinner,
  IconButton,
  Flex,
} from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/router";
import { pdfApi } from "../lib/api";
import type { PDFMeta, User } from "../types";
import { useSocket } from "../components/SocketProvider";

export default function HomePage() {
  const [recentPDFs, setRecentPDFs] = useState<PDFMeta[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const router = useRouter();
  const { setCurrentUser } = useSocket();

  // Mock current user - in real app this would come from auth
  const currentUser: User = {
    id: "user-1",
    name: "You",
    avatar: "👤",
    isOnline: true,
  };

  useEffect(() => {
    setCurrentUser(currentUser);
    loadRecentPDFs();
  }, [setCurrentUser]);

  const loadRecentPDFs = async () => {
    try {
      const response = await pdfApi.getPDFs();
      setRecentPDFs(response.data);
    } catch (error) {
      toast({
        title: "Error loading PDFs",
        description: "Failed to load recent PDFs",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("pdf", file);
        formData.append("uploadedBy", currentUser.id);

        const response = await pdfApi.uploadPDF(formData);
        const newPDF = response.data;

        toast({
          title: "PDF uploaded successfully",
          description: `${newPDF.filename} is ready to view`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // Refresh the list
        loadRecentPDFs();

        // Navigate to viewer
        router.push(`/viewer/${newPDF.id}`);
      } catch (error) {
        toast({
          title: "Upload failed",
          description: "Failed to upload PDF. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsUploading(false);
      }
    },
    [currentUser.id, router, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: isUploading,
  });

  const openPDF = (pdfId: string) => {
    router.push(`/viewer/${pdfId}`);
  };

  return (
    <Box minH="100vh" bg="gray.50" p={6}>
      <VStack spacing={8} maxW="6xl" mx="auto">
        {/* Header */}
        <HStack w="full" justify="space-between">
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            LiveCollab
          </Text>
          <Avatar
            size="md"
            name={currentUser.name}
            bg="brand.500"
            color="white"
          />
        </HStack>

        {/* Upload Section */}
        <Box w="full" maxW="xl">
          <Box
            {...getRootProps()}
            border="2px"
            borderStyle="dashed"
            borderColor={isDragActive ? "brand.500" : "gray.300"}
            borderRadius="lg"
            p={12}
            textAlign="center"
            cursor={isUploading ? "not-allowed" : "pointer"}
            bg={isDragActive ? "brand.50" : "white"}
            transition="all 0.2s"
            _hover={{
              borderColor: "brand.400",
              bg: "brand.50",
            }}
          >
            <input {...getInputProps()} />
            <VStack spacing={4}>
              {isUploading ? (
                <>
                  <Spinner size="lg" color="brand.500" />
                  <Text color="gray.600">Uploading PDF...</Text>
                </>
              ) : (
                <>
                  <Text fontSize="6xl" color="gray.400">
                    ✕
                  </Text>
                  <Text fontSize="lg" color="gray.600">
                    {isDragActive
                      ? "Drop the PDF here"
                      : "Drag and drop a PDF file here"}
                  </Text>
                  <Button colorScheme="brand" size="lg" disabled={isUploading}>
                    Upload PDF
                  </Button>
                </>
              )}
            </VStack>
          </Box>
        </Box>

        {/* Recent PDFs Section */}
        <Box w="full">
          <Text fontSize="xl" fontWeight="semibold" mb={4} color="gray.800">
            Recent upload PDFs
          </Text>

          {isLoading ? (
            <Flex justify="center" py={8}>
              <Spinner size="lg" color="brand.500" />
            </Flex>
          ) : recentPDFs.length > 0 ? (
            <Grid
              templateColumns="repeat(auto-fit, minmax(200px, 1fr))"
              gap={4}
            >
              {recentPDFs.slice(0, 6).map((pdf) => (
                <GridItem key={pdf.id}>
                  <VStack
                    p={4}
                    bg="white"
                    borderRadius="lg"
                    shadow="sm"
                    border="1px"
                    borderColor="gray.200"
                    spacing={3}
                    h="full"
                  >
                    <Box
                      w="full"
                      h="32"
                      bg="gray.100"
                      borderRadius="md"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize="3xl" color="gray.400">
                        📄
                      </Text>
                    </Box>
                    <VStack spacing={1} flex={1}>
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        noOfLines={2}
                        textAlign="center"
                      >
                        {pdf.title || pdf.filename}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {pdf.totalPages} pages
                      </Text>
                    </VStack>
                    <Button
                      size="sm"
                      colorScheme="gray"
                      color="white"
                      bg="gray.800"
                      w="full"
                      onClick={() => openPDF(pdf.id)}
                      _hover={{ bg: "gray.700" }}
                    >
                      Open
                    </Button>
                  </VStack>
                </GridItem>
              ))}
            </Grid>
          ) : (
            <Box
              textAlign="center"
              py={12}
              px={6}
              bg="white"
              borderRadius="lg"
              border="1px"
              borderColor="gray.200"
            >
              <Text color="gray.500" mb={4}>
                No PDFs uploaded yet
              </Text>
              <Text fontSize="sm" color="gray.400">
                Upload your first PDF to get started with collaborative viewing
              </Text>
            </Box>
          )}
        </Box>

        {/* Select Document Section */}
        {recentPDFs.length > 6 && (
          <Box w="full">
            <Text fontSize="xl" fontWeight="semibold" mb={4} color="gray.800">
              Select a document
            </Text>
            <Grid
              templateColumns="repeat(auto-fit, minmax(200px, 1fr))"
              gap={4}
            >
              {recentPDFs.slice(6).map((pdf) => (
                <GridItem key={pdf.id}>
                  <VStack
                    p={4}
                    bg="white"
                    borderRadius="lg"
                    shadow="sm"
                    border="1px"
                    borderColor="gray.200"
                    spacing={3}
                    cursor="pointer"
                    onClick={() => openPDF(pdf.id)}
                    _hover={{
                      shadow: "md",
                      transform: "translateY(-1px)",
                    }}
                    transition="all 0.2s"
                  >
                    <Box
                      w="full"
                      h="24"
                      bg="gray.100"
                      borderRadius="md"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize="2xl" color="gray.400">
                        📄
                      </Text>
                    </Box>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      noOfLines={2}
                      textAlign="center"
                    >
                      {pdf.title || pdf.filename}
                    </Text>
                  </VStack>
                </GridItem>
              ))}
            </Grid>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
