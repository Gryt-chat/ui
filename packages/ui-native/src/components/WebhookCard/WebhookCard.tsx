import { ImageBrokenIcon } from "phosphor-react-native/src/icons/ImageBroken";
import { useState, type ReactNode } from "react";
import { Image, Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import { Text } from "../../internal/Text";

import { useTheme } from "../../theme";
import { defaultTimestamp, dotColor, footerText, openableUrl } from "./webhookCardParts";

export interface WebhookCardAuthor {
  name: string;
  url?: string;
  iconUrl?: string;
}

export interface WebhookCardField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface WebhookCardData {
  title?: string;
  url?: string;
  /** Chat markdown, drawn by `renderMarkdown` when given. */
  description?: string;
  /** `#rrggbb`. Only ever the dot beside the author. */
  color?: string;
  author?: WebhookCardAuthor;
  fields?: WebhookCardField[];
  imageUrl?: string;
  thumbnailUrl?: string;
  footer?: { text: string; iconUrl?: string };
  /** ISO 8601. */
  timestamp?: string;
}

export interface WebhookCardProps {
  card: WebhookCardData;
  /** The host's chat markdown, plain text when absent. `where` says which size to draw at. */
  renderMarkdown?: (text: string, where: WebhookCardMarkdownSlot) => ReactNode;
  formatTimestamp?: (iso: string) => string;
  /** Without it, titles and author names draw as plain text. */
  onOpenUrl?: (url: string) => void;
  onPressImage?: (url: string) => void;
  style?: StyleProp<ViewStyle>;
}

/** A description is 14pt body text; a field value sits in a 12pt chip. */
export type WebhookCardMarkdownSlot = "description" | "field";

const IMAGE_MAX_HEIGHT = 176;
const THUMBNAIL_SIZE = 40;

type ImageStatus = "loading" | "loaded" | "error";

interface CardImageProps {
  uri: string;
  small?: boolean;
  onPress?: (url: string) => void;
  style: StyleProp<ViewStyle>;
}

function CardImage({ uri, small = false, onPress, style }: CardImageProps) {
  const theme = useTheme();
  const [status, setStatus] = useState<ImageStatus>("loading");
  const [prevUri, setPrevUri] = useState(uri);
  if (uri !== prevUri) {
    setPrevUri(uri);
    setStatus("loading");
  }

  const body = (
    <View
      testID="webhook-card-image"
      accessibilityState={{ busy: status === "loading" }}
      style={[{ overflow: "hidden", backgroundColor: theme.color.surfaceRaised }, style]}
    >
      {status === "loading" ? (
        <View
          accessibilityRole="progressbar"
          accessibilityLabel="Loading image"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: theme.scales.neutral[3],
          }}
        />
      ) : null}
      {status === "error" ? (
        <View
          accessibilityRole="image"
          accessibilityLabel="Image unavailable"
          style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: theme.space(1) }}
        >
          <ImageBrokenIcon size={small ? 16 : 20} color={theme.color.muted} />
          {small ? null : (
            <Text style={{ color: theme.color.muted, fontSize: 12 }}>Image unavailable</Text>
          )}
        </View>
      ) : (
        <Image
          source={{ uri }}
          resizeMode="cover"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          accessibilityIgnoresInvertColors
          style={{ width: "100%", height: "100%", opacity: status === "loaded" ? 1 : 0 }}
        />
      )}
    </View>
  );

  if (!onPress || status === "error") return body;
  return (
    <Pressable
      accessibilityRole="imagebutton"
      accessibilityLabel="Open image"
      onPress={() => onPress(uri)}
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
    >
      {body}
    </Pressable>
  );
}

function FooterIcon({ uri }: { uri: string }) {
  const theme = useTheme();
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <Image
      source={{ uri }}
      onError={() => setFailed(true)}
      accessibilityIgnoresInvertColors
      style={{
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: theme.color.surfaceRaised,
      }}
    />
  );
}

/** Compact: the app background inside a hairline border, the payload colour only in the author
    dot. A tap anywhere opens the card's URL; the title stays a link for screen readers. */
