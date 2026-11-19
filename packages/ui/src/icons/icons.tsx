"use client";

/*
 * The icons Gryt draws, over @phosphor-icons/react, each fixed at the weight the apps use.
 * Import from "@gryt/ui/icons" so the client, the docs and anything else draw the same ones.
 */

import type { Icon, IconProps } from "@phosphor-icons/react";
import {
  AirplaneTilt,
  Archive,
  ArrowBendUpLeft,
  ArrowBendUpRight,
  ArrowCircleUp,
  ArrowClockwise,
  ArrowCounterClockwise,
  ArrowDown,
  ArrowLineLeft,
  ArrowLineRight,
  ArrowRight,
  ArrowsClockwise,
  ArrowsInSimple,
  ArrowsLeftRight,
  ArrowsOut,
  ArrowsOutSimple,
  ArrowSquareOut,
  ArrowSquareRight,
  ArrowUp,
  At,
  Bank,
  Barricade,
  Bell,
  BellRinging,
  BellSimple,
  Boot,
  Briefcase,
  Broadcast,
  Browser,
  Bug,
  Building,
  Buildings,
  CalendarBlank,
  CalendarCheck,
  Camera,
  CameraSlash,
  Cardholder,
  CaretDown,
  CaretLeft,
  CaretRight,
  CaretUp,
  Certificate,
  ChartBar,
  ChartPieSlice,
  ChatCircle,
  ChatsTeardrop,
  ChatTeardropDots,
  ChatTeardropText,
  Check,
  CheckCircle,
  Checks,
  Circle,
  Clock,
  ClockClockwise,
  ClockCountdown,
  ClockCounterClockwise,
  Cloud,
  CloudArrowDown,
  CloudArrowUp,
  CloudCheck,
  Code,
  CodeBlock,
  Coins,
  Compass,
  Copy,
  CopySimple,
  CornersIn,
  CornersOut,
  CreditCard,
  Crosshair,
  Crown,
  Cube,
  Database,
  Desktop,
  DeviceMobile,
  Devices,
  DoorOpen,
  DotsSixVertical,
  DotsThree,
  DotsThreeCircle,
  DotsThreeVertical,
  DownloadSimple,
  Envelope,
  Export,
  Eye,
  EyeSlash,
  Factory,
  FadersHorizontal,
  File,
  FileArchive,
  FileAudio,
  FilePlus,
  FileText,
  FileVideo,
  FileZip,
  Fingerprint,
  Fire,
  Flag,
  Flask,
  Folder,
  Folders,
  GameController,
  Gauge,
  Gear,
  GearSix,
  Gift,
  Globe,
  GlobeHemisphereWest,
  GlobeSimple,
  GlobeStand,
  HandHeart,
  HandWaving,
  HardDrive,
  HardDrives,
  Hash,
  Headset,
  Heart,
  Hourglass,
  HourglassMedium,
  House,
  HouseLine,
  IdentificationBadge,
  IdentificationCard,
  Image,
  Info,
  Invoice,
  Key,
  Keyboard,
  Lifebuoy,
  Lightning,
  Link,
  LinkBreak,
  LinkSimple,
  List,
  ListBullets,
  ListChecks,
  ListNumbers,
  Lock,
  LockOpen,
  LockSimple,
  MagnifyingGlass,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  MapPin,
  MapTrifold,
  Medal,
  Microphone,
  MicrophoneSlash,
  Minus,
  MinusCircle,
  Money,
  Monitor,
  MonitorArrowUp,
  Moon,
  Mountains,
  NavigationArrow,
  Notebook,
  Package,
  Palette,
  Pause,
  PauseCircle,
  PencilSimple,
  Phone,
  PhoneCall,
  PhoneDisconnect,
  PhoneX,
  Planet,
  Play,
  Plug,
  Plugs,
  Plus,
  Prohibit,
  Pulse,
  PushPin,
  PushPinSlash,
  PuzzlePiece,
  Question,
  Quotes,
  Receipt,
  Robot,
  RocketLaunch,
  ScanSmiley,
  Screencast,
  Scroll,
  SealWarning,
  Shield,
  ShieldCheck,
  ShieldSlash,
  ShieldStar,
  ShieldWarning,
  Shuffle,
  SidebarSimple,
  SignIn,
  SignOut,
  Signpost,
  Siren,
  SlidersHorizontal,
  SmileySad,
  SmileyWink,
  Snowflake,
  Sparkle,
  SpeakerHigh,
  SpeakerSimpleHigh,
  SpeakerSimpleSlash,
  SpeakerSlash,
  SquaresFour,
  Stack,
  Stop,
  Storefront,
  Tag,
  TextB,
  TextHOne,
  TextHThree,
  TextHTwo,
  TextItalic,
  TextStrikethrough,
  Timer,
  Trash,
  TrashSimple,
  Tray,
  Truck,
  Umbrella,
  UploadSimple,
  User,
  UserPlus,
  Users,
  UsersThree,
  Vault,
  Wallet,
  Warning,
  WarningCircle,
  WebhooksLogo,
  WifiSlash,
  Wrench,
  X,
  XCircle,
} from "@phosphor-icons/react";
import { GRYT_MARK } from "@gryt/owl";
import { useId } from "react";

