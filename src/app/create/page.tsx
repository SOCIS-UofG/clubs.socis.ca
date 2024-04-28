"use client";

import { type FormEvent, useState } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { type Session } from "next-auth";
import { hasPermissions } from "@/lib/utils/permissions";
import { Permission } from "@/types/global/permission";
import { useRouter } from "next/navigation";
import { type Club } from "@/types/club";
import { isValidClubData } from "@/lib/utils/clubs";
import config from "@/lib/config/club.config";
import { trpc } from "@/lib/trpc/client";
import { type FormStatus } from "@/types/global/status";
import Navbar from "@/components/ui/global/Navbar";
import CustomCursor from "@/components/ui/global/CustomCursor";
import MainWrapper from "@/components/ui/global/MainWrapper";
import {
  Spinner,
  Button,
  Input,
  Textarea,
  NextUIProvider,
} from "@nextui-org/react";
import Link from "next/link";

/**
 * Wraps the main components in a session provider for next auth.
 *
 * @returns JSX.Element
 */
export default function ClubCreationPage(): JSX.Element {
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
 * The main components for the clubs page. These are to be wrapped in a session provider
 * for next auth.
 *
 * @returns JSX.Element
 */
function Components(): JSX.Element {
  const { data: session, status: sessionStatus } = useSession();
  const { mutateAsync: createClub } = trpc.createClub.useMutation();
  const router = useRouter();

  const [creationStatus, setCreationStatus] = useState<FormStatus>("idle");
  const [club, setClub] = useState<Club>(config.club.default as Club);

  /**
   * If the club is being created, the user is not authenticated, or the
   * default club hasn't been generated (undefined), then return a loading
   * screen.
   */
  if (sessionStatus === "loading" || creationStatus === "loading" || !club) {
    return (
      <MainWrapper className="relative z-40 flex min-h-screen w-screen flex-col items-center justify-center">
        <Spinner size="lg" color="primary" />
      </MainWrapper>
    );
  }

  /**
   * Check if the user is authenticated.
   *
   * If the user is not authenticated, then return an invalid session component.
   */
  if (sessionStatus === "unauthenticated" || !session) {
    return (
      <MainWrapper className="relative z-40 flex min-h-screen w-screen flex-col items-center justify-center">
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
   * Check if the user has the permissions to create a club.
   *
   * If the user does not have the permissions, then return an invalid permissions component.
   */
  if (!hasPermissions(session.user, [Permission.ADMIN])) {
    return (
      <MainWrapper className="relative z-40 flex min-h-screen w-screen flex-col items-center justify-center">
        <h1 className="text-center text-3xl font-bold text-white lg:text-5xl">
          Invalid Permissions
        </h1>

        <div className="flex flex-col gap-5">
          <p className="text-center text-sm font-light text-white lg:text-base">
            You do not have the permissions to manage clubs.
          </p>
          <Button as={Link} href="/" color="default" size="sm">
            Go back
          </Button>
        </div>
      </MainWrapper>
    );
  }

  /**
   * Handle the form submission.
   *
   * @param e The form club.
   * @param club The club to create.
   * @param session The session of the user editing the club
   * @returns Promise<void>
   */
  async function onSubmit(
    e: FormEvent<HTMLFormElement>,
    club: Club,
    session: Session,
  ): Promise<void> {
    /**
     * Prclub the default form submission.
     */
    e.preventDefault();

    /**
     * Set the status to loading so that the user knows that the club is being created.
     */
    setCreationStatus("loading");

    /**
     * If the provideed data for the club being created is invalid, then
     * return an error message. This is so that empty clubs are not created.
     */
    if (!isValidClubData(club)) {
      setCreationStatus("empty_fields");

      return;
    }

    /**
     * Create the club using the API.
     */
    await createClub({
      accessToken: session.user.secret,
      club,
    })
      .then(() => {
        setCreationStatus("success");

        router.push("/");
      })
      .catch(() => {
        setCreationStatus("error");
      });
  }

  /**
   * Return the main components for the clubs page.
   */
  return (
    <MainWrapper className="flex min-h-screen w-screen flex-col items-start justify-start gap-5 p-10 pt-20 lg:p-20 lg:pt-44">
      <form
        className="flex w-full flex-col items-start justify-start gap-5"
        onSubmit={async (e) => onSubmit(e, club, session)}
      >
        {/** HEADER */}
        <h1 className="mb-2 text-5xl font-normal uppercase text-white md:text-7xl">
          Create Club
        </h1>

        {/**
         * CLUB NAME
         *
         * The user can add a name to the club.
         * This will be displayed on the club page.
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
            onChange={(e) => setClub({ ...club, name: e.target.value })}
          />
        </div>

        {/**
         * CLUB DESCRIPTION
         *
         * The user can add a description to the club.
         * This will be displayed on the club page.
         */}
        <div className="flex w-full flex-col items-start justify-start gap-2">
          <label className="text-white">Club Description</label>
          <Textarea
            className="w-full"
            maxLength={config.club.max.description}
            minLength={config.club.min.description}
            label="Description"
            placeholder="Description"
            onChange={(e) => setClub({ ...club, description: e.target.value })}
          />
        </div>

        {/**
         * CLUB Linktree
         *
         * The user can set the linktree of the club. This will be displayed on the club page.
         */}
        <div className="flex w-full flex-col items-start justify-start gap-2">
          <label className="text-white">Club Linktree</label>
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

        {/**
         * TODO: Add club image (banner) upload
         */}

        {/**
         * CREATE CLUB
         *
         * The user can create the club using the form.
         */}
        <div className="flex w-full flex-col items-center justify-center gap-2 sm:flex-row">
          <Button className="btn w-full" color="primary" type="submit">
            Create Club
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

      {/**
       * If the club was successfully created, then display a success message.
       *
       * This will appear before the user is redirected to the home page.
       */}
      {creationStatus === "success" && (
        <p className="text-primary">Club created successfully.</p>
      )}

      {/**
       * If the club was not successfully created, then display an error message.
       *
       * The user will have the chance to input the data again.
       */}
      {creationStatus === "error" && (
        <p className="text-red-500">Failed to create club.</p>
      )}

      {/**
       * If the user hasn't filled in all the fields, then display an error message.
       *
       * The user will have the chance to input the data again.
       */}
      {creationStatus === "empty_fields" && (
        <p className="text-red-500">
          Failed to create club. Please fill in all fields.
        </p>
      )}
    </MainWrapper>
  );
}
