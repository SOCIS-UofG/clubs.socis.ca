"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { type Club } from "@/types/club";
import { type Session } from "next-auth";
import config from "@/lib/config/club.config";
import { isValidClubData } from "@/lib/utils/clubs";
import { trpc } from "@/lib/trpc/client";
import { hasPermissions } from "@/lib/utils/permissions";
import { Permission } from "@/types/global/permission";
import { type FormStatus } from "@/types/global/status";
import Navbar from "@/components/ui/global/Navbar";
import CustomCursor from "@/components/ui/global/CustomCursor";
import MainWrapper from "@/components/ui/global/MainWrapper";
import {
  Button,
  Input,
  NextUIProvider,
  Spinner,
  Textarea,
} from "@nextui-org/react";

/**
 * Wraps the main components in a session provider for next auth.
 *
 * @returns JSX.Element
 */
export default function UpdateClubsPage(): JSX.Element {
  return (
    <NextUIProvider>
      <Navbar />
      <CustomCursor />

      <SessionProvider>
        <Components />
      </SessionProvider>
    </NextUIProvider>
  );
}

/**
 * The main components for the update clubs page. These are to be wrapped in a
 * session provider for next auth.
 *
 * @returns JSX.Element
 */
function Components(): JSX.Element {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [club, setClub] = useState<Club | undefined>(undefined);
  const [editStatus, setEditStatus] = useState<FormStatus>("idle");
  const [fetchStatus, setFetchStatus] = useState<FormStatus>("needs_fetch");
  const { mutateAsync: getClub } = trpc.getClub.useMutation();
  const { mutateAsync: updateClub } = trpc.updateClub.useMutation();

  /**
   * Get the club id from the url.
   */
  const path = usePathname();
  const clubId = path.split("/")[2];

  /**
   * Once the page loads, we want to fetch the club data so that we can
   * modify the existing club contents.
   */
  useEffect(() => {
    /**
     * If the club id is invalid or we are already fetching the club data,
     * then don't fetch the club data again.
     */
    if (!clubId || fetchStatus !== "needs_fetch") {
      return;
    }

    /**
     * Set the fetch status to loading so that we don't fetch the club again and
     * can display a loading screen to the user.
     */
    setFetchStatus("loading");

    /**
     * Fetch the club data from the database.
     */
    getClub({ id: clubId })
      .then((data) => {
        if (!data.club) {
          setFetchStatus("error");
          return;
        }

        setClub(data.club);
        setFetchStatus("success");
      })
      .catch(() => {
        setFetchStatus("error");
      });
  }, []);

  /**
   *
   * @param e The form club
   * @param club The club that the user is updating
   * @param session The current session (next auth)
   * @returns Promise<void>
   */
  async function onSubmit(
    e: FormEvent<HTMLFormElement>,
    club: Club,
    session: Session,
  ): Promise<void> {
    e.preventDefault();
    setEditStatus("loading");

    /**
     * If the provideed data for the club being created is invalid, then
     * return an error message. This is so that empty clubs are not created.
     */
    if (!isValidClubData(club)) {
      setEditStatus("empty_fields");

      return;
    }

    /**
     * Update the club in the database.
     */
    await updateClub({ accessToken: session.user.secret, club })
      .then(() => {
        setEditStatus("success");

        router.push("/");
      })
      .catch(() => {
        setEditStatus("error");
      });
  }

  /**
   * If the provided club id (from the url parameters) is invalid, then show an error message.
   */
  if (!clubId) {
    return (
      <MainWrapper className="flex min-h-screen w-screen flex-col items-center justify-center p-12">
        <h1 className="text-center text-3xl font-bold text-white lg:text-5xl">
          Invalid Club
        </h1>

        <div className="flex flex-col gap-5">
          <p className="text-center text-sm font-light text-white lg:text-base">
            The club that you provided is invalid.
          </p>
          <Button className="btn" as={Link} color="primary" href="/">
            Go back
          </Button>
        </div>
      </MainWrapper>
    );
  }

  /**
   * If we are currently signing the user in, the club is invalid,
   * or we are still fetching the club data, show a loading screen.
   */
  if (
    !club ||
    sessionStatus === "loading" ||
    fetchStatus === "loading" ||
    editStatus === "loading"
  ) {
    return (
      <MainWrapper className="flex min-h-screen w-screen flex-col items-center justify-center">
        <Spinner size="lg" color="primary" />
      </MainWrapper>
    );
  }

  /**
   * If the user is not signed in, then show an error message.
   */
  if (sessionStatus !== "authenticated") {
    return (
      <MainWrapper className="flex min-h-screen w-screen flex-col items-center justify-center p-12">
        <h1 className="text-center text-3xl font-bold text-white lg:text-5xl">
          Invalid Session
        </h1>

        <div className="flex flex-col gap-5">
          <p className="text-center text-sm font-light text-white lg:text-base">
            Please sign in to proceed.
          </p>
          <Button
            className="btn"
            as={Link}
            color="primary"
            href="https://auth.socis.ca/signin"
          >
            Sign in
          </Button>
        </div>
      </MainWrapper>
    );
  }

  /**
   * If there was an error with fetching the club, show an error message.
   */
  if (fetchStatus === "error") {
    return (
      <MainWrapper className="flex min-h-screen w-screen flex-col items-center justify-center p-12">
        <h1 className="text-center text-3xl font-bold text-white lg:text-5xl">
          Failed to fetch club
        </h1>

        <div className="flex flex-col gap-5">
          <p className="text-center text-sm font-light text-white lg:text-base">
            There was an error fetching the club data.
          </p>
          <Button className="btn" as={Link} color="primary" href="/">
            Go back
          </Button>
        </div>
      </MainWrapper>
    );
  }

  /**
   * Check if the user has the permissions to edit a club.
   *
   * If the user does not have the permissions, then return an invalid permissions component.
   */
  if (!hasPermissions(session.user, [Permission.ADMIN])) {
    return (
      <MainWrapper className="flex min-h-screen w-screen flex-col items-center justify-center p-12">
        <h1 className="text-center text-3xl font-bold text-white lg:text-5xl">
          Invalid Permissions
        </h1>

        <div className="flex flex-col gap-5">
          <p className="text-center text-sm font-light text-white lg:text-base">
            You do not have the permissions to manage clubs.
          </p>
          <Button
            className="btn"
            as={Link}
            color="primary"
            href="https://auth.socis.ca/signin"
          >
            Switch accounts
          </Button>
        </div>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper className="flex min-h-screen w-screen flex-col items-start justify-start gap-5 p-10 pt-20 lg:p-20 lg:pt-44">
      <form
        className="flex w-full flex-col items-start justify-start gap-5"
        onSubmit={async (e) => onSubmit(e, club, session)}
      >
        <h1 className="mb-2 text-5xl font-normal uppercase text-white md:text-7xl">
          Update Club
        </h1>

        {/**
         * CLUB NAME
         *
         * The user can set the name of the club. This will be displayed on the club page.
         */}
        <div className="flex w-full flex-col items-start justify-start gap-2">
          <label className="text-white">Club Name</label>
          <Input
            className="w-full"
            maxLength={config.club.max.name}
            minLength={config.club.min.name}
            label="Name"
            placeholder="Name"
            type="text"
            value={club.name}
            onChange={(e) => setClub({ ...club, name: e.target.value })}
          />
        </div>

        {/**
         * CLUB DESCRIPTION
         *
         * The user can set the description of the club. This will be displayed on the club page.
         */}
        <div className="flex w-full flex-col items-start justify-start gap-2">
          <label className="mb-2 mt-5 text-white">Club Description</label>
          <Textarea
            className="w-full"
            maxLength={config.club.max.description}
            minLength={config.club.min.description}
            label="Description"
            placeholder="Description"
            value={club.description}
            onChange={(e) => setClub({ ...club, description: e.target.value })}
          />
        </div>

        {/**
         * CLUB Linktree
         *
         * The user can set the linktree of the club. This will be displayed on the club page.
         */}
        <div className="flex w-full flex-col items-start justify-start gap-2">
          <label className="mb-2 text-white">Club Linktree</label>
          <Input
            className="w-full"
            maxLength={config.club.max.linktree}
            minLength={config.club.min.linktree}
            label="Linktree"
            placeholder="Linktree"
            type="text"
            value={club.linktree}
            onChange={(e) => setClub({ ...club, linktree: e.target.value })}
          />
        </div>

        <div className="flex w-full flex-col items-center justify-center gap-2 sm:flex-row">
          <Button className="btn w-full" color="primary" type="submit">
            Update Club
          </Button>
          <Button
            className="btn w-full lg:w-1/2"
            as={Link}
            color="default"
            href="/"
          >
            Cancel
          </Button>
        </div>
      </form>

      {editStatus === "success" && (
        <p className="text-primary">Club updated successfully.</p>
      )}

      {editStatus === "error" && (
        <p className="text-red-500">Failed to update club.</p>
      )}

      {editStatus === "empty_fields" && (
        <p className="text-red-500">Please fill in all fields.</p>
      )}
    </MainWrapper>
  );
}
