"use client";

import {
  At,
  CaretDown,
  ChatTeardropText,
  Check,
  Clock,
  Copy,
  DotsThree,
  Flag,
  GameController,
  MicrophoneSlash,
  PencilSimple,
  PhoneDisconnect,
  Prohibit,
  ShieldCheck,
  SignOut,
  SpeakerSlash,
  UserPlus,
  X
} from "@phosphor-icons/react";

// Fill for shapes and bold for thin marks, the same icons as the client's voice controls.
export const CardIcon = {
  chat: () => <ChatTeardropText weight="fill" aria-hidden="true" />,
  friend: () => <UserPlus weight="fill" aria-hidden="true" />,
  clock: () => <Clock weight="fill" aria-hidden="true" />,
  check: () => <Check weight="bold" aria-hidden="true" />,
  close: () => <X weight="bold" aria-hidden="true" />,
  at: () => <At weight="bold" aria-hidden="true" />,
  copy: () => <Copy weight="fill" aria-hidden="true" />,
  flag: () => <Flag weight="fill" aria-hidden="true" />,
  more: () => <DotsThree weight="bold" aria-hidden="true" />,
  pen: () => <PencilSimple weight="fill" aria-hidden="true" />,
  mic: () => <MicrophoneSlash weight="fill" aria-hidden="true" />,
  deaf: () => <SpeakerSlash weight="fill" aria-hidden="true" />,
  disc: () => <PhoneDisconnect weight="fill" aria-hidden="true" />,
  kick: () => <SignOut weight="fill" aria-hidden="true" />,
  ban: () => <Prohibit weight="fill" aria-hidden="true" />,
  roles: () => <ShieldCheck weight="fill" aria-hidden="true" />,
  pad: () => <GameController weight="fill" aria-hidden="true" />,
  caret: () => <CaretDown size={10} weight="bold" aria-hidden="true" />,
};
