import { grytMarkSvg } from "@gryt/owl";
import { useId, useMemo } from "react";
import { SvgXml } from "react-native-svg";

export interface GrytLogoProps {
  size?: number;
  color?: string;
}

/** Gryt's flat mark, face and wings, the same one @gryt/ui draws on the web. */
export function GrytLogo({ size = 16, color = "#A495E3" }: GrytLogoProps) {
  const id = `gryt-mark-${useId().replace(/:/g, "")}`;
  const xml = useMemo(() => grytMarkSvg({ size, color, id }), [size, color, id]);
  return <SvgXml xml={xml} width={size} height={size} />;
}
