import { cn } from "@/lib/utils/cn";
import { type Club } from "@/types/club";
import { type User } from "next-auth";
import ClubDeleteButton from "./ClubDeleteButton";
import ClubEditButton from "./ClubEditButton";
import { hasPermissions } from "@/lib/utils/permissions";
import { Permission } from "@/types/permission";

/**
 * Props for the club card component.
 */
interface ClubCardProps {
  // Custom class name (styling)
  className?: string;

  // The user object. This will be used to determine whether to display
  // the edit/delete buttons.
  user?: User;

  // The club info
  club: Club;
}

/**
 * The club card component.
 *
 * @param props The props for the component.
 * @returns JSX.Element
 */
export default function ClubCard(props: ClubCardProps): JSX.Element {
  const CAN_MANAGE_CLUBS =
    props.user && hasPermissions(props.user, [Permission.ADMIN]);

  /**
   * Return the main component.
   */
  return (
    <div
      className={cn(
        "btn relative flex h-fit w-96 flex-col items-start justify-start rounded-lg border border-primary bg-secondary p-6 duration-300 ease-in-out",
        props.className,
      )}
    >
      {/**
       * EVENT NAME
       *
       * The name of the club.
       */}
      <h1 className="text-3xl font-extrabold uppercase tracking-wider text-white">
        {props.club.name}
      </h1>

      {/**
       * EVENT DESCRIPTION
       *
       * The description of the club.
       */}
      <p className="mt-1 line-clamp-3 h-7 w-full overflow-hidden text-sm font-thin text-white">
        {/**
         * Show an ellipsis if the description is too long.
         */}
        {props.club.description}
      </p>

      {/**
       * Edit and Delete buttons for the club.
       */}
      {props.user && CAN_MANAGE_CLUBS && (
        <div className="mt-4 flex h-fit w-full flex-row gap-2">
          <ClubEditButton club={props.club} />
          <ClubDeleteButton user={props.user} club={props.club} />
        </div>
      )}
    </div>
  );
}