export function WebhookCard({
  card,
  renderMarkdown,
  formatTimestamp = defaultTimestamp,
  onOpenUrl,
  onPressImage,
  style,
}: WebhookCardProps) {
  const theme = useTheme();
  const cardUrl = onOpenUrl && card.title ? openableUrl(card.url) : undefined;
  const authorUrl = onOpenUrl ? openableUrl(card.author?.url) : undefined;
  const time = card.timestamp ? formatTimestamp(card.timestamp) : "";
  const footer = footerText(card.footer?.text, time);
  const fields = card.fields?.length ? card.fields : null;
  const hasHeader = Boolean(card.author || card.title || card.thumbnailUrl);

  const markdown = (text: string, where: WebhookCardMarkdownSlot) => {
    const fontSize = where === "field" ? 12 : 14;
    return renderMarkdown ? (
      renderMarkdown(text, where)
    ) : (
      <Text style={{ color: theme.color.text, fontSize, lineHeight: Math.round(fontSize * 1.45) }}>
        {text}
      </Text>
    );
  };

  return (
    <Pressable
      testID="webhook-card"
      accessible={false}
      onPress={cardUrl ? () => onOpenUrl?.(cardUrl) : undefined}
      style={({ pressed }) => [
        {
          width: "100%",
          maxWidth: 512,
          borderWidth: 1,
          borderColor: pressed && cardUrl ? theme.scales.neutral[8] : theme.color.border,
          borderRadius: theme.radius.sm,
          backgroundColor: theme.color.bg,
          paddingHorizontal: theme.space(3),
          paddingVertical: theme.space(2.5),
          gap: theme.space(2),
          opacity: pressed && cardUrl ? 0.9 : 1,
        },
        style,
      ]}
    >
      {hasHeader ? (
        <View style={{ gap: theme.space(1) }}>
          <View style={{ flexDirection: "row", gap: theme.space(3) }}>
            {card.thumbnailUrl ? (
              <CardImage
                small
                uri={card.thumbnailUrl}
                onPress={onPressImage}
                style={{
                  width: THUMBNAIL_SIZE,
                  height: THUMBNAIL_SIZE,
                  borderRadius: theme.radius.sm,
                }}
              />
            ) : null}
            <View style={{ flex: 1, minWidth: 0, justifyContent: "center", gap: theme.space(0.5) }}>
              {card.author ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space(2) }}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: dotColor(card.color, theme.color.border),
                    }}
                  />
                  <Text
                    numberOfLines={1}
                    accessibilityRole={authorUrl ? "link" : undefined}
                    onPress={authorUrl ? () => onOpenUrl?.(authorUrl) : undefined}
                    style={{ flexShrink: 1, color: theme.color.muted, fontSize: 12 }}
                  >
                    {card.author.name}
                  </Text>
                </View>
              ) : null}
              {card.title ? (
                <Text
                  accessibilityRole={cardUrl ? "link" : "header"}
                  onPress={cardUrl ? () => onOpenUrl?.(cardUrl) : undefined}
                  style={{
                    color: cardUrl ? theme.scales.accent[10] : theme.color.text,
                    fontSize: 14,
                    lineHeight: 20,
                    fontWeight: "600",
                  }}
                >
                  {card.title}
                </Text>
              ) : null}
            </View>
          </View>
          {card.description ? markdown(card.description, "description") : null}
        </View>
      ) : card.description ? (
        markdown(card.description, "description")
      ) : null}

      {fields ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.space(1.5) }}>
          {fields.map((field, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "baseline",
                gap: theme.space(1.5),
                maxWidth: "100%",
                ...(field.inline ? null : { width: "100%" }),
                backgroundColor: theme.color.surfaceRaised,
                borderRadius: theme.radius.sm,
                paddingHorizontal: theme.space(2),
                paddingVertical: theme.space(1),
              }}
            >
              <Text style={{ color: theme.color.muted, fontSize: 12, lineHeight: 17 }}>
                {field.name}
              </Text>
              <View style={{ flexShrink: 1, minWidth: 0 }}>{markdown(field.value, "field")}</View>
            </View>
          ))}
        </View>
      ) : null}

      {card.imageUrl ? (
        /* Clipped by a frame: Yoga narrows an aspect-ratio box to fit its maxHeight. */
        <View
          style={{
            maxHeight: IMAGE_MAX_HEIGHT,
            overflow: "hidden",
            justifyContent: "center",
            borderRadius: theme.radius.sm,
          }}
        >
          <CardImage
            uri={card.imageUrl}
            onPress={onPressImage}
            style={{ width: "100%", aspectRatio: 1.91 }}
          />
        </View>
      ) : null}

      {footer ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space(2) }}>
          {card.footer?.iconUrl ? <FooterIcon uri={card.footer.iconUrl} /> : null}
          <Text numberOfLines={1} style={{ flexShrink: 1, color: theme.color.muted, fontSize: 12 }}>
            {footer}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
