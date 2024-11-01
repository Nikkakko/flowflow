import * as z from "zod";
import { SocialMediaPlatforms, Battle, Season } from "@prisma/client";

export const artistSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  nickName: z.string().min(2).max(50),
  image: z.string().url().optional(),
  wins: z.string().min(0), // TODO: Change to number
  loses: z.string().min(0), // TODO: Change to number
  bio: z.string().max(500),
  quotes: z.array(z.string().max(100)),
  socialMedia: z.array(
    z.object({
      name: z.nativeEnum(SocialMediaPlatforms),
      url: z.string().url(),
    })
  ),

  battlesParticipated: z.array(z.string()).optional(),
  seasonsWon: z.array(z.string()).optional(),
  battlesWon: z.array(z.string()).optional(),
});

//export type
export type ArtistZodType = z.infer<typeof artistSchema>;
