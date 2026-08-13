// Self-hosted rather than a CDN link: the docs build and render offline, and
// both faces this site names were previously declared but never loaded.
import "@fontsource-variable/inter";
import "@fontsource-variable/geist";
import "@fontsource-variable/jetbrains-mono";
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
import { ExampleFullPage, ExamplePage, exampleDocs } from "./pages/examples";
import { HomePage } from "./pages/HomePage";
import { InstallationPage } from "./pages/InstallationPage";
import { ThemeGeneratorPage } from "./pages/ThemeGeneratorPage";
import { ThemePage } from "./pages/ThemePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "installation", element: <InstallationPage /> },
      { path: "theme", element: <ThemePage /> },
      { path: "theme/generator", element: <ThemeGeneratorPage /> },
      {
        path: "components",
        element: <Navigate replace to="/components/button" />
      },
      { path: "components/:component", element: <ComponentDocPage /> },
      {
        path: "examples",
        element: <Navigate replace to={`/examples/${exampleDocs[0].slug}`} />
      },
      { path: "examples/:example", element: <ExamplePage /> }
    ]
  },
  // Outside the shell on purpose: these are whole screens, and a sidebar next
  // to a sign-in page is not the thing being shown.
  { path: "/examples/:example/full", element: <ExampleFullPage /> }
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
