import { clubsRouter } from "./routers/clubs";
import { initiativesRouter } from "./routers/initiatives";
import { router } from "./trpc";

export const appRouter = router({
  ...clubsRouter,
  ...initiativesRouter
});

export type AppRouter = typeof appRouter;
