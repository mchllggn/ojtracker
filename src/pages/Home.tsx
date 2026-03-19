import { useState, useEffect } from "react";
import ojtTrackingService from "../../backend/services/ojtTrackingService";
import type { OjtTracking } from "../../backend/services/ojtTrackingService";
import Layout from "../components/Layout";
import StartTrackingForm from "../components/StartTrackingForm";
import TrackingView from "../components/TrackingView";
import DutyLogsTable from "../components/DutyLogsTable";
import { useAuth } from "../hooks/useAuth";

const Home = () => {
  const { user, isAuthenticated } = useAuth();

  // Tracking state
  const [isTracking, setIsTracking] = useState(false);
  const [completedHours, setCompletedHours] = useState(0);
  const [todayDutyHours, setTodayDutyHours] = useState("");
  const [trackingData, setTrackingData] = useState<OjtTracking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !isAuthenticated) {
      window.location.href = "/";
      return;
    }

    // Load tracking data from API
    const loadTrackingData = async () => {
      try {
        const response = await ojtTrackingService.getOjtTracking();
        if (response.success && response.tracking) {
          setTrackingData(response.tracking);
          setCompletedHours(response.tracking.completedHours || 0);
          setIsTracking(true);
        }
      } catch (error) {
        console.error("Failed to load tracking data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrackingData();
  }, [isAuthenticated, user]);

  const addTodayDuty = async (hoursOverride?: number) => {
    const hours = hoursOverride ?? parseFloat(todayDutyHours);
    if (isNaN(hours) || hours <= 0) {
      alert("Please enter valid hours");
      return;
    }

    try {
      setIsLoading(true);
      const response = await ojtTrackingService.addDutyHours({
        hoursWorked: hours,
      });

      if (response.success && response.tracking) {
        setTrackingData(response.tracking);
        setCompletedHours(response.tracking.completedHours);
        setTodayDutyHours("");
      } else {
        alert(response.message || "Failed to add duty hours");
      }
    } catch (error) {
      console.error("Failed to add duty hours:", error);
      alert("An error occurred while adding duty hours");
    } finally {
      setIsLoading(false);
    }
  };

  const resetTracking = async () => {
    if (!confirm("Are you sure you want to reset your tracking data?")) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await ojtTrackingService.resetTracking();

      if (response.success) {
        setIsTracking(false);
        setTrackingData(null);
        setCompletedHours(0);
      } else {
        alert(response.message || "Failed to reset tracking");
      }
    } catch (error) {
      console.error("Failed to reset tracking:", error);
      alert("An error occurred while resetting tracking");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditDutyLog = async (dutyLogId: number, hoursWorked: number) => {
    try {
      setIsLoading(true);
      const response = await ojtTrackingService.updateDutyLog(dutyLogId, {
        hoursWorked,
      });

      if (response.success && response.tracking) {
        setTrackingData(response.tracking);
        setCompletedHours(response.tracking.completedHours);
      } else {
        alert(response.message || "Failed to update duty log");
      }
    } catch (error) {
      console.error("Failed to update duty log:", error);
      alert("An error occurred while updating duty log");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDutyLog = async (dutyLogId: number) => {
    try {
      setIsLoading(true);
      const response = await ojtTrackingService.deleteDutyLog(dutyLogId);

      if (response.success && response.tracking) {
        setTrackingData(response.tracking);
        setCompletedHours(response.tracking.completedHours);
      } else {
        alert(response.message || "Failed to delete duty log");
      }
    } catch (error) {
      console.error("Failed to delete duty log:", error);
      alert("An error occurred while deleting duty log");
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressPercentage = () => {
    if (!trackingData) return 0;
    return Math.min((completedHours / trackingData.totalHours) * 100, 100);
  };

  const getRemainingHours = () => {
    if (!trackingData) return 0;
    return Math.max(trackingData.totalHours - completedHours, 0);
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
      {!isTracking ? (
        <StartTrackingForm
          onSuccess={(tracking) => {
            setTrackingData(tracking);
            setIsTracking(true);
            setCompletedHours(0);
          }}
        />
      ) : (
        <>
          <TrackingView
            trackingData={trackingData}
            completedHours={completedHours}
            todayDutyHours={todayDutyHours}
            setTodayDutyHours={setTodayDutyHours}
            isLoading={isLoading}
            onAddTodayDuty={addTodayDuty}
            onResetTracking={resetTracking}
            getProgressPercentage={getProgressPercentage}
            getRemainingHours={getRemainingHours}
          />
          <DutyLogsTable
            trackingData={trackingData}
            onEditDutyLog={handleEditDutyLog}
            onDeleteDutyLog={handleDeleteDutyLog}
          />
        </>
      )}
    </Layout>
  );
};

export default Home;
