import { type Club } from "@/types/club";
import config from "@/lib/config/club.config";

/**
 * Check if a club is valid
 * 
 * @param club The club to check
 * @returns Whether or not the club is valid
 */
export function isValidClubData(club: Club): boolean {
  /**
   * Check if the club object is invalid
   *
   * For this to be invalid, the club must be:
   * - undefined
   */
  if (!club) {
    return false;
  }

  /**
   * Check if the club's name is invalid
   *
   * For this to be invalid, the club's name must be:
   * - empty string
   * - undefined
   * - longer than the max club name length
   * - shorter than the min club name length
   */
  if (
    !club.name ||
    club.name.length > config.club.max.name ||
    club.name.length < config.club.min.name
  ) {
    return false;
  }

  /**
   * Check if the club's description is invalid
   *
   * For this to be invalid, the club's description must be:
   * - empty string
   * - undefined
   * - longer than the max club description length
   * - shorter than the min club description length
   */
  if (
    !club.description ||
    club.description.length > config.club.max.description ||
    club.description.length < config.club.min.description
  ) {
    return false;
  }

  /**
   * Return true if the club is valid
   */
  return true;
}
