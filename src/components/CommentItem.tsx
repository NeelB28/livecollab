import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Badge,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import ReactMarkdown from "react-markdown";
import type { Comment } from "../types";

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onEdit?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  onEdit,
  onDelete,
}) => {
  const bgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const isOwner = currentUserId === comment.authorId;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60)
      return `${diffInMinutes} min${diffInMinutes === 1 ? "" : "s"} ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7)
      return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;

    return date.toLocaleDateString();
  };

  return (
    <Box
      bg={bgColor}
      border="1px"
      borderColor={borderColor}
      borderRadius="lg"
      p={4}
      shadow="sm"
      transition="all 0.2s"
      _hover={{ shadow: "md" }}
    >
      <VStack spacing={3} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="flex-start">
          <HStack spacing={3}>
            <Avatar
              size="sm"
              name={comment.authorName}
              bg="brand.500"
              color="white"
            />
            <VStack spacing={0} align="flex-start">
              <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                {comment.authorName}
              </Text>
              <HStack spacing={2}>
                <Text fontSize="xs" color="gray.500">
                  {formatTimestamp(comment.timestamp)}
                </Text>
                <Badge colorScheme="brand" variant="subtle" fontSize="xs">
                  Page {comment.pageNumber}
                </Badge>
              </HStack>
            </VStack>
          </HStack>

          {/* Action buttons for comment owner */}
          {isOwner && (onEdit || onDelete) && (
            <HStack spacing={1}>
              {onEdit && (
                <IconButton
                  aria-label="Edit comment"
                  icon={<EditIcon />}
                  size="xs"
                  variant="ghost"
                  colorScheme="gray"
                  onClick={() => onEdit(comment.id)}
                />
              )}
              {onDelete && (
                <IconButton
                  aria-label="Delete comment"
                  icon={<DeleteIcon />}
                  size="xs"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => onDelete(comment.id)}
                />
              )}
            </HStack>
          )}
        </HStack>

        {/* Comment Content */}
        <Box
          fontSize="sm"
          color="gray.700"
          sx={{
            "& p": {
              margin: 0,
              marginBottom: 2,
            },
            "& p:last-child": {
              marginBottom: 0,
            },
            "& strong": {
              fontWeight: "semibold",
            },
            "& em": {
              fontStyle: "italic",
            },
            "& code": {
              backgroundColor: "gray.100",
              padding: "2px 4px",
              borderRadius: "4px",
              fontSize: "xs",
            },
            "& pre": {
              backgroundColor: "gray.100",
              padding: 3,
              borderRadius: "md",
              overflow: "auto",
              fontSize: "xs",
            },
            "& ul, & ol": {
              paddingLeft: 4,
            },
            "& blockquote": {
              borderLeft: "4px solid",
              borderColor: "brand.200",
              paddingLeft: 3,
              marginLeft: 0,
              fontStyle: "italic",
              color: "gray.600",
            },
          }}
        >
          <ReactMarkdown>{comment.content}</ReactMarkdown>
        </Box>
      </VStack>
    </Box>
  );
};
 