import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Text,
  Textarea,
  Button,
  HStack,
  Badge,
  useToast,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { CommentItem } from "./CommentItem";
import { commentApi } from "../lib/api";
import { useSocket } from "./SocketProvider";
import { socketManager } from "../lib/socket";
import type { Comment, CommentFormData } from "../types";

interface CommentSectionProps {
  pdfId: string;
  currentPage: number;
  currentUserId?: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  pdfId,
  currentPage,
  currentUserId,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const { emitComment, currentUser } = useSocket();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isValid },
  } = useForm<CommentFormData>({
    defaultValues: {
      content: "",
      pageNumber: currentPage,
    },
  });

  const content = watch("content");

  // Load initial comments
  useEffect(() => {
    loadComments();
  }, [pdfId]);

  // Update page number when current page changes
  useEffect(() => {
    reset({ content: "", pageNumber: currentPage });
  }, [currentPage, reset]);

  // Set up socket listeners for real-time comments
  useEffect(() => {
    const handleNewComment = (comment: Comment) => {
      setComments((prev) => [...prev, comment]);

      // Show notification for comments from other users
      if (comment.authorId !== currentUserId) {
        toast({
          title: `${comment.authorName} added a comment on Page ${comment.pageNumber}`,
          status: "info",
          duration: 3000,
          isClosable: true,
          position: "bottom",
        });
      }
    };

    const handleCommentUpdate = (updatedComment: Comment) => {
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === updatedComment.id ? updatedComment : comment
        )
      );
    };

    const handleCommentDelete = ({ commentId }: { commentId: string }) => {
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    };

    const handleCommentsSync = ({
      comments: syncedComments,
    }: {
      comments: Comment[];
    }) => {
      setComments(syncedComments);
    };

    // Register socket listeners
    socketManager.on("comment:add", handleNewComment);
    socketManager.on("comment:update", handleCommentUpdate);
    socketManager.on("comment:delete", handleCommentDelete);
    socketManager.on("comments:sync", handleCommentsSync);

    return () => {
      // Cleanup listeners
      socketManager.off("comment:add", handleNewComment);
      socketManager.off("comment:update", handleCommentUpdate);
      socketManager.off("comment:delete", handleCommentDelete);
      socketManager.off("comments:sync", handleCommentsSync);
    };
  }, [currentUserId, toast]);

  const loadComments = async () => {
    try {
      const response = await commentApi.getComments(pdfId);
      setComments(response.data);
    } catch (error) {
      toast({
        title: "Error loading comments",
        description: "Failed to load comments for this PDF",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: CommentFormData) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to add comments",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newComment: Omit<Comment, "id" | "timestamp"> = {
        content: data.content,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        pageNumber: data.pageNumber,
      };

      // Emit comment via socket for real-time updates
      emitComment(newComment);

      // Also save to API for persistence
      await commentApi.addComment(pdfId, newComment);

      // Reset form
      reset({ content: "", pageNumber: currentPage });

      toast({
        title: "Comment added",
        description: "Your comment has been added successfully",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to add comment",
        description: "Please try again later",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentApi.deleteComment(pdfId, commentId);
      socketManager.emit("comment:delete", { commentId });

      toast({
        title: "Comment deleted",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to delete comment",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Filter comments for current page
  const currentPageComments = comments.filter(
    (comment) => comment.pageNumber === currentPage
  );

  const allPageComments = comments.filter(
    (comment) => comment.pageNumber !== currentPage
  );

  return (
    <VStack spacing={4} align="stretch" h="full">
      {/* Comment Form */}
      <Box
        bg="white"
        p={4}
        borderRadius="lg"
        border="1px"
        borderColor="gray.200"
        shadow="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack spacing={3} align="stretch">
            <Text fontSize="md" fontWeight="semibold" color="gray.800">
              Add a comment...
            </Text>

            <Textarea
              {...register("content", { required: true, minLength: 1 })}
              placeholder="Write your comment here... (Markdown supported)"
              resize="vertical"
              minH="80px"
              fontSize="sm"
              borderColor="gray.300"
              _focus={{
                borderColor: "brand.500",
                boxShadow: "0 0 0 1px #f97316",
              }}
            />

            <HStack justify="space-between" align="center">
              <HStack spacing={2}>
                <Badge colorScheme="brand" variant="subtle">
                  Page {currentPage}
                </Badge>
                <Text fontSize="xs" color="gray.500">
                  Markdown
                </Text>
              </HStack>

              <Button
                type="submit"
                colorScheme="brand"
                size="sm"
                isLoading={isSubmitting}
                isDisabled={!isValid || !content?.trim()}
              >
                Add Comment
              </Button>
            </HStack>
          </VStack>
        </form>
      </Box>

      {/* Comments List */}
      <Box flex={1} overflow="auto">
        {isLoading ? (
          <Flex justify="center" py={8}>
            <Spinner size="md" color="brand.500" />
          </Flex>
        ) : (
          <VStack spacing={4} align="stretch">
            {/* Current page comments */}
            {currentPageComments.length > 0 && (
              <VStack spacing={3} align="stretch">
                <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                  Comments on this page ({currentPageComments.length})
                </Text>
                {currentPageComments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    currentUserId={currentUserId}
                    onDelete={handleDeleteComment}
                  />
                ))}
              </VStack>
            )}

            {/* Other page comments */}
            {allPageComments.length > 0 && (
              <VStack spacing={3} align="stretch">
                <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                  Other comments ({allPageComments.length})
                </Text>
                {allPageComments
                  .sort(
                    (a, b) =>
                      new Date(b.timestamp).getTime() -
                      new Date(a.timestamp).getTime()
                  )
                  .slice(0, 5)
                  .map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      currentUserId={currentUserId}
                      onDelete={handleDeleteComment}
                    />
                  ))}
              </VStack>
            )}

            {/* No comments state */}
            {comments.length === 0 && (
              <Box
                textAlign="center"
                py={12}
                px={6}
                bg="gray.50"
                borderRadius="lg"
                border="1px"
                borderColor="gray.200"
              >
                <Text color="gray.500" mb={2}>
                  No comments yet
                </Text>
                <Text fontSize="sm" color="gray.400">
                  Be the first to add a comment to this PDF
                </Text>
              </Box>
            )}
          </VStack>
        )}
      </Box>
    </VStack>
  );
};
 