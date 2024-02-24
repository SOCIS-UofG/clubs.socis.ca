import { type Club } from "@/types/club";
import Link from "next/link";

/**
 * The props for the component.
 */
interface Props {
  club: Club;
}

/**
 * The edit button for clubs.
 *
 * @param props The props for the component.
 * @returns JSX.Element
 */
export default function ClubEditButton(props: Props): JSX.Element {
  /**
   * Return the main component.
   */
  return (
    <Link
      href={`/edit/${props.club.id}`}
      className="flex h-10 min-h-[2.5rem] flex-col items-center justify-center rounded-lg border border-primary px-7 text-center text-sm font-thin text-white hover:bg-emerald-900/50"
    >
      Edit
    </Link>
  );
}
