import "@gryt/ui/styles.css";
import "./styles.css";
import { MDXProvider } from "@mdx-js/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { GrytProvider } from "@gryt/ui";
import { AppShell } from "./AppShell";
import { mdxComponents } from "./components/MdxComponents";
import ButtonPage from "./pages/button.mdx";
import ChatPage from "./pages/chat.mdx";
import InputsPage from "./pages/inputs.mdx";
import MessageBubblePage from "./pages/message-bubble.mdx";
import { ComponentsPage } from "./pages/ComponentsPage";
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
      { path: "components", element: <ComponentsPage /> },
      { path: "components/button", element: <ButtonPage /> },
      { path: "components/inputs", element: <InputsPage /> },
      { path: "components/chat", element: <ChatPage /> },
      { path: "components/message-bubble", element: <MessageBubblePage /> }
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
