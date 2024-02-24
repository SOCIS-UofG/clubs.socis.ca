import { clubsRouter } from "./routers/clubs";
import { router } from "./trpc";

export const appRouter = router({
  ...clubsRouter,
});

export type AppRouter = typeof appRouter;
