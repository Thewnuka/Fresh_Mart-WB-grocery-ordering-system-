import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The frontend always runs on port 5173 (the only address the backend accepts)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  // Pages included in "npm run build":
  // index.html is the old React app; login.html and register.html are the new plain HTML pages
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        login: "login.html",
        register: "register.html",
      },
    },
  },
});
