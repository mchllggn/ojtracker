import { format } from "date-fns";
import type { OjtTracking } from "../../backend/services/ojtTrackingService";
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
        <div className="flex gap-6 items-center justify-between">
          {/* Since Started Date */}
          <div className="p-4 bg-gray-100 rounded-md">
            <p className="text-xs uppercase font-medium tracking-wide text-gray-600">
              Started Since:
              <span className="pl-2 text-blue-600 font-bold">
                {trackingData
                  ? format(new Date(trackingData.startDate), "MMMM dd, yyyy")
                  : "N/A"}
              </span>
            </p>
          </div>

          <FinishDateCard
            trackingData={trackingData}
            completedHours={completedHours}
          />
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
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
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>{completedHours} hrs completed</span>
            <span>{trackingData?.totalHours} hrs total</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-100 rounded-xl p-6">
            <p className="text-lg font-semibold text-gray-900">Total Days</p>
            <p className="text-3xl font-bold text-blue-600">
              {trackingData?.totalDays}
            </p>
            <p className="text-xs text-gray-500 mt-1">days required</p>
          </div>

          <div className="bg-gray-100 rounded-xl p-6">
            <p className="text-lg font-semibold text-gray-900">
              Hours Completed
            </p>
            <p className="text-3xl font-bold text-blue-600">{completedHours}</p>
            <p className="text-xs text-gray-500 mt-1">
              out of {trackingData?.totalHours} hrs
            </p>
          </div>

          <div className="bg-gray-100 rounded-xl p-6">
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
