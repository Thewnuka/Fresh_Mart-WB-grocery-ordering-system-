import { defineConfig } from "vite";

// Vite serves the plain HTML/CSS/JavaScript pages during development (npm run dev)
// and copies them into the "dist" folder for a final build (npm run build).
export default defineConfig({
  // The frontend always runs on port 5173 (the only address the backend accepts)
  server: {
    port: 5173,
    strictPort: true,
  },
  // Every HTML page of the application
  build: {
    rollupOptions: {
      input: {
        index: "index.html",
        login: "login.html",
        register: "register.html",
        dashboard: "dashboard.html",
        categories: "categories.html",
        items: "items.html",
        profile: "profile.html",
      },
    },
  },
});
