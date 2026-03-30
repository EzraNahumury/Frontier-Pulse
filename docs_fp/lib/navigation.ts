import {
  Sparkles,
  Blocks,
  Rocket,
  FolderTree,
  Monitor,
  Puzzle,
  Server,
  BarChart3,
  FileCode2,
  Braces,
  Database,
  Cloud,
  BookA,
  HelpCircle,
  History,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navigation: NavSection[] = [
  {
    title: "Welcome",
    items: [
      { title: "Introduction", href: "/introduction", icon: Sparkles },
    ],
  },
  {
    title: "Quick Start",
    items: [
      { title: "Installation", href: "/getting-started", icon: Rocket },
      { title: "Project Structure", href: "/project-structure", icon: FolderTree },
    ],
  },
  {
    title: "Architecture",
    items: [
      { title: "System Overview", href: "/architecture", icon: Blocks },
      { title: "Data Sources", href: "/data-sources", icon: Database },
    ],
  },
  {
    title: "Frontend",
    items: [
      { title: "Dashboard", href: "/frontend", icon: Monitor },
      { title: "Components", href: "/components", icon: Puzzle },
    ],
  },
  {
    title: "Backend & Chain",
    items: [
      { title: "Oracle Backend", href: "/oracle", icon: Server },
      { title: "Scoring Engine", href: "/scoring", icon: BarChart3 },
      { title: "Smart Contract", href: "/smart-contract", icon: FileCode2 },
    ],
  },
  {
    title: "API & Deploy",
    items: [
      { title: "API Reference", href: "/api-reference", icon: Braces },
      { title: "Deployment", href: "/deployment", icon: Cloud },
    ],
  },
  {
    title: "Resources",
    items: [
      { title: "Glossary", href: "/glossary", icon: BookA },
      { title: "FAQ", href: "/faq", icon: HelpCircle },
      { title: "Changelog", href: "/changelog", icon: History },
      { title: "Team & Links", href: "/team", icon: Users },
    ],
  },
];
