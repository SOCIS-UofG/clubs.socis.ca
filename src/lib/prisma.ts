import { PrismaClient } from "@prisma/client";
import { type User } from "next-auth";
import { type Club } from "@/types/club";

export class Prisma extends PrismaClient {
  constructor() {
    super();
    this.$connect();
  }

  /**
   * Get a table
   *
   * @param table The table to get
   * @returns The table
   */
  public static readonly getTable = (table: string) => {
    const global = globalThis as any;
    return global.prisma[table];
  };

  /**
   * Finds many rows in a table
   *
   * @param table The table to find in
   * @param opts The find options
   * @returns The rows found
   */
  public static readonly findMany = async <T>(
    table: string,
    opts: any,
  ): Promise<T[]> => {
    try {
      const tableRef: any = Prisma.getTable(table);

      return (await tableRef.findMany(opts)) as T[];
    } catch {
      return [];
    }
  };

  /**
   * Finds a row in a table
   *
   * @param table The table to find in
   * @param opts The find options
   * @returns The row found, or null if it doesn't exist
   */
  public static readonly findOne = async <T>(
    table: string,
    opts: any,
  ): Promise<T | null> => {
    try {
      const tableRef: any = Prisma.getTable(table);

      return (await tableRef.findFirst(opts)) as T;
    } catch {
      return null;
    }
  };

  /**
   * Creates a row in a table
   *
   * @param table The table to create in
   * @param opts The creation options
   * @returns The created row
   */
  public static readonly create = async <T>(
    table: string,
    opts: any,
  ): Promise<T | null> => {
    try {
      const tableRef: any = Prisma.getTable(table);

      return (await tableRef.create(opts)) as T;
    } catch {
      return null;
    }
  };

  /**
   * Updates a row in a table
   *
   * @param table The table to update
   * @param where The where clause to update
   * @param data The data to update
   * @returns The updated row
   */
  public static readonly update = async <T>(
    table: string,
    data: any,
  ): Promise<T | null> => {
    try {
      const tableRef: any = Prisma.getTable(table);

      return (await tableRef.update(data)) as T;
    } catch {
      return null;
    }
  };

  /**
   * Deletes a row from a table
   *
   * @param table The table to delete from
   * @param opts The delete options
   * @returns The deleted row
   */
  public static readonly delete = async <T>(
    table: string,
    opts: any,
  ): Promise<T | null> => {
    try {
      const tableRef: any = Prisma.getTable(table);

      return (await tableRef.delete(opts)) as T;
    } catch {
      return null;
    }
  };

  /**
   * Get all users in the database (no password or secret)
   *
   * @returns The users
   */
  public static readonly getAllUsersSecure = async (): Promise<User[]> => {
    return await Prisma.findMany("user", {
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        permissions: true,
        roles: true,

        // ignore password and secret
        password: false,
        secret: false,
      },
    });
  };

  /**
   * Get an user by their email
   *
   * @param email The user's email
   * @returns The user
   */
  public static readonly getUserByEmailNoPassword = async (
    email: string,
  ): Promise<User | null> => {
    return await Prisma.findOne("user", {
      where: {
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        secret: true,
        permissions: true,
        roles: true,

        // ignore password
        password: false,
      },
    });
  };

  /**
   * Get an user by their secret
   *
   * @param secret The user's secret
   * @returns The user
   */
  public static readonly getUserBySecretNoPassword = async (
    secret: string,
  ): Promise<User | null> => {
    return await Prisma.findOne("user", {
      where: {
        secret,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        secret: true,
        permissions: true,
        roles: true,

        // ignore password
        password: false,
      },
    });
  };

  /**
   * Get all of the clubs
   *
   * @returns The clubs
   */
  public static readonly getAllClubs = async (): Promise<Club[]> => {
    return await Prisma.findMany("club", {});
  };

  /**
   * Get a club by its id
   *
   * @param clubId The club id
   * @returns The club
   */
  public static readonly getClubById = async (
    clubId: string,
  ): Promise<Club | null> => {
    return await Prisma.findOne("club", {
      where: {
        id: clubId,
      },
    });
  };

  /**
   * Delete a club by its id
   *
   * @param clubId The club id
   * @returns The deleted club
   */
  public static readonly deleteClubById = async (
    clubId: string,
  ): Promise<Club | null> => {
    return await Prisma.delete("club", {
      where: {
        id: clubId,
      },
    });
  };

  /**
   * Create a club
   *
   * @param club The club to create
   * @returns The created club
   */
  public static readonly createClub = async (
    club: Club,
  ): Promise<Club | null> => {
    return await Prisma.create("club", {
      data: club,
    });
  };

  /**
   * Update a club
   *
   * @param clubId The club id
   * @param data The data to update
   * @returns The updated club
   */
  public static readonly updateClubById = async (
    clubId: string,
    data: Club,
  ): Promise<Club | null> => {
    return await Prisma.update("club", {
      where: {
        id: clubId,
      },
      data,
    });
  };
}

// create a global prisma instance
const global = globalThis as any;
if (!global.prisma) {
  global.prisma = new Prisma();
}