/**
 * A phosphor icon fixed at one weight. Fixed rather than defaulted, because these
 * are passed around as values and a default only applies where props are spread.
 */
function weighted(Base: Icon, weight: IconProps["weight"], name: string): Icon {
  const Fixed = (props: IconProps) => <Base weight={weight} {...props} />;
  Fixed.displayName = name;
  return Fixed as Icon;
}

export const PiArchiveFill: Icon = weighted(Archive, "fill", "PiArchiveFill");
export const PiLockFill: Icon = weighted(Lock, "fill", "PiLockFill");
export const PiArrowBendUpLeftFill: Icon = weighted(ArrowBendUpLeft, "fill", "PiArrowBendUpLeftFill");
export const PiArrowBendUpLeftBold: Icon = weighted(ArrowBendUpLeft, "bold", "PiArrowBendUpLeftBold");
export const PiArrowDownBold: Icon = weighted(ArrowDown, "bold", "PiArrowDownBold");
export const PiArrowUpBold: Icon = weighted(ArrowUp, "bold", "PiArrowUpBold");
export const PiArrowLineLeftFill: Icon = weighted(ArrowLineLeft, "fill", "PiArrowLineLeftFill");
export const PiArrowLineRightFill: Icon = weighted(ArrowLineRight, "fill", "PiArrowLineRightFill");
export const PiArrowRightBold: Icon = weighted(ArrowRight, "bold", "PiArrowRightBold");
export const PiArrowsClockwiseBold: Icon = weighted(ArrowsClockwise, "bold", "PiArrowsClockwiseBold");
export const PiArrowsClockwiseFill: Icon = weighted(ArrowsClockwise, "fill", "PiArrowsClockwiseFill");
export const PiArrowsLeftRightFill: Icon = weighted(ArrowsLeftRight, "fill", "PiArrowsLeftRightFill");
export const PiArrowsInSimpleBold: Icon = weighted(ArrowsInSimple, "bold", "PiArrowsInSimpleBold");
export const PiArrowsOutBold: Icon = weighted(ArrowsOut, "bold", "PiArrowsOutBold");
export const PiArrowsOutSimpleBold: Icon = weighted(ArrowsOutSimple, "bold", "PiArrowsOutSimpleBold");
export const PiArrowSquareOutBold: Icon = weighted(ArrowSquareOut, "bold", "PiArrowSquareOutBold");
export const PiArrowSquareOutFill: Icon = weighted(ArrowSquareOut, "fill", "PiArrowSquareOutFill");
export const PiAtBold: Icon = weighted(At, "bold", "PiAtBold");
export const PiBellFill: Icon = weighted(Bell, "fill", "PiBellFill");
export const PiBootFill: Icon = weighted(Boot, "fill", "PiBootFill");
export const PiBroadcastFill: Icon = weighted(Broadcast, "fill", "PiBroadcastFill");
export const PiBugFill: Icon = weighted(Bug, "fill", "PiBugFill");
export const PiCameraFill: Icon = weighted(Camera, "fill", "PiCameraFill");
export const PiCaretDownFill: Icon = weighted(CaretDown, "fill", "PiCaretDownFill");
export const PiCaretLeftBold: Icon = weighted(CaretLeft, "bold", "PiCaretLeftBold");
export const PiCaretRightBold: Icon = weighted(CaretRight, "bold", "PiCaretRightBold");
export const PiCaretRightFill: Icon = weighted(CaretRight, "fill", "PiCaretRightFill");
export const PiCaretUpFill: Icon = weighted(CaretUp, "fill", "PiCaretUpFill");
export const PiChatCircleBold: Icon = weighted(ChatCircle, "bold", "PiChatCircleBold");
export const PiChatTeardropDotsFill: Icon = weighted(ChatTeardropDots, "fill", "PiChatTeardropDotsFill");
export const PiChatTeardropTextFill: Icon = weighted(ChatTeardropText, "fill", "PiChatTeardropTextFill");
export const PiChatsTeardropFill: Icon = weighted(ChatsTeardrop, "fill", "PiChatsTeardropFill");
export const PiChartBarFill: Icon = weighted(ChartBar, "fill", "PiChartBarFill");
export const PiCheck: Icon = Check;
export const PiChecksBold: Icon = weighted(Checks, "bold", "PiChecksBold");
export const PiCheckBold: Icon = weighted(Check, "bold", "PiCheckBold");
export const PiCheckCircleFill: Icon = weighted(CheckCircle, "fill", "PiCheckCircleFill");
export const PiClockClockwiseFill: Icon = weighted(ClockClockwise, "fill", "PiClockClockwiseFill");
export const PiClockFill: Icon = weighted(Clock, "fill", "PiClockFill");
export const PiCircleFill: Icon = weighted(Circle, "fill", "PiCircleFill");
export const PiCloudFill: Icon = weighted(Cloud, "fill", "PiCloudFill");
export const PiCloudArrowDownFill: Icon = weighted(CloudArrowDown, "fill", "PiCloudArrowDownFill");
export const PiCloudArrowUpFill: Icon = weighted(CloudArrowUp, "fill", "PiCloudArrowUpFill");
export const PiCode: Icon = Code;
export const PiCopyBold: Icon = weighted(Copy, "bold", "PiCopyBold");
export const PiCopyFill: Icon = weighted(Copy, "fill", "PiCopyFill");
export const PiCopySimple: Icon = CopySimple;
export const PiCopySimpleBold: Icon = weighted(CopySimple, "bold", "PiCopySimpleBold");
export const PiCornersInFill: Icon = weighted(CornersIn, "fill", "PiCornersInFill");
export const PiCornersOutFill: Icon = weighted(CornersOut, "fill", "PiCornersOutFill");
export const PiCrosshairFill: Icon = weighted(Crosshair, "fill", "PiCrosshairFill");
export const PiDesktopFill: Icon = weighted(Desktop, "fill", "PiDesktopFill");
export const PiDeviceMobileFill: Icon = weighted(DeviceMobile, "fill", "PiDeviceMobileFill");
export const PiDevicesFill: Icon = weighted(Devices, "fill", "PiDevicesFill");
export const PiDotsSixVerticalFill: Icon = weighted(DotsSixVertical, "fill", "PiDotsSixVerticalFill");
export const PiDotsThreeBold: Icon = weighted(DotsThree, "bold", "PiDotsThreeBold");
export const PiDotsThreeCircleFill: Icon = weighted(DotsThreeCircle, "fill", "PiDotsThreeCircleFill");
export const PiDotsThreeVerticalBold: Icon = weighted(DotsThreeVertical, "bold", "PiDotsThreeVerticalBold");
export const PiDownloadSimpleFill: Icon = weighted(DownloadSimple, "fill", "PiDownloadSimpleFill");
export const PiEnvelopeFill: Icon = weighted(Envelope, "fill", "PiEnvelopeFill");
export const PiHashBold: Icon = weighted(Hash, "bold", "PiHashBold");
export const PiEyeFill: Icon = weighted(Eye, "fill", "PiEyeFill");
export const PiEyeSlashBold: Icon = weighted(EyeSlash, "bold", "PiEyeSlashBold");
export const PiEyeSlashFill: Icon = weighted(EyeSlash, "fill", "PiEyeSlashFill");
export const PiFadersHorizontalFill: Icon = weighted(FadersHorizontal, "fill", "PiFadersHorizontalFill");
export const PiFileAudioFill: Icon = weighted(FileAudio, "fill", "PiFileAudioFill");
export const PiFileFill: Icon = weighted(File, "fill", "PiFileFill");
export const PiFileTextFill: Icon = weighted(FileText, "fill", "PiFileTextFill");
export const PiFileVideoFill: Icon = weighted(FileVideo, "fill", "PiFileVideoFill");
export const PiFileZipFill: Icon = weighted(FileZip, "fill", "PiFileZipFill");
export const PiFlagFill: Icon = weighted(Flag, "fill", "PiFlagFill");
export const PiFlaskFill: Icon = weighted(Flask, "fill", "PiFlaskFill");
export const PiFolderFill: Icon = weighted(Folder, "fill", "PiFolderFill");
export const PiGameControllerFill: Icon = weighted(GameController, "fill", "PiGameControllerFill");
export const PiGaugeFill: Icon = weighted(Gauge, "fill", "PiGaugeFill");
export const PiGearFill: Icon = weighted(Gear, "fill", "PiGearFill");
export const PiGearSixFill: Icon = weighted(GearSix, "fill", "PiGearSixFill");
export const PiGlobeSimpleFill: Icon = weighted(GlobeSimple, "fill", "PiGlobeSimpleFill");
export const PiHandWavingFill: Icon = weighted(HandWaving, "fill", "PiHandWavingFill");
export const PiHardDrivesFill: Icon = weighted(HardDrives, "fill", "PiHardDrivesFill");
export const PiHeartFill: Icon = weighted(Heart, "fill", "PiHeartFill");
export const PiHouseFill: Icon = weighted(House, "fill", "PiHouseFill");
export const PiImageFill: Icon = weighted(Image, "fill", "PiImageFill");
export const PiInfoBold: Icon = weighted(Info, "bold", "PiInfoBold");
export const PiInfoFill: Icon = weighted(Info, "fill", "PiInfoFill");
export const PiKey: Icon = Key;
export const PiKeyboardFill: Icon = weighted(Keyboard, "fill", "PiKeyboardFill");
export const PiLightningFill: Icon = weighted(Lightning, "fill", "PiLightningFill");
export const PiLinkFill: Icon = weighted(Link, "fill", "PiLinkFill");
export const PiLinkSimpleBold: Icon = weighted(LinkSimple, "bold", "PiLinkSimpleBold");
export const PiList: Icon = List;
export const PiListChecksFill: Icon = weighted(ListChecks, "fill", "PiListChecksFill");
export const PiLockOpen: Icon = LockOpen;
export const PiLockSimpleFill: Icon = weighted(LockSimple, "fill", "PiLockSimpleFill");
export const PiMagnifyingGlassBold: Icon = weighted(MagnifyingGlass, "bold", "PiMagnifyingGlassBold");
export const PiMagnifyingGlassMinusBold: Icon = weighted(MagnifyingGlassMinus, "bold", "PiMagnifyingGlassMinusBold");
export const PiMagnifyingGlassPlusBold: Icon = weighted(MagnifyingGlassPlus, "bold", "PiMagnifyingGlassPlusBold");
export const PiMagnifyingGlassFill: Icon = weighted(MagnifyingGlass, "fill", "PiMagnifyingGlassFill");
export const PiMicrophoneFill: Icon = weighted(Microphone, "fill", "PiMicrophoneFill");
export const PiMicrophoneSlashFill: Icon = weighted(MicrophoneSlash, "fill", "PiMicrophoneSlashFill");
export const PiMinusBold: Icon = weighted(Minus, "bold", "PiMinusBold");
export const PiMinusCircleFill: Icon = weighted(MinusCircle, "fill", "PiMinusCircleFill");
export const PiMonitorArrowUpFill: Icon = weighted(MonitorArrowUp, "fill", "PiMonitorArrowUpFill");
export const PiMonitorFill: Icon = weighted(Monitor, "fill", "PiMonitorFill");
export const PiPaletteFill: Icon = weighted(Palette, "fill", "PiPaletteFill");
export const PiPencilSimpleBold: Icon = weighted(PencilSimple, "bold", "PiPencilSimpleBold");
export const PiPencilSimpleFill: Icon = weighted(PencilSimple, "fill", "PiPencilSimpleFill");
export const PiPhoneCallFill: Icon = weighted(PhoneCall, "fill", "PiPhoneCallFill");
export const PiPhoneDisconnectFill: Icon = weighted(PhoneDisconnect, "fill", "PiPhoneDisconnectFill");
export const PiPhoneFill: Icon = weighted(Phone, "fill", "PiPhoneFill");
export const PiPhoneXFill: Icon = weighted(PhoneX, "fill", "PiPhoneXFill");
export const PiPauseFill: Icon = weighted(Pause, "fill", "PiPauseFill");
export const PiPlayFill: Icon = weighted(Play, "fill", "PiPlayFill");
export const PiPlus: Icon = Plus;
export const PiPlusBold: Icon = weighted(Plus, "bold", "PiPlusBold");
export const PiProhibitBold: Icon = weighted(Prohibit, "bold", "PiProhibitBold");
export const PiProhibitFill: Icon = weighted(Prohibit, "fill", "PiProhibitFill");
export const PiPushPinFill: Icon = weighted(PushPin, "fill", "PiPushPinFill");
export const PiPushPinSlashFill: Icon = weighted(PushPinSlash, "fill", "PiPushPinSlashFill");
export const PiPuzzlePieceFill: Icon = weighted(PuzzlePiece, "fill", "PiPuzzlePieceFill");
export const PiRobotFill: Icon = weighted(Robot, "fill", "PiRobotFill");
export const PiScanSmileyFill: Icon = weighted(ScanSmiley, "fill", "PiScanSmileyFill");
export const PiScreencastFill: Icon = weighted(Screencast, "fill", "PiScreencastFill");
export const PiShieldCheckFill: Icon = weighted(ShieldCheck, "fill", "PiShieldCheckFill");
export const PiShieldWarningFill: Icon = weighted(ShieldWarning, "fill", "PiShieldWarningFill");
export const PiSignInBold: Icon = weighted(SignIn, "bold", "PiSignInBold");
export const PiSignInFill: Icon = weighted(SignIn, "fill", "PiSignInFill");
export const PiSignOutFill: Icon = weighted(SignOut, "fill", "PiSignOutFill");
export const PiSlidersHorizontalFill: Icon = weighted(SlidersHorizontal, "fill", "PiSlidersHorizontalFill");
export const PiSparkleFill: Icon = weighted(Sparkle, "fill", "PiSparkleFill");
export const PiSpeakerHighFill: Icon = weighted(SpeakerHigh, "fill", "PiSpeakerHighFill");
export const PiSpeakerSimpleHighFill: Icon = weighted(SpeakerSimpleHigh, "fill", "PiSpeakerSimpleHighFill");
export const PiSpeakerSimpleSlashFill: Icon = weighted(SpeakerSimpleSlash, "fill", "PiSpeakerSimpleSlashFill");
export const PiSpeakerSlashFill: Icon = weighted(SpeakerSlash, "fill", "PiSpeakerSlashFill");
export const PiSquaresFourFill: Icon = weighted(SquaresFour, "fill", "PiSquaresFourFill");
export const PiStopFill: Icon = weighted(Stop, "fill", "PiStopFill");
export const PiUploadSimple: Icon = UploadSimple;
export const PiUploadSimpleFill: Icon = weighted(UploadSimple, "fill", "PiUploadSimpleFill");
export const PiUserFill: Icon = weighted(User, "fill", "PiUserFill");
export const PiUserPlusFill: Icon = weighted(UserPlus, "fill", "PiUserPlusFill");
export const PiUsersBold: Icon = weighted(Users, "bold", "PiUsersBold");
export const PiUsersThreeFill: Icon = weighted(UsersThree, "fill", "PiUsersThreeFill");
export const PiWarningCircle: Icon = WarningCircle;
export const PiWarningCircleFill: Icon = weighted(WarningCircle, "fill", "PiWarningCircleFill");
export const PiWarningFill: Icon = weighted(Warning, "fill", "PiWarningFill");
export const PiWebhooksLogoFill: Icon = weighted(WebhooksLogo, "fill", "PiWebhooksLogoFill");
export const PiWifiSlashFill: Icon = weighted(WifiSlash, "fill", "PiWifiSlashFill");
export const PiX: Icon = X;
export const PiXBold: Icon = weighted(X, "bold", "PiXBold");
export const PiXCircleFill: Icon = weighted(XCircle, "fill", "PiXCircleFill");
export const PiSidebarSimpleFill: Icon = weighted(SidebarSimple, "fill", "PiSidebarSimpleFill");
export const PiPlugsFill: Icon = weighted(Plugs, "fill", "PiPlugsFill");
export const PiPulseBold: Icon = weighted(Pulse, "bold", "PiPulseBold");

