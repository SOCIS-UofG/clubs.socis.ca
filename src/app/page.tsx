"use client";

import ClubCard from "@/components/ClubCard";
import { useEffect, useState } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { type Club } from "@/types/club";
import { trpc } from "@/lib/trpc/client";
import {
  ErrorMessage,
  MainWrapper,
  LoadingSpinnerCenter,
  CustomCursor,
  Navbar,
  LinkButton,
  NavbarTabs,
} from "socis-components";
import { hasPermissions } from "@/lib/utils/permissions";
import { Permission } from "@/types/permission";

/**
 * Wraps the main components in a session provider for next auth.
 *
 * @returns JSX.Element
 */
export default function ClubsPage() {
  return (
    <>
      <Navbar underlined={NavbarTabs.CLUBS} />
      <CustomCursor />
      {/**<Background text={"CLUBS"} animated={false} className="-z-10" /> */}

      <SessionProvider>
        <Components />
      </SessionProvider>
    </>
  );
}

/**
 * The main components for the clubs page. These are to be wrapped in a session provider
 * for next auth.
 *
 * @returns JSX.Element
 */
function Components(): JSX.Element {
  const { data: session, status: sessionStatus } = useSession();
  const { mutateAsync: getClubs, status: fetchStatus } =
    trpc.getAllClubs.useMutation();

  const [clubs, setClubs] = useState<Club[]>([]);

  /**
   * We need to access the clubs from the database.
   */
  useEffect(() => {
    /**
     * If the fetch status is not idle, then we don't need to
     * fetch the clubs again.
     */
    if (fetchStatus !== "idle") {
      return;
    }
    /**
     * Fetch the clubs from the database.
     */
    getClubs().then((res) => setClubs(res.clubs));
  }, [session]);

  /**
   * If the fetch is still in progress, display a loading spinner.
   */
  if (sessionStatus === "loading" || fetchStatus === "loading") {
    return <LoadingSpinnerCenter />;
  }

  /**
   * If the fetch failed, display an error message.
   *
   * TODO: Add a refresh button.
   */
  if (fetchStatus === "error") {
    return (
      <MainWrapper>
        <ErrorMessage>
          An error occurred while fetching the clubs. Please try again later.
        </ErrorMessage>
      </MainWrapper>
    );
  }

  /**
   * Store if the user is authenticated and can create clubs.
   */
  const CAN_CREATE_CLUB =
    session?.user && hasPermissions(session.user, [Permission.ADMIN]);

  /**
   * Return the main components
   */
  return (
    <MainWrapper className="fade-in items-start justify-start gap-12 px-12 pb-20 pt-36 lg:px-20">
      <div className="flex w-full flex-col items-start justify-start gap-3">
        <h1 className="text-left text-4xl font-extrabold uppercase text-white md:text-7xl lg:text-8xl">
          Umbrella Clubs
        </h1>
        <p className="max-w-2xl text-left text-sm font-thin text-white">
          Explore all of the clubs that SOCIS supports at The University of
          Guelph. If you are interested in starting a new club, please contact
          the executive team.
        </p>

        <div className="flex w-full flex-row items-start justify-start gap-3">
          <LinkButton
            href="https://initiatives.socis.ca"
            className="w-auto max-w-96 text-center text-xs sm:text-base"
          >
            See our initiatives
          </LinkButton>

          {CAN_CREATE_CLUB && (
            <LinkButton
              href="/create"
              className="w-auto max-w-96 text-center text-xs sm:text-base"
            >
              Create Club
            </LinkButton>
          )}
        </div>
      </div>

      {/**
       * Render all of the club cards
       */}
      <div className="flex w-full flex-wrap items-start justify-start gap-10">
        {clubs.map((club) => (
          <ClubCard user={session?.user} key={club.id} club={club} />
        ))}
      </div>
    </MainWrapper>
  );
}
