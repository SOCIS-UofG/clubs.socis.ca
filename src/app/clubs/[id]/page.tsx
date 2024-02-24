"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { type Club } from "@/types/club";
import {
  LoadingSpinnerCenter,
  MainWrapper,
  Navbar,
  CustomCursor,
  LinkButton,
} from "socis-components";
import { trpc } from "@/lib/trpc/client";

/**
 * Wraps the main components in a session provider for next auth.
 *
 * @returns JSX.Element
 */
export default function ClubPage(): JSX.Element {
  return (
    <>
      <Navbar />
      <CustomCursor />

      <SessionProvider>
        <Components />
      </SessionProvider>
    </>
  );
}

/**
 * The main components for the club page. These are to be wrapped in a session provider
 *
 * @returns JSX.Element
 */
function Components(): JSX.Element {
  const { status: sessionStatus } = useSession();

  const [club, setClub] = useState<Club | null>(null);
  const { mutateAsync: getClub, status } = trpc.getClub.useMutation();

  const path = usePathname();

  /**
   * Get the club id from the path
   */
  useEffect(() => {
    /**
     * If the fetch status is not idle, then we don't need to fetch the clubs again.
     */
    if (status !== "idle") {
      return;
    }

    /**
     * Get the club id from the path
     */
    const clubId = path.split("/").pop();
    if (!clubId) {
      return;
    }

    /**
     * Fetch the club from the database
     */
    getClub({ id: clubId }).then((res) => setClub(res.club));
  }, []);

  /**
   * If the user is currently being authenticated, display a loading spinner.
   */
  if (sessionStatus === "loading" || status === "loading") {
    return <LoadingSpinnerCenter />;
  }

  /**
   * If the club id is undefined, display an error message.
   */
  if (!club) {
    return (
      <MainWrapper>
        <h1 className="text-center text-3xl font-bold text-white lg:text-5xl">
          Invalid Club ID
        </h1>

        <div className="flex flex-col gap-5">
          <p className="text-center text-sm font-light text-white lg:text-base">
            The club that you provided is invalid.
          </p>
          <LinkButton href="/">Go back</LinkButton>
        </div>
      </MainWrapper>
    );
  }

  /**
   * Return the main components.
   */
  return (
    <MainWrapper>
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-primary p-10">
        <h1 className="text-6xl font-bold text-white">{club.name}</h1>
        <p className="text-sm font-thin text-white">{club.description}</p>
        <LinkButton href="/">Go back</LinkButton>
      </div>
    </MainWrapper>
  );
}
