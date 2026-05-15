import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import type { OjtTracking } from "../apis";

interface TrackingCalendarProps {
  trackingData: OjtTracking | null;
  onSelectDate?: (date: Date) => void;
}

const TrackingCalendar = ({
  trackingData,
  onSelectDate,
}: TrackingCalendarProps) => {
  const dutyHoursByDate = new Map<string, number>();

  (trackingData?.dutyLogs ?? []).forEach((log) => {
    const logDate = new Date(log.date);
    const dateKey = `${logDate.getFullYear()}-${logDate.getMonth()}-${logDate.getDate()}`;
    const currentHours = dutyHoursByDate.get(dateKey) ?? 0;
    dutyHoursByDate.set(dateKey, currentHours + log.hoursWorked);
  });

  const getDutyHoursForDate = (date: Date) => {
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return dutyHoursByDate.get(dateKey) ?? 0;
  };

  return (
    <Calendar
      mode="single"
      selected={new Date()}
      className="w-full"
      buttonVariant="outline"
      components={{
        DayButton: ({ children, modifiers, day, ...props }) => {
          const dutyHours = getDutyHoursForDate(day.date);
          return (
            <CalendarDayButton
              day={day}
              modifiers={modifiers}
              {...props}
              onClick={(e) => {
                props.onClick?.(e);
                onSelectDate?.(day.date);
              }}
            >
              {children}
              {!modifiers.outside && dutyHours > 0 && (
                <>
                  <div className="absolute inset-0 opacity-20 bg-blue-500 rounded-md" />
                  <span>{dutyHours}h</span>
                </>
              )}
            </CalendarDayButton>
          );
        },
      }}
    />
  );
};

export default TrackingCalendar;
