import type { Props } from "astro";
import IconMail from "@/assets/icons/IconMail.svg";
import IconGitHub from "@/assets/icons/IconGitHub.svg";
import IconHTB from "@/assets/icons/IconHTB.svg"
import IconWhatsapp from "@/assets/icons/IconWhatsapp.svg";
import IconTelegram from "@/assets/icons/IconTelegram.svg";
import IconDiscord from "@/assets/icons/IconDiscord.svg"
import { SITE } from "@/config";

interface Social {
  name: string;
  href: string;
  linkTitle: string;
  icon: (_props: Props) => Element;
}

export const SOCIALS: Social[] = [
  {
    name: "GitHub",
    href: "https://github.com/nohh022",
    linkTitle: `${SITE.title} on GitHub`,
    icon: IconGitHub,
  },
  {
    name:"HTB",
    href: "https://app.hackthebox.com/users/2667754",
    linkTitle: "",
    icon: IconHTB
  },
  {
    name:"Discord",
    href: "https://discord.com/users/nohh022_41715",
    linkTitle: "",
    icon: IconDiscord
  },
] as const;

export const SHARE_LINKS: Social[] = [
  {
    name: "WhatsApp",
    href: "https://wa.me/?text=",
    linkTitle: `Share this post via WhatsApp`,
    icon: IconWhatsapp,
  },
  {
    name: "Telegram",
    href: "https://t.me/share/url?url=",
    linkTitle: `Share this post via Telegram`,
    icon: IconTelegram,
  },
  {
    name: "Mail",
    href: "mailto:?subject=See%20this%20post&body=",
    linkTitle: `Share this post via email`,
    icon: IconMail,
  },
] as const;

export const PLATFORMS : string[] = [
 "The Hackers Labs",
 "Dockerlabs",
 "Vulnyx",
 "HTB"
];