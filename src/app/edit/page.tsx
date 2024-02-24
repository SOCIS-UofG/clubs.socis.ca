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
import {
  Button,
  CustomCursor,
  ErrorMessage,
  LinkButton,
  LoadingSpinnerCenter,
  MainWrapper,
  Navbar,
  SuccessMessage,
} from "socis-components";
import { trpc } from "@/lib/trpc/client";
import { hasPermissions } from "@/lib/utils/permissions";
import { Permission } from "@/types/permission";

/**
 * The status of the form.
 */
enum FormStatus {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR,
  EMPTY_FIELDS,
  NEED_FETCH,
}

/**
 * Wraps the main components in a session provider for next auth.
 *
 * @returns JSX.Element
 */
export default function UpdateClubsPage(): JSX.Element {
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
 * The main components for the update events page. These are to be wrapped in a
 * session provider for next auth.
 *
 * @returns JSX.Element
 */
function Components(): JSX.Element {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [club, setClub] = useState<Club | undefined>(undefined);
  const [editStatus, setEditStatus] = useState(FormStatus.IDLE);
  const [fetchStatus, setFetchStatus] = useState(FormStatus.NEED_FETCH);
  const { mutateAsync: getClub } = trpc.getClub.useMutation();
  const { mutateAsync: updateClub } = trpc.updateClub.useMutation();

  /**
   * Get the club id from the url.
   */
  const path = usePathname();
  const eventId = path.split("/")[2];

  /**
   * Once the page loads, we want to fetch the club data so that we can
   * modify the existing club contents.
   */
  useEffect(() => {
    /**
     * If the club id is invalid or we are already fetching the club data,
     * then don't fetch the club data again.
     */
    if (!eventId || fetchStatus !== FormStatus.NEED_FETCH) {
      return;
    }

    /**
     * Set the fetch status to loading so that we don't fetch the club again and
     * can display a loading screen to the user.
     */
    setFetchStatus(FormStatus.LOADING);

    /**
     * Fetch the club data from the database.
     */
    getClub({ id: eventId })
      .then((data) => {
        if (!data.club) {
          setFetchStatus(FormStatus.ERROR);
          return;
        }

        setClub(data.club);
        setFetchStatus(FormStatus.SUCCESS);
      })
      .catch(() => {
        setFetchStatus(FormStatus.ERROR);
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
    setEditStatus(FormStatus.LOADING);

    /**
     * If the provideed data for the club being created is invalid, then
     * return an error message. This is so that empty events are not created.
     */
    if (!isValidClubData(club)) {
      setEditStatus(FormStatus.EMPTY_FIELDS);

      return;
    }

    /**
     * Update the club in the database.
     */
    const res = await updateClub({ accessToken: session.user.secret, club });

    /**
     * If the club was successfully updated, then set the status to success.
     */
    if (res.success) {
      setEditStatus(FormStatus.SUCCESS);

      router.push("/");
    }
  }

  /**
   * If the provided club id (from the url parameters) is invalid, then show an error message.
   */
  if (!eventId) {
    return (
      <MainWrapper>
        <h1 className="text-center text-3xl font-bold text-white lg:text-5xl">
          Invalid Club
        </h1>

        <div className="flex flex-col gap-5">
          <p className="text-center text-sm font-light text-white lg:text-base">
            The club that you provided is invalid.
          </p>
          <Link
            href="/"
            className="rounded-lg border border-primary px-10 py-3 text-center font-thin text-white hover:bg-emerald-900/50"
          >
            Go back
          </Link>
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
    fetchStatus === FormStatus.LOADING ||
    editStatus === FormStatus.LOADING
  ) {
    return <LoadingSpinnerCenter />;
  }

  /**
   * If the user is not signed in, then show an error message.
   */
  if (sessionStatus !== "authenticated") {
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
   * If there was an error with fetching the club, show an error message.
   */
  if (fetchStatus === FormStatus.ERROR) {
    return (
      <MainWrapper>
        <ErrorMessage>
          There was an error fetching the club. Please try again later.
        </ErrorMessage>
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

  return (
    <MainWrapper className="p-10 pt-20 lg:p-20 lg:pt-44">
      <form
        className="flex w-full flex-col"
        onSubmit={async (e) => onSubmit(e, club, session)}
      >
        <h1 className="mb-7 text-5xl font-thin uppercase text-white md:text-7xl">
          Update Club
        </h1>

        {/**
         * CLUB NAME
         *
         * The user can set the name of the club. This will be displayed on the club page.
         */}
        <label className="mb-2 text-white">Club Name</label>
        <input
          className="rounded-lg border border-primary bg-secondary px-4 py-3 text-base font-thin tracking-wider text-white duration-300 ease-in-out focus:outline-none disabled:opacity-50"
          maxLength={config.club.max.name}
          minLength={config.club.min.name}
          placeholder="Name"
          type="text"
          value={club.name}
          onChange={(e) => setClub({ ...club, name: e.target.value })}
        />

        {/**
         * CLUB DESCRIPTION
         *
         * The user can set the description of the club. This will be displayed on the club page.
         */}
        <label className="mb-2 mt-5 text-white">Club Description</label>
        <textarea
          className="rounded-lg border border-primary bg-secondary px-4 py-3 text-base font-thin tracking-wider text-white duration-300 ease-in-out focus:outline-none disabled:opacity-50"
          maxLength={config.club.max.description}
          minLength={config.club.min.description}
          placeholder="Description"
          value={club.description}
          onChange={(e) => setClub({ ...club, description: e.target.value })}
        />

        <Button type="submit">Update Club</Button>
        <LinkButton href="/">Cancel</LinkButton>
      </form>

      {editStatus === FormStatus.SUCCESS && (
        <SuccessMessage>
          <p>Club updated successfully!</p>
        </SuccessMessage>
      )}

      {editStatus === FormStatus.ERROR && (
        <ErrorMessage>
          <p>There was an error creating your club.</p>
        </ErrorMessage>
      )}

      {editStatus === FormStatus.EMPTY_FIELDS && (
        <ErrorMessage>
          <p>Make sure all fields are filled in.</p>
        </ErrorMessage>
      )}
    </MainWrapper>
  );
}
