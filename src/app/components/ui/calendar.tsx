"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cs } from "date-fns/locale";

import { cn } from "./utils";
import { buttonVariants } from "./button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const mergedLabels = {
    ...(props.labels ?? {}),
    labelPrevious: () => "Předchozí měsíc",
    labelNext: () => "Další měsíc",
  };

  const mergedFormatters = {
    ...(props.formatters ?? {}),
    formatCaption: (date: Date) =>
      new Intl.DateTimeFormat("cs-CZ", { month: "long", year: "numeric" }).format(date),
    formatWeekdayName: (date: Date) =>
      new Intl.DateTimeFormat("cs-CZ", { weekday: "short" }).format(date),
  };

  return (
    <DayPicker
      {...props}
      locale={cs}
      weekStartsOn={1}
      ISOWeek
      labels={mergedLabels}
      formatters={mergedFormatters}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-8 sm:gap-10",
        month: "flex flex-col gap-5",
        caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-x-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-[#6EE76D]/30 [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md",
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal aria-selected:opacity-100",
        ),
        day_range_start:
          "day-range-start aria-selected:bg-[#6EE76D] aria-selected:text-[#0B140B]",
        day_range_end:
          "day-range-end aria-selected:bg-[#6EE76D] aria-selected:text-[#0B140B]",
        day_selected:
          "bg-[#6EE76D] text-[#0B140B] hover:bg-[#6EE76D] hover:text-[#0B140B] focus:bg-[#6EE76D] focus:text-[#0B140B]",
        day_today: "bg-[#F587B9]/20 text-white",
        day_outside:
          "day-outside text-muted-foreground aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-[#6EE76D]/30 aria-selected:text-white",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("size-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("size-4", className)} {...props} />
        ),
      }}
    />
  );
}

export { Calendar };
