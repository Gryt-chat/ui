import {
  Button,
  Composer,
  ConversationItem,
  MessageBubble,
  Surface
} from "@gryt/ui";
import { ArrowRight } from "@phosphor-icons/react";
import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-gryt-accent">
            React components for Gryt Chat
          </p>
          <h2 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight">
            Material 3 shape, Gryt code-theme colors.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-gryt-muted">
            Build desktop chat interfaces with reusable components, rounded
            controls, purple accent tokens, and live MDX docs.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/components/button">
              <Button endIcon={<ArrowRight size={18} />}>
                Browse components
              </Button>
            </Link>
            <Link to="/installation">
              <Button tone="neutral">Install</Button>
            </Link>
          </div>
        </div>
        <Surface className="space-y-4 p-4" elevated>
          <div className="space-y-1">
            <ConversationItem
              title="Design sync"
              subtitle="Material 3 components"
              active
            />
            <ConversationItem
              title="Release notes"
              subtitle="npm package ready"
            />
          </div>
          <div className="space-y-3">
            <MessageBubble from="assistant">
              Code-theme palette applied.
            </MessageBubble>
            <MessageBubble from="user">
              Make controls more Material 3.
            </MessageBubble>
          </div>
          <Composer submitLabel="Send" aria-label="Message preview" />
        </Surface>
      </section>
    </div>
  );
}
