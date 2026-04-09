import { useState } from "react";
import NumberInput from "./NumberInput";
import type { OjtTracking } from "../services/api";
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
  const [customHours, setCustomHours] = useState<boolean>(false);

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

    if (!customHours) {
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
      <div className="flex items-center justify-end mb-2 text-center">
        <button
          type="button"
          onClick={() => setCustomHours((prev) => !prev)}
          className={`border bg-gray-100 px-3 py-1 rounded-lg text-xs transition-all hover:cursor-pointer ${
            customHours
              ? "bg-white text-blue-700 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Custom Hours
        </button>
      </div>
      <div className="flex gap-4">
        {customHours && (
          <div className="w-full">
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
          className={`px-6 py-3`}
        >
          Time in
        </PrimaryButton>
      </div>
    </div>
  );
};

export default LogDutyCard;
