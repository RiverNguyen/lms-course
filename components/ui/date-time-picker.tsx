"use client";

import * as React from "react";
import { format, setHours, setMinutes, startOfDay } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: Date;
  max?: Date;
  className?: string;
}

function toTimeString(d: Date): string {
  const h = d.getHours();
  const m = d.getMinutes();
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function parseTimeString(s: string): { hours: number; minutes: number } {
  const [h, m] = s.split(":").map(Number);
  return { hours: isNaN(h) ? 0 : Math.max(0, Math.min(23, h)), minutes: isNaN(m) ? 0 : Math.max(0, Math.min(59, m)) };
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Chọn ngày và giờ",
  disabled,
  min,
  max,
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(value);
  const [time, setTime] = React.useState(value ? toTimeString(value) : "00:00");

  React.useEffect(() => {
    if (value) {
      setDate(value);
      setTime(toTimeString(value));
    } else {
      setDate(undefined);
      setTime("00:00");
    }
  }, [value]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setTime(v);
    if (v) {
      const base = date ?? new Date();
      if (!date) setDate(base);
      const { hours, minutes } = parseTimeString(v);
      const combined = setMinutes(setHours(base, hours), minutes);
      onChange?.(combined);
    }
  };

  const handleCalendarSelect = (d: Date | undefined) => {
    if (!d) return;
    setDate(d);
    const { hours, minutes } = parseTimeString(time);
    const combined = setMinutes(setHours(d, hours), minutes);
    onChange?.(combined);
  };

  const displayValue = value
    ? format(value, "dd/MM/yyyy HH:mm", { locale: vi })
    : "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !displayValue && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {displayValue || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col gap-3 p-3">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleCalendarSelect}
            disabled={(d) => {
              const day = startOfDay(d);
              if (min && day < startOfDay(min)) return true;
              if (max && day > startOfDay(max)) return true;
              return false;
            }}
            initialFocus
          />
          <div className="flex items-center gap-2 border-t pt-3">
            <LabelTime>Giờ</LabelTime>
            <Input
              type="time"
              value={time}
              onChange={handleTimeChange}
              className="flex-1"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Xong
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function LabelTime({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-sm font-medium text-muted-foreground">{children}</span>
  );
}
