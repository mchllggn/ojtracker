import { useState } from "react";
import NumberInput from "./NumberInput";
import type { OjtTracking } from "../../backend/services/ojtTrackingService";
import PrimaryButton from "./PrimaryButton";

interface LogDutyCardProps {
  trackingData: OjtTracking | null;
  todayDutyHours: string;
  setTodayDutyHours: (value: string) => void;
  isLoading: boolean;
  onAddTodayDuty: (hoursOverride?: number) => Promise<void>;
}

const LogDutyCard = ({
  trackingData,
  todayDutyHours,
  setTodayDutyHours,
  isLoading,
  onAddTodayDuty,
}: LogDutyCardProps) => {
  const [entryMode, setEntryMode] = useState<"time-in" | "specific">("time-in");

  const dutyHoursPerDay = trackingData?.dutyHoursPerDay ?? 0;

  const hasTimedInToday = (trackingData?.dutyLogs ?? []).some((log) => {
    const logDate = new Date(log.date);
    const today = new Date();

    return (
      logDate.getFullYear() === today.getFullYear() &&
      logDate.getMonth() === today.getMonth() &&
      logDate.getDate() === today.getDate()
    );
  });

  const handleSubmit = async () => {
    if (!trackingData || isLoading) return;

    if (entryMode === "time-in") {
      if (hasTimedInToday) {
        return;
      }

      if (dutyHoursPerDay <= 0) {
        alert("Invalid duty hours per day");
        return;
      }

      const autoHours = Number(dutyHoursPerDay.toFixed(2));
      setTodayDutyHours(autoHours.toString());
      await onAddTodayDuty(autoHours);
      return;
    }

    await onAddTodayDuty();
  };

  if (hasTimedInToday) {
    return (
      <div className="w-full max-w-2xl mx-auto px-6 py-3 rounded-lg bg-blue-100 text-blue-700 font-medium text-center border border-blue-200">
        Great work! You already timed in today.
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-4 flex gap-2 p-1 bg-gray-100 rounded-lg">
        <button
          type="button"
          onClick={() => setEntryMode("time-in")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            entryMode === "time-in"
              ? "bg-white text-blue-700 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Time In
        </button>
        <button
          type="button"
          onClick={() => setEntryMode("specific")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            entryMode === "specific"
              ? "bg-white text-blue-700 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Specific Hours
        </button>
      </div>

      <div className="flex gap-4">
        {entryMode === "specific" && (
          <div className="flex-1">
            <NumberInput
              value={todayDutyHours}
              onChange={setTodayDutyHours}
              placeholder="Enter hours worked today"
              min={0}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm hover:border-indigo-400 bg-white"
            />
          </div>
        )}

        <PrimaryButton
          onClick={handleSubmit}
          disabled={isLoading || !trackingData}
          className={`${entryMode === "time-in" && "w-full"} px-6 py-3`}
        >
          Time in
        </PrimaryButton>
      </div>
    </div>
  );
};

export default LogDutyCard;
