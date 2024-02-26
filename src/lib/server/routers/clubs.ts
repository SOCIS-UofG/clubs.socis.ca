import { Prisma } from "@/lib/prisma";
import { publicProcedure } from "../trpc";
import { z } from "zod";
import { hasPermissions } from "@/lib/utils/permissions";
import { Permission } from "@/types/permission";
import { type Club } from "@/types/club";
import config from "@/lib/config/club.config";
import { v4 as uuidv4 } from "uuid";

export const clubsRouter = {
  /**
   * Add a club to the database
   *
   * @returns The new club
   */
  createClub: publicProcedure
    .input(
      z.object({
        accessToken: z.string(),
        club: z.object({
          name: z.string().max(config.club.max.name).min(config.club.min.name),
          description: z
            .string()
            .max(config.club.max.description)
            .min(config.club.min.description),
          linktree: z
            .string()
            .max(config.club.max.linktree)
            .min(config.club.min.linktree)
            .optional(),
          image: z.string().optional(),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const user = await Prisma.getUserBySecretNoPassword(input.accessToken);
      if (!user) {
        return { success: false, club: null };
      }

      if (!hasPermissions(user, [Permission.ADMIN])) {
        return { success: false, club: null };
      }

      const club = input.club as Club;
      const newClub = await Prisma.createClub({
        id: uuidv4(),
        name: club.name,
        description: club.description,
        image: club.image || config.club.default.image,
        linktree: club.linktree || config.club.default.linktree,
      } as Club);

      if (!newClub) {
        return { success: false, club: null };
      }

      return { success: true, club: newClub };
    }),

  /**
   * Delete a club from the database
   *
   * @returns The deleted club
   */
  deleteClub: publicProcedure
    .input(
      z.object({
        accessToken: z.string(),
        id: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const user = await Prisma.getUserBySecretNoPassword(input.accessToken);
      if (!user) {
        return { success: false, club: null };
      }

      if (!hasPermissions(user, [Permission.ADMIN])) {
        return { success: false, club: null };
      }

      const club = await Prisma.deleteClubById(input.id);
      if (!club) {
        return { success: false, club: null };
      }

      return { success: true, club };
    }),

  /**
   * Update a club in the database
   *
   * @returns The updated club
   */
  updateClub: publicProcedure
    .input(
      z.object({
        accessToken: z.string(),
        club: z.object({
          id: z.string(),
          name: z.string().max(config.club.max.name).min(config.club.min.name),
          description: z
            .string()
            .max(config.club.max.description)
            .min(config.club.min.description),
          image: z.string().optional(),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const user = await Prisma.getUserBySecretNoPassword(input.accessToken);
      if (!user) {
        return { success: false, club: null };
      }

      if (!hasPermissions(user, [Permission.ADMIN])) {
        return { success: false, club: null };
      }

      const club = input.club as Club;
      const updatedClub = await Prisma.updateClubById(club.id, {
        name: club.name,
        description: club.description,
        image: club.image || config.club.default.image,
      } as Club);

      if (!updatedClub) {
        return { success: false, club: null };
      }

      return { success: true, club: updatedClub };
    }),

  /**
   * Get all of the clubs
   *
   * @returns The clubs
   */
  getAllClubs: publicProcedure.mutation(async () => {
    const clubs = await Prisma.getAllClubs();

    return { success: true, clubs };
  }),

  /**
   * Get a club by its id
   *
   * @returns The club
   */
  getClub: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const club = await Prisma.getClubById(input.id);
      if (!club) {
        return { success: false, club: null };
      }

      return { success: true, club };
    }),
};
