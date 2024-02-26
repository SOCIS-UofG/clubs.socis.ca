import type { Config } from "tailwindcss";
// import { nextui } from "@nextui-org/react";

const config: Config = {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      colors: {
        primary: "#10b981",
        secondary: "#1f1f1f",
      },
    },
  },
  plugins: [],
};

export default config;