/** A teardrop message with a pin cut into its corner, for the pinned messages list (GRYT-1783).
    Masked rather than outlined in the background colour, so it holds on any surface. */
export const PiPinnedMessages = (({ size = "1em", color = "currentColor", ...rest }: IconProps) => {
  const mask = `pin-${useId().replace(/:/g, "")}`;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill={color} {...rest}>
      <mask id={mask}>
        <rect width="256" height="256" fill="white" />
        <circle cx="200" cy="58" r="80" fill="black" />
      </mask>
      <g mask={`url(#${mask})`}>
        <ChatTeardropText size={256} />
      </g>
      <PushPin weight="fill" size={120} x={140} y={-2} />
    </svg>
  );
}) as Icon;

export const PiArrowCircleUpFill: Icon = weighted(ArrowCircleUp, "fill", "PiArrowCircleUpFill");
export const PiBellSimpleFill: Icon = weighted(BellSimple, "fill", "PiBellSimpleFill");
export const PiCameraSlashFill: Icon = weighted(CameraSlash, "fill", "PiCameraSlashFill");
export const PiDoorOpenBold: Icon = weighted(DoorOpen, "bold", "PiDoorOpenBold");
export const PiFilePlusFill: Icon = weighted(FilePlus, "fill", "PiFilePlusFill");
export const PiFingerprintFill: Icon = weighted(Fingerprint, "fill", "PiFingerprintFill");
export const PiGiftFill: Icon = weighted(Gift, "fill", "PiGiftFill");
export const PiHouseLineFill: Icon = weighted(HouseLine, "fill", "PiHouseLineFill");
export const PiShieldSlashFill: Icon = weighted(ShieldSlash, "fill", "PiShieldSlashFill");
export const PiSmileyWinkBold: Icon = weighted(SmileyWink, "bold", "PiSmileyWinkBold");
export const PiSmileyWinkFill: Icon = weighted(SmileyWink, "fill", "PiSmileyWinkFill");
export const PiTrashSimpleBold: Icon = weighted(TrashSimple, "bold", "PiTrashSimpleBold");
export const PiTrashSimpleFill: Icon = weighted(TrashSimple, "fill", "PiTrashSimpleFill");
export const PiCodeBlockBold: Icon = weighted(CodeBlock, "bold", "PiCodeBlockBold");
export const PiListBulletsBold: Icon = weighted(ListBullets, "bold", "PiListBulletsBold");
export const PiListNumbersBold: Icon = weighted(ListNumbers, "bold", "PiListNumbersBold");
export const PiQuotesBold: Icon = weighted(Quotes, "bold", "PiQuotesBold");
export const PiTextBBold: Icon = weighted(TextB, "bold", "PiTextBBold");
export const PiTextItalicBold: Icon = weighted(TextItalic, "bold", "PiTextItalicBold");
export const PiTextStrikethroughBold: Icon = weighted(TextStrikethrough, "bold", "PiTextStrikethroughBold");
export const PiTextHOneBold: Icon = weighted(TextHOne, "bold", "PiTextHOneBold");
export const PiTextHTwoBold: Icon = weighted(TextHTwo, "bold", "PiTextHTwoBold");
export const PiTextHThreeBold: Icon = weighted(TextHThree, "bold", "PiTextHThreeBold");

