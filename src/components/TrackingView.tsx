import { format } from "date-fns";
import type { OjtTracking } from "../services/api";
import FinishDateCard from "./FinishDateCard";
import LogDutyCard from "./LogDutyCard";

interface TrackingViewProps {
  trackingData: OjtTracking | null;
  completedHours: number;
  todayDutyHours: string;
  setTodayDutyHours: (value: string) => void;
  isLoading: boolean;
  onAddTodayDuty: (hoursOverride?: number) => Promise<void>;
  onResetTracking: () => Promise<void>;
  getProgressPercentage: () => number;
  getRemainingHours: () => number;
}

const TrackingView = ({
  trackingData,
  completedHours,
  todayDutyHours,
  setTodayDutyHours,
  isLoading,
  onAddTodayDuty,
  onResetTracking,
  getProgressPercentage,
  getRemainingHours,
}: TrackingViewProps) => {
  return (
    <div className="py-8">
      {/* Progress Overview with Calendar */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Today is{" "}
          <span className="text-blue-600">
            {format(new Date(), "MMMM dd, yyyy")}
          </span>
        </h2>
        <button
          onClick={onResetTracking}
          disabled={isLoading}
          className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset Tracking
        </button>
      </div>

      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              Overall Progress
            </span>
            <span className="text-sm font-bold text-blue-600">
              {getProgressPercentage().toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <div>
              <span>
                Started since{" "}
                {trackingData?.startDate
                  ? format(new Date(trackingData.startDate), "MMMM dd, yyyy")
                  : "N/A"}
              </span>
            </div>
            <div>
              <FinishDateCard
                trackingData={trackingData}
                completedHours={completedHours}
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-6">
          <div className="shadow-sm border rounded-lg p-6">
            <p className="text-lg font-semibold text-gray-900">Total Days</p>
            <p className="text-3xl font-bold text-blue-600">
              {trackingData?.totalDays}
            </p>
            <p className="text-xs text-gray-500 mt-1">days required</p>
          </div>

          <div className="shadow-sm border rounded-lg p-6">
            <p className="text-lg font-semibold text-gray-900">
              Hours Completed
            </p>
            <p className="text-3xl font-bold text-blue-600">{completedHours}</p>
            <p className="text-xs text-gray-500 mt-1">
              out of {trackingData?.totalHours} hrs
            </p>
          </div>

          <div className="shadow-sm border rounded-lg p-6">
            <p className="text-lg font-semibold text-gray-900">
              Remaining Hours
            </p>
            <p className="text-3xl font-bold text-blue-600">
              {getRemainingHours()}
            </p>
            <p className="text-xs text-gray-500 mt-1">hours left</p>
          </div>
        </div>

        <LogDutyCard
          trackingData={trackingData}
          todayDutyHours={todayDutyHours}
          setTodayDutyHours={setTodayDutyHours}
          isLoading={isLoading}
          onAddTodayDuty={onAddTodayDuty}
        />
      </div>
    </div>
  );
};

export default TrackingView;
