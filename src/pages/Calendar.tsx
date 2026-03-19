import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import ojtTrackingService from "../../backend/services/ojtTrackingService";
import type { OjtTracking } from "../../backend/services/ojtTrackingService";
import Layout from "../components/Layout";
import TrackingCalendar from "../components/TrackingCalendar";
import { useAuth } from "../hooks/useAuth";
import NumberInput from "../components/NumberInput";

const Calendar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [trackingData, setTrackingData] = useState<OjtTracking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDayHours, setSelectedDayHours] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!user || !isAuthenticated) {
      navigate("/");
      return;
    }

    const loadTrackingData = async () => {
      try {
        const response = await ojtTrackingService.getOjtTracking();
        if (response.success && response.tracking) {
          setTrackingData(response.tracking);
        }
      } catch (error) {
        console.error("Failed to load tracking data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrackingData();
  }, [isAuthenticated, navigate, user]);

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
        // If updating to 0, we'd need a delete endpoint - for now just show message
        alert("To remove duty hours, please use the main interface");
        return;
      }

      // Add or update duty hours using the main service
      const response = await ojtTrackingService.addDutyHours({
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

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">OJT Calendar</h2>
      <div className="flex gap-8">
        {/* Calendar */}
        <div className="flex-1">
          <TrackingCalendar
            trackingData={trackingData}
            onSelectDate={handleSelectDate}
          />
        </div>

        {/* Right Panel */}
        {selectedDate && (
          <div className="w-72 bg-white rounded-lg shadow-md border border-gray-200 p-6 h-fit">
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