/** Discord's own mark, from Simple Icons (CC0). Takes the same size and color as the Phosphor icons. */
export const DiscordLogo = (({ size = "1em", color = "currentColor", ...rest }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} {...rest}>
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
  </svg>
)) as Icon;

/** Gryt's flat mark, face and wings, drawn from @gryt/owl's shapes. Same size and color props as the Phosphor icons. */
export const GrytLogo = (({ size = "1em", color = "currentColor", ...rest }: IconProps) => {
  const id = `gryt-mark-${useId().replace(/:/g, "")}`;
  const m = GRYT_MARK;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox={m.viewBox} {...rest}>
      <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1100">
        <path d={m.body} fill="white" />
        {m.wings.map((d) => (
          <path key={d.slice(0, 12)} d={d} fill="none" stroke="black" strokeWidth={m.wingCut} strokeLinejoin="round" />
        ))}
        <path d={m.disc} fill="black" />
        {m.eyes.map((d) => (
          <path key={d.slice(0, 12)} d={d} fill="white" />
        ))}
        <path d={m.beak} fill="white" />
      </mask>
      <rect x="0" y="0" width="1024" height={m.chestY} fill={color} mask={`url(#${id})`} />
    </svg>
  );
}) as Icon;

// Added for the Gryt Cloud console (GRYT-2192): candidates for its icon spots.
export const PiAirplaneTiltFill: Icon = weighted(AirplaneTilt, "fill", "PiAirplaneTiltFill");
export const PiArrowBendUpRightFill: Icon = weighted(ArrowBendUpRight, "fill", "PiArrowBendUpRightFill");
export const PiArrowClockwiseFill: Icon = weighted(ArrowClockwise, "fill", "PiArrowClockwiseFill");
export const PiArrowCounterClockwiseFill: Icon = weighted(ArrowCounterClockwise, "fill", "PiArrowCounterClockwiseFill");
export const PiArrowSquareRightFill: Icon = weighted(ArrowSquareRight, "fill", "PiArrowSquareRightFill");
export const PiAtFill: Icon = weighted(At, "fill", "PiAtFill");
export const PiBankFill: Icon = weighted(Bank, "fill", "PiBankFill");
export const PiBarricadeFill: Icon = weighted(Barricade, "fill", "PiBarricadeFill");
export const PiBellRingingFill: Icon = weighted(BellRinging, "fill", "PiBellRingingFill");
export const PiBriefcaseFill: Icon = weighted(Briefcase, "fill", "PiBriefcaseFill");
export const PiBrowserFill: Icon = weighted(Browser, "fill", "PiBrowserFill");
export const PiBuildingFill: Icon = weighted(Building, "fill", "PiBuildingFill");
export const PiBuildingsFill: Icon = weighted(Buildings, "fill", "PiBuildingsFill");
export const PiCalendarBlankFill: Icon = weighted(CalendarBlank, "fill", "PiCalendarBlankFill");
export const PiCalendarCheckFill: Icon = weighted(CalendarCheck, "fill", "PiCalendarCheckFill");
export const PiCardholderFill: Icon = weighted(Cardholder, "fill", "PiCardholderFill");
export const PiCertificateFill: Icon = weighted(Certificate, "fill", "PiCertificateFill");
export const PiChartPieSliceFill: Icon = weighted(ChartPieSlice, "fill", "PiChartPieSliceFill");
export const PiChatCircleFill: Icon = weighted(ChatCircle, "fill", "PiChatCircleFill");
export const PiClockCountdownFill: Icon = weighted(ClockCountdown, "fill", "PiClockCountdownFill");
export const PiClockCounterClockwiseFill: Icon = weighted(ClockCounterClockwise, "fill", "PiClockCounterClockwiseFill");
export const PiCloudCheckFill: Icon = weighted(CloudCheck, "fill", "PiCloudCheckFill");
export const PiCoinsFill: Icon = weighted(Coins, "fill", "PiCoinsFill");
export const PiCompassFill: Icon = weighted(Compass, "fill", "PiCompassFill");
export const PiCreditCardFill: Icon = weighted(CreditCard, "fill", "PiCreditCardFill");
export const PiCrownFill: Icon = weighted(Crown, "fill", "PiCrownFill");
export const PiCubeFill: Icon = weighted(Cube, "fill", "PiCubeFill");
export const PiDatabaseFill: Icon = weighted(Database, "fill", "PiDatabaseFill");
export const PiExportFill: Icon = weighted(Export, "fill", "PiExportFill");
export const PiFactoryFill: Icon = weighted(Factory, "fill", "PiFactoryFill");
export const PiFileArchiveFill: Icon = weighted(FileArchive, "fill", "PiFileArchiveFill");
export const PiFireFill: Icon = weighted(Fire, "fill", "PiFireFill");
export const PiFoldersFill: Icon = weighted(Folders, "fill", "PiFoldersFill");
export const PiGlobeFill: Icon = weighted(Globe, "fill", "PiGlobeFill");
export const PiGlobeHemisphereWestFill: Icon = weighted(GlobeHemisphereWest, "fill", "PiGlobeHemisphereWestFill");
export const PiGlobeStandFill: Icon = weighted(GlobeStand, "fill", "PiGlobeStandFill");
export const PiHandHeartFill: Icon = weighted(HandHeart, "fill", "PiHandHeartFill");
export const PiHardDriveFill: Icon = weighted(HardDrive, "fill", "PiHardDriveFill");
export const PiHashFill: Icon = weighted(Hash, "fill", "PiHashFill");
export const PiHeadsetFill: Icon = weighted(Headset, "fill", "PiHeadsetFill");
export const PiHourglassFill: Icon = weighted(Hourglass, "fill", "PiHourglassFill");
export const PiHourglassMediumFill: Icon = weighted(HourglassMedium, "fill", "PiHourglassMediumFill");
export const PiIdentificationBadgeFill: Icon = weighted(IdentificationBadge, "fill", "PiIdentificationBadgeFill");
export const PiIdentificationCardFill: Icon = weighted(IdentificationCard, "fill", "PiIdentificationCardFill");
export const PiInvoiceFill: Icon = weighted(Invoice, "fill", "PiInvoiceFill");
export const PiLifebuoyFill: Icon = weighted(Lifebuoy, "fill", "PiLifebuoyFill");
export const PiLinkBreakFill: Icon = weighted(LinkBreak, "fill", "PiLinkBreakFill");
export const PiLinkSimpleFill: Icon = weighted(LinkSimple, "fill", "PiLinkSimpleFill");
export const PiMapPinFill: Icon = weighted(MapPin, "fill", "PiMapPinFill");
export const PiMapTrifoldFill: Icon = weighted(MapTrifold, "fill", "PiMapTrifoldFill");
export const PiMedalFill: Icon = weighted(Medal, "fill", "PiMedalFill");
export const PiMoneyFill: Icon = weighted(Money, "fill", "PiMoneyFill");
export const PiMoonFill: Icon = weighted(Moon, "fill", "PiMoonFill");
export const PiMountainsFill: Icon = weighted(Mountains, "fill", "PiMountainsFill");
export const PiNavigationArrowFill: Icon = weighted(NavigationArrow, "fill", "PiNavigationArrowFill");
export const PiNotebookFill: Icon = weighted(Notebook, "fill", "PiNotebookFill");
export const PiPackageFill: Icon = weighted(Package, "fill", "PiPackageFill");
export const PiPauseCircleFill: Icon = weighted(PauseCircle, "fill", "PiPauseCircleFill");
export const PiPlanetFill: Icon = weighted(Planet, "fill", "PiPlanetFill");
export const PiPlugFill: Icon = weighted(Plug, "fill", "PiPlugFill");
export const PiPulseFill: Icon = weighted(Pulse, "fill", "PiPulseFill");
export const PiQuestionFill: Icon = weighted(Question, "fill", "PiQuestionFill");
export const PiReceiptFill: Icon = weighted(Receipt, "fill", "PiReceiptFill");
export const PiRocketLaunchFill: Icon = weighted(RocketLaunch, "fill", "PiRocketLaunchFill");
export const PiScrollFill: Icon = weighted(Scroll, "fill", "PiScrollFill");
export const PiSealWarningFill: Icon = weighted(SealWarning, "fill", "PiSealWarningFill");
export const PiShieldFill: Icon = weighted(Shield, "fill", "PiShieldFill");
export const PiShieldStarFill: Icon = weighted(ShieldStar, "fill", "PiShieldStarFill");
export const PiShuffleFill: Icon = weighted(Shuffle, "fill", "PiShuffleFill");
export const PiSignpostFill: Icon = weighted(Signpost, "fill", "PiSignpostFill");
export const PiSirenFill: Icon = weighted(Siren, "fill", "PiSirenFill");
export const PiSmileySadFill: Icon = weighted(SmileySad, "fill", "PiSmileySadFill");
export const PiSnowflakeFill: Icon = weighted(Snowflake, "fill", "PiSnowflakeFill");
export const PiStackFill: Icon = weighted(Stack, "fill", "PiStackFill");
export const PiStorefrontFill: Icon = weighted(Storefront, "fill", "PiStorefrontFill");
export const PiTagFill: Icon = weighted(Tag, "fill", "PiTagFill");
export const PiTimerFill: Icon = weighted(Timer, "fill", "PiTimerFill");
export const PiTrashFill: Icon = weighted(Trash, "fill", "PiTrashFill");
export const PiTrayFill: Icon = weighted(Tray, "fill", "PiTrayFill");
export const PiTruckFill: Icon = weighted(Truck, "fill", "PiTruckFill");
export const PiUmbrellaFill: Icon = weighted(Umbrella, "fill", "PiUmbrellaFill");
export const PiUsersFill: Icon = weighted(Users, "fill", "PiUsersFill");
export const PiVaultFill: Icon = weighted(Vault, "fill", "PiVaultFill");
export const PiWalletFill: Icon = weighted(Wallet, "fill", "PiWalletFill");
export const PiWrenchFill: Icon = weighted(Wrench, "fill", "PiWrenchFill");
