import { useEffect, useState } from "react";
import { format } from "date-fns";
import { addDutyHours } from "../apis";
import Layout from "../components/Layout";
import TrackingCalendar from "../components/TrackingCalendar";
import NumberInput from "../components/NumberInput";
import SkeletonLoader from "../components/SkeletonLoader";
import { useOjtTracking } from "../contexts/OjtTrackingContext";

const Calendar = () => {
  const {
    trackingData,
    isInitializing,
    loadError,
    ensureTrackingLoaded,
    refreshTracking,
    setTrackingData,
  } = useOjtTracking();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDayHours, setSelectedDayHours] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    void ensureTrackingLoaded();
  }, [ensureTrackingLoaded]);

  if (isInitializing) {
    return (
      <Layout>
        <SkeletonLoader />
      </Layout>
    );
  }

  if (loadError) {
    return (
      <Layout>
        <div className="py-16 text-center space-y-4">
          <p className="text-red-600">{loadError}</p>
          <button
            type="button"
            onClick={refreshTracking}
            className="px-5 py-2.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);

    // Sum existing duty hours for this date
    const hoursForDate = (trackingData?.dutyLogs ?? []).reduce((total, log) => {
      const logDate = new Date(log.date);
      const isSameDate =
        logDate.getFullYear() === date.getFullYear() &&
        logDate.getMonth() === date.getMonth() &&
        logDate.getDate() === date.getDate();

      return isSameDate ? total + log.hoursWorked : total;
    }, 0);

    setSelectedDayHours(hoursForDate > 0 ? hoursForDate.toString() : "");
  };

  const handleUpdateDuty = async () => {
    if (!selectedDate || !trackingData) return;

    const hours = parseFloat(selectedDayHours);
    if (isNaN(hours) || hours < 0) {
      alert("Please enter a valid number of hours");
      return;
    }

    try {
      setIsUpdating(true);

      if (hours === 0) {
        alert("To remove duty hours, please use the main interface");
        return;
      }

      const response = await addDutyHours({
        hoursWorked: hours,
        date: format(selectedDate, "yyyy-MM-dd"),
      });

      if (response.success && response.tracking) {
        setTrackingData(response.tracking);
        alert("Duty hours updated successfully");
      } else {
        alert(response.message || "Failed to update duty hours");
      }
    } catch (error) {
      console.error("Failed to update duty hours:", error);
      alert("An error occurred while updating duty hours");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Layout>
      <div className="flex gap-8">
        {/* Calendar */}
        <div className="border max-w-md w-full rounded-md overflow-hidden shadow-sm">
          <TrackingCalendar
            trackingData={trackingData}
            onSelectDate={handleSelectDate}
          />
        </div>

        {/* Right Panel */}
        {selectedDate && (
          <div className="max-w-lg bg-white rounded-lg shadow-md border border-gray-200 p-6 h-fit">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {format(selectedDate, "MMMM dd, yyyy")}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duty Hours
                </label>
                <NumberInput
                  value={selectedDayHours}
                  onChange={setSelectedDayHours}
                  placeholder="Enter hours"
                  min={0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm hover:border-indigo-400 bg-white"
                />
              </div>

              <button
                onClick={handleUpdateDuty}
                disabled={isUpdating}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Calendar;
