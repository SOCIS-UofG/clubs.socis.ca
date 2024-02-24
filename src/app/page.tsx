"use client";

import ClubCard from "@/components/ClubCard";
import { useEffect, useState } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { type Club } from "@/types/club";
import {
  ErrorMessage,
  MainWrapper,
  LoadingSpinnerCenter,
  CustomCursor,
  Navbar,
  LinkButton,
} from "socis-components";
import { trpc } from "@/lib/trpc/client";
import { Permission } from "@/types/permission";

/**
 * Wraps the main components in a session provider for next auth.
 *
 * @returns JSX.Element
 */
export default function ClubsPage() {
  return (
    <>
      <Navbar />
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
      <ErrorMessage>
        An error occurred while fetching the clubs. Please try again later.
      </ErrorMessage>
    );
  }

  /**
   * If the user is authenticated and can create clubs, then they can create an club.
   */
  const CAN_CREATE_CLUB =
    session?.user && session.user.permissions.includes(Permission.ADMIN);

  /**
   * Return the main components
   */
  return (
    <>
      <CustomCursor />

      <MainWrapper className="fade-in-delay items-start justify-start gap-20 px-20 pb-20 pt-40">
        <div className="flex flex-col items-start justify-start gap-3">
          <h1 className="text-center text-4xl font-extrabold uppercase text-white lg:text-5xl">
            Clubs
          </h1>
          <p className="text-center text-sm font-thin text-white">Clubs para</p>
        </div>

        {/**
         * If the user is authenticated and can create clubs, then they can create an club.
         */}
        {CAN_CREATE_CLUB && (
          <LinkButton href="/clubs/create" className="w-40">
            Create Club
          </LinkButton>
        )}

        {/**
         * Render all of the club cards
         */}
        <div className="flex flex-wrap justify-center gap-10">
          {clubs.map((club) => (
            <ClubCard key={club.id} club={club} />
          ))}
        </div>
      </MainWrapper>
    </>
  );
}
