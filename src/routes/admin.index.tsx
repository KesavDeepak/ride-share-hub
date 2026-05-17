import { createFileRoute } from "@tanstack/react-router";
import { AdminLogin } from "./admin";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin sign in — Ride Share" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLogin,
});
