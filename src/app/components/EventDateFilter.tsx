import type { DateRange } from "react-day-picker";
import { CalendarDays } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { bebas, inter } from "./shared";

export type EventDateFilterMode = "all" | "this-month" | "next-month" | "range";

type EventDateFilterProps = {
  mode: EventDateFilterMode;
  onModeChange: (mode: EventDateFilterMode) => void;
  range: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
};

const formatRangeLabel = (range: DateRange | undefined) => {
  if (!range?.from) return "Vybrat rozmezí";

  const from = range.from.toLocaleDateString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  if (!range.to) return from;

  const to = range.to.toLocaleDateString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return `${from} - ${to}`;
};

const startOfDayTs = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

export const isEventInDateFilter = (
  eventTs: number,
  mode: EventDateFilterMode,
  range: DateRange | undefined,
  now: Date = new Date(),
) => {
  if (!Number.isFinite(eventTs) || eventTs === Number.MAX_SAFE_INTEGER) {
    return false;
  }

  if (mode === "all") return true;

  const eventDate = new Date(eventTs);
  const eventStartTs = startOfDayTs(eventDate);

  if (mode === "this-month" || mode === "next-month") {
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthOffset = mode === "this-month" ? 0 : 1;

    const monthStart = new Date(currentYear, currentMonth + monthOffset, 1);
    const monthEnd = new Date(currentYear, currentMonth + monthOffset + 1, 0);

    const monthStartTs = startOfDayTs(monthStart);
    const monthEndTs = startOfDayTs(monthEnd);

    return eventStartTs >= monthStartTs && eventStartTs <= monthEndTs;
  }

  const fromTs = range?.from ? startOfDayTs(range.from) : null;
  const toTs = range?.to ? startOfDayTs(range.to) : null;

  if (fromTs === null) return true;
  if (toTs === null) return eventStartTs >= fromTs;

  return eventStartTs >= fromTs && eventStartTs <= toTs;
};

export function EventDateFilter({ mode, onModeChange, range, onRangeChange }: EventDateFilterProps) {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 text-white/80 mb-4" style={{ fontFamily: bebas }}>
        <CalendarDays className="w-4 h-4 text-[#6EE76D]" />
        Filtrovat podle data
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => onModeChange("all")}
          className={`rounded-full border px-4 py-2 text-sm transition-all ${mode === "all" ? "border-[#F587B9] bg-[#F587B9]/12 text-white shadow-[0_0_18px_rgba(245,135,185,0.12)]" : "border-white/10 text-white/70 hover:border-[#F587B9]/40 hover:text-white"}`}
          style={{ fontFamily: inter }}
        >
          Vse
        </button>

        <button
          onClick={() => onModeChange("this-month")}
          className={`rounded-full border px-4 py-2 text-sm transition-all ${mode === "this-month" ? "border-[#F587B9] bg-[#F587B9]/12 text-white shadow-[0_0_18px_rgba(245,135,185,0.12)]" : "border-white/10 text-white/70 hover:border-[#F587B9]/40 hover:text-white"}`}
          style={{ fontFamily: inter }}
        >
          Tento mesic
        </button>

        <button
          onClick={() => onModeChange("next-month")}
          className={`rounded-full border px-4 py-2 text-sm transition-all ${mode === "next-month" ? "border-[#F587B9] bg-[#F587B9]/12 text-white shadow-[0_0_18px_rgba(245,135,185,0.12)]" : "border-white/10 text-white/70 hover:border-[#F587B9]/40 hover:text-white"}`}
          style={{ fontFamily: inter }}
        >
          Pristi mesic
        </button>

        <Popover>
          <PopoverTrigger asChild>
            <button
              className={`rounded-full border px-4 py-2 text-sm transition-all ${mode === "range" ? "border-[#F587B9] bg-[#F587B9]/12 text-white shadow-[0_0_18px_rgba(245,135,185,0.12)]" : "border-white/10 text-white/70 hover:border-[#F587B9]/40 hover:text-white"}`}
              style={{ fontFamily: inter }}
              onClick={() => onModeChange("range")}
            >
              {formatRangeLabel(range)}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border border-[#6EE76D]/20 bg-[#0e160e]">
            <Calendar
              mode="range"
              selected={range}
              onSelect={(nextRange) => {
                onRangeChange(nextRange);
                onModeChange("range");
              }}
              numberOfMonths={2}
              className="text-white"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
