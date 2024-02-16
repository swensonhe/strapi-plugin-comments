import { Comment } from "../../types";

/**
 * @description Attach likes to comment object
 * @param {Object} comments
 * @param {Array} likes
 */
const attachLikesToCommentObject = (comment: Comment, likes: any[]) => {
  if (!comment.children || comment.children.length === 0) {
    comment.likes = likes.filter(
      (like) => like.commentID === comment.id.toString()
    );
    return comment;
  }
  comment.likes = likes.filter(
    (like) => like.commentID === comment.id.toString()
  );
  return attachLikesToComments(comment.children, likes);
};

/**
 * @description Attach likes to comments
 * @param {Array} comments
 * @param {Array} likes
 */
const attachLikesToComments = (comments: Comment[], likes: any[]) => {
  for (const comment of comments) {
    attachLikesToCommentObject(comment, likes);
  }
  return comments;
};

export default attachLikesToComments;
