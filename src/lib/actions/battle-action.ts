"use server";
import * as z from "zod";
import db from "@/lib/db/db";
import { revalidatePath } from "next/cache";
import { actionClient } from "@/lib/safe-action";
import rateLimit from "@/lib/rate-limit";
import { getSession } from "../auth/session";
import { NextResponse } from "next/server";

const limiter = rateLimit({
  interval: 60000, // 60 seconds
  uniqueTokenPerInterval: 500,
});

const voteSchema = z.object({
  battleId: z.string(),
  hasVoted: z.boolean(),
});

const commentSchema = z.object({
  battleId: z.string(),
  content: z.string(),
});

const deleteCommentSchema = z.object({
  commentId: z.string(),
});

const editCommentSchema = z.object({
  commentId: z.string(),
  content: z.string(),
});

export const addVoteToBattle = actionClient
  .schema(voteSchema)
  .action(async ({ parsedInput }) => {
    const { battleId, hasVoted } = parsedInput;
    const session = await getSession();
    if (!session?.user) {
      return {
        error: "Unauthorized",
        status: 401,
      };
    }
    const user = session.user;
    const userId = user.id;

    try {
      if (!userId) {
        return { error: "You must be logged in to vote" };
      }
      // Rate limit: 5 votes per minute per user
      await limiter.check(5, `vote_${userId}`);

      if (!battleId || !userId) {
        return { error: "Invalid data" };
      }

      // Check if vote exists first
      const existingVote = await db.battleVote.findUnique({
        where: {
          userId_battleId: {
            userId: userId,
            battleId: battleId,
          },
        },
      });

      if (hasVoted && existingVote) {
        // Delete vote
        await db.battleVote.delete({
          where: {
            userId_battleId: {
              userId: userId,
              battleId: battleId,
            },
          },
        });
      } else if (!hasVoted && !existingVote) {
        // Create vote only if it doesn't exist
        await db.battleVote.create({
          data: {
            userId,
            battleId,
          },
        });
      }

      revalidatePath(`/battles`);
      return { success: true };
    } catch (error) {
      console.error("Vote operation failed:", error);
      if (error instanceof Error && error.message === "Rate limit exceeded") {
        return { error: "Too many requests. Please try again later." };
      }
      return { error: "Failed to process vote" };
    }
  });

export const addCommentToBattle = actionClient
  .schema(commentSchema)
  .action(async ({ parsedInput }) => {
    const { battleId, content } = parsedInput;
    const session = await getSession();
    const user = session?.user;

    try {
      if (!battleId || !user || !content) {
        return { error: "Invalid data" };
      }

      // Rate limit: 10 comments per minute per user
      await limiter.check(10, `comment_${user.id}`);

      const newComment = await db.comment.create({
        data: {
          userId: user.id,
          battleId,
          content,
        },
        include: {
          user: true,
          commentLikes: true,
        },
      });

      revalidatePath(`/battles`);
      return { success: true, newComment };
    } catch (error) {
      console.error("Comment operation failed:", error);
      return { error: "Failed to process comment" };
    }
  });

// user can delete their own comments

export const deleteComment = actionClient
  .schema(deleteCommentSchema)
  .action(async ({ parsedInput }) => {
    const { commentId } = parsedInput;

    const session = await getSession();
    if (!session?.user) {
      return {
        error: "Unauthorized",
        status: 401,
      };
    }
    const user = session.user;

    try {
      if (!commentId || !user) {
        return { error: "Invalid data" };
      }

      const comment = await db.comment.findUnique({
        where: {
          id: commentId,
        },
      });

      if (!comment) {
        return { error: "Comment not found" };
      }

      if (comment.userId !== user.id) {
        return { error: "Unauthorized" };
      }

      await db.comment.delete({
        where: {
          id: commentId,
        },
      });

      revalidatePath(`/battles`);
      return { success: true, commentId };
    } catch (error) {
      console.error("Delete comment operation failed:", error);
      return { error: "Failed to delete comment" };
    }
  });

// user can edit their own comments

export const editComment = actionClient
  .schema(editCommentSchema)
  .action(async ({ parsedInput }) => {
    const { commentId, content } = parsedInput;
    const session = await getSession();
    if (!session?.user) {
      return {
        error: "Unauthorized",
        status: 401,
      };
    }
    const user = session.user;

    try {
      if (!commentId || !user || !content) {
        return { error: "Invalid data" };
      }

      const comment = await db.comment.findUnique({
        where: {
          id: commentId,
        },
      });

      if (!comment) {
        return { error: "Comment not found" };
      }

      if (comment.userId !== user.id) {
        return { error: "Unauthorized" };
      }

      const updatedComment = await db.comment.update({
        where: {
          id: commentId,
        },
        data: {
          content,
        },
        include: {
          user: true,
        },
      });

      revalidatePath(`/battles`);
      return { success: true, updatedComment };
    } catch (error) {
      console.error("Edit comment operation failed:", error);
      return { error: "Failed to edit comment" };
    }
  });

//add like to comment

const addLikeToCommentInput = z.object({
  commentId: z.string(),
});

export const addLikeToComment = actionClient
  .schema(addLikeToCommentInput)
  .action(async ({ parsedInput }) => {
    const { commentId } = parsedInput;
    const session = await getSession();
    if (!session?.user) {
      return {
        error: "Unauthorized",
        status: 401,
      };
    }
    const user = session.user;

    try {
      if (!commentId || !user) {
        return { error: "Invalid data" };
      }

      const comment = await db.comment.findUnique({
        where: {
          id: commentId,
        },
      });

      if (!comment) {
        return { error: "Comment not found" };
      }

      const existingLike = await db.commentLike.findUnique({
        where: {
          userId_commentId: {
            userId: user.id,
            commentId: commentId,
          },
        },
      });

      if (existingLike) {
        await db.commentLike.delete({
          where: {
            userId_commentId: {
              userId: user.id,
              commentId: commentId,
            },
          },
        });
      } else {
        await db.commentLike.create({
          data: {
            userId: user.id,
            commentId,
          },
        });
      }

      //current count of likes
      const likesCount = await db.commentLike.count({
        where: {
          commentId,
        },
      });

      revalidatePath(`/battles`);
      return { success: true, likesCount };
    } catch (error) {
      console.error("Like comment operation failed:", error);
      return { error: "Failed to like comment" };
    }
  });
