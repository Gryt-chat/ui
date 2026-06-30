import "@gryt/ui/styles.css";
import "./styles.css";
import { MDXProvider } from "@mdx-js/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  Navigate,
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";
import { GrytProvider } from "@gryt/ui";
import { AppShell } from "./AppShell";
import { mdxComponents } from "./components/MdxComponents";
import { ComponentDocPage } from "./pages/componentDocs";
import { HomePage } from "./pages/HomePage";
import { InstallationPage } from "./pages/InstallationPage";
import { ThemePage } from "./pages/ThemePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "installation", element: <InstallationPage /> },
      { path: "theme", element: <ThemePage /> },
      {
        path: "components",
        element: <Navigate replace to="/components/button" />
      },
      { path: "components/:component", element: <ComponentDocPage /> }
    ]
  }
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GrytProvider>
      <MDXProvider components={mdxComponents}>
        <RouterProvider router={router} />
      </MDXProvider>
    </GrytProvider>
  </StrictMode>
);
