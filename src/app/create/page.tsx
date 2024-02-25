"use client";

import { type FormEvent, useState } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { type Session } from "next-auth";
import { hasPermissions } from "@/lib/utils/permissions";
import { Permission } from "@/types/permission";
import {
  ErrorMessage,
  SuccessMessage,
  MainWrapper,
  LoadingSpinnerCenter,
  CustomCursor,
  Navbar,
  LinkButton,
  Button,
} from "socis-components";
import { useRouter } from "next/navigation";
import { type Club } from "@/types/club";
import { isValidClubData } from "@/lib/utils/clubs";
import config from "@/lib/config/club.config";
import { trpc } from "@/lib/trpc/client";
import { v4 as uuidv4 } from "uuid";

/**
 * The status of the form.
 */
enum FormStatus {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR,
  EMPTY_FIELDS,
}

/**
 * Wraps the main components in a session provider for next auth.
 *
 * @returns JSX.Element
 */
export default function ClubCreationPage(): JSX.Element {
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
 * The main components for the clubs page. These are to be wrapped in a session provider
 * for next auth.
 *
 * @returns JSX.Element
 */
function Components(): JSX.Element {
  const { data: session, status: sessionStatus } = useSession();
  const { mutateAsync: createClub } = trpc.createClub.useMutation();
  const router = useRouter();

  const [creationStatus, setCreationStatus] = useState(FormStatus.IDLE);
  const [club, setClub] = useState<Club>({
    id: uuidv4(),
    ...config.club.default,
  });

  /**
   * If the club is being created, the user is not authenticated, or the
   * default club hasn't been generated (undefined), then return a loading
   * screen.
   */
  if (
    sessionStatus === "loading" ||
    creationStatus === FormStatus.LOADING ||
    !club
  ) {
    return <LoadingSpinnerCenter />;
  }

  /**
   * Check if the user is authenticated.
   *
   * If the user is not authenticated, then return an invalid session component.
   */
  if (sessionStatus === "unauthenticated" || !session) {
    return (
      <MainWrapper>
        <h1 className="text-center text-3xl font-bold text-white lg:text-5xl">
          Invalid Session
        </h1>

        <div className="flex flex-col gap-5">
          <p className="text-center text-sm font-light text-white lg:text-base">
            Please sign in to proceed.
          </p>
          <a
            href="https://auth.socis.ca/signin"
            className="rounded-lg border border-primary px-10 py-3 text-center font-thin text-white hover:bg-emerald-900/50"
          >
            Sign in
          </a>
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
      <MainWrapper>
        <h1 className="text-center text-3xl font-bold text-white lg:text-5xl">
          Invalid Permissions
        </h1>

        <div className="flex flex-col gap-5">
          <p className="text-center text-sm font-light text-white lg:text-base">
            You do not have the permissions to manage clubs.
          </p>
          <a
            href="https://auth.socis.ca/signin"
            className="rounded-lg border border-primary px-10 py-3 text-center font-thin text-white hover:bg-emerald-900/50"
          >
            Switch accounts
          </a>
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
    setCreationStatus(FormStatus.LOADING);

    /**
     * If the provideed data for the club being created is invalid, then
     * return an error message. This is so that empty clubs are not created.
     */
    if (!isValidClubData(club)) {
      return setCreationStatus(FormStatus.EMPTY_FIELDS); // setCreationStatus: void
    }

    /**
     * Create the club using the API.
     */
    const res = await createClub({ accessToken: session.user.secret, club });

    /**
     * If the club was successfully created, then set the status to success.
     */
    if (res.success) {
      setCreationStatus(FormStatus.SUCCESS);

      /**
       * Redirect the user to the home page.
       */
      router.push("/");
    } else {
      /**
       * If the club was not successfully created, then set the status to error.
       */
      setCreationStatus(FormStatus.ERROR);
    }
  }

  /**
   * Return the main components for the clubs page.
   */
  return (
    <MainWrapper className="p-10 pt-20 lg:p-20 lg:pt-44">
      <form
        className="flex w-full flex-col"
        onSubmit={async (e) => onSubmit(e, club, session)}
      >
        {/** HEADER */}
        <h1 className="mb-7 text-5xl font-thin uppercase text-white md:text-7xl">
          Create Club
        </h1>

        {/**
         * CLUB NAME
         *
         * The user can add a name to the club.
         * This will be displayed on the club page.
         */}
        <label className="mb-2 text-white">Club Name</label>
        <input
          className="rounded-lg border border-primary bg-secondary px-4 py-3 text-base font-thin tracking-wider text-white duration-300 ease-in-out focus:outline-none"
          maxLength={config.club.max.name}
          minLength={config.club.min.name}
          placeholder="Name"
          type="text"
          onChange={(e) => setClub({ ...club, name: e.target.value })}
        />

        {/**
         * CLUB DESCRIPTION
         *
         * The user can add a description to the club.
         * This will be displayed on the club page.
         */}
        <label className="mb-2 mt-5 text-white">Club Description</label>
        <textarea
          className="rounded-lg border border-primary bg-secondary px-4 py-3 text-base font-thin tracking-wider text-white duration-300 ease-in-out focus:outline-none"
          maxLength={config.club.max.description}
          minLength={config.club.min.description}
          placeholder="Description"
          onChange={(e) => setClub({ ...club, description: e.target.value })}
        />

        {/**
         * CLUB Linktree
         *
         * The user can set the linktree of the club. This will be displayed on the club page.
         */}
        <label className="mb-2 text-white">Club Linktree</label>
        <input
          className="rounded-lg border border-primary bg-secondary px-4 py-3 text-base font-thin tracking-wider text-white duration-300 ease-in-out focus:outline-none disabled:opacity-50"
          maxLength={config.club.max.linktree}
          minLength={config.club.min.linktree}
          placeholder="Linktree"
          type="text"
          value={club.linktree}
          onChange={(e) => setClub({ ...club, linktree: e.target.value })}
        />

        {/**
         * TODO: Add club image (banner) upload
         */}

        {/**
         * CREATE CLUB
         *
         * Once the user is finished creating the club, they can submit it.
         * This will send an http request to the API and create the club.
         * If the user hasn't filled in all the fields, then the club will not be created
         * and an error message will be displayed.
         */}
        <Button type="submit">Create Club</Button>

        {/**
         * If the user doesn't want to create the club, then they can cancel.
         *
         * This will just redirect them back to the clubs page.
         */}
        <LinkButton href="/">Cancel</LinkButton>
      </form>

      {/**
       * If the club was successfully created, then display a success message.
       *
       * This will appear before the user is redirected to the home page.
       */}
      {creationStatus === FormStatus.SUCCESS && (
        <SuccessMessage>
          <p>Club created successfully!</p>
        </SuccessMessage>
      )}

      {/**
       * If the club was not successfully created, then display an error message.
       *
       * The user will have the chance to input the data again.
       */}
      {creationStatus === FormStatus.ERROR && (
        <ErrorMessage>
          <p>There was an error creating your club.</p>
        </ErrorMessage>
      )}

      {/**
       * If the user hasn't filled in all the fields, then display an error message.
       *
       * The user will have the chance to input the data again.
       */}
      {creationStatus === FormStatus.EMPTY_FIELDS && (
        <ErrorMessage>
          <p>Make sure all fields are filled in.</p>
        </ErrorMessage>
      )}
    </MainWrapper>
  );
}
