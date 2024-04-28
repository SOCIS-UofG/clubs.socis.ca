"use client";

import ClubCard from "@/components/ui/ClubCard";
import { useEffect, useState } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { type Club } from "@/types/club";
import { trpc } from "@/lib/trpc/client";
import { hasPermissions } from "@/lib/utils/permissions";
import { Permission } from "@/types/global/permission";
import { Button, NextUIProvider, Spinner } from "@nextui-org/react";
import Navbar from "@/components/ui/global/Navbar";
import CustomCursor from "@/components/ui/global/CustomCursor";
import Background from "@/components/ui/global/Background";
import MainWrapper from "@/components/ui/global/MainWrapper";
import Link from "next/link";
import { type Status } from "@/types/global/status";

/**
 * Wraps the main components in a session provider for next auth.
 *
 * @returns JSX.Element
 */
export default function ClubsPage() {
  return (
    <NextUIProvider>
      <Navbar />
      <CustomCursor />
      <Background text={"CLUBS"} animated={false} />

      <SessionProvider>
        <Components />
      </SessionProvider>
    </NextUIProvider>
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
  const { mutateAsync: getClubs } = trpc.getAllClubs.useMutation();

  const [clubs, setClubs] = useState<Club[]>([]);
  const [status, setStatus] = useState<Status>("idle");

  /**
   * We need to access the clubs from the database.
   */
  useEffect(() => {
    /**
     * If the fetch status is not idle, then we don't need to
     * fetch the clubs again.
     */
    if (status !== "idle") {
      return;
    }

    setStatus("loading");

    /**
     * Fetch the clubs from the database.
     */
    getClubs()
      .then((res) => {
        setClubs(res.clubs);
        setStatus("success");
      })
      .catch(() => {
        setStatus("error");
      });
  }, [session]);

  /**
   * If the fetch is still in progress, display a loading spinner.
   */
  if (sessionStatus === "loading" || status === "loading") {
    return (
      <MainWrapper className="relative z-40 flex min-h-screen w-screen flex-col items-center justify-center">
        <Spinner size="lg" color="primary" />
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
    <MainWrapper className="fade-in relative z-40 flex min-h-screen w-screen flex-col items-start justify-start gap-12 px-12 pb-20 pt-36 lg:px-20">
      <div className="flex w-full flex-col items-start justify-start gap-3">
        <h1 className="text-left text-4xl font-extrabold uppercase text-white md:text-7xl lg:text-8xl">
          Umbrella Clubs
        </h1>
        <p className="max-w-2xl text-left text-sm font-thin text-white">
          Explore all of the clubs that SOCIS supports at The University of
          Guelph. If you are interested in starting a new club, please contact
          the executive team.
        </p>

        <div className="flex w-full flex-wrap items-start justify-start gap-3">
          <Button
            as={Link}
            color="primary"
            href="https://initiatives.socis.ca"
            className="btn"
          >
            See our initiatives
          </Button>

          {CAN_CREATE_CLUB && (
            <Button as={Link} color="primary" href="/create" className="btn">
              Create Club
            </Button>
          )}
        </div>

        {status === "error" && (
          <p className="text-red-500">
            Failed to fetch clubs. Please try again.
          </p>
        )}
      </div>

      {/**
       * Render all of the club cards
       */}
      <div className="flex w-full flex-wrap items-start justify-start gap-10">
        {clubs.map((club) => (
          <ClubCard user={session?.user} key={club.id} club={club as Club} />
        ))}
      </div>
    </MainWrapper>
  );
}
