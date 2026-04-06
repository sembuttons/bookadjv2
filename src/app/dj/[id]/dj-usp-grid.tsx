import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  Disc3,
  Headphones,
  Heart,
  MapPin,
  Mic2,
  Music,
  Shield,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";

export type UspItem = {
  icon_name: string;
  title: string;
  description: string;
};

const ICON_MAP: Record<string, LucideIcon> = {
  music: Music,
  mic: Mic2,
  speaker: Disc3,
  star: Star,
  heart: Heart,
  shield: Shield,
  zap: Zap,
  users: Users,
  calendar: Calendar,
  map: MapPin,
  mapin: MapPin,
  headphones: Headphones,
  disco: Disc3,
};

function normalizeIconKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function UspIcon({ name }: { name: string }) {
  const key = normalizeIconKey(name);
  const Icon = ICON_MAP[key] ?? Sparkles;
  return <Icon className="h-6 w-6 text-green-600" strokeWidth={1.75} />;
}

type Props = {
  stageName: string;
  items: UspItem[];
};

export function DjUspGrid({ stageName, items }: Props) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="usp-heading">
      <h2
        id="usp-heading"
        className="text-xl font-bold text-slate-900 sm:text-2xl"
      >
        Wat maakt {stageName} uniek
      </h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((u) => (
          <li
            key={u.title}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <UspIcon name={u.icon_name} />
            <p className="mt-4 font-semibold text-slate-900">{u.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {u.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
