import { useState, useEffect } from "react";
import {
  getOjtTracking,
  addDutyHours,
  resetTracking as resetOjtTracking,
  type OjtTracking,
} from "../services/api";
import Layout from "../components/Layout";
import StartTrackingForm from "../components/StartTrackingForm";
import TrackingView from "../components/TrackingView";
import { useAuth } from "../hooks/useAuth";

const Home = () => {
  const { isAuthenticated } = useAuth();

  // Tracking state
  const [isTracking, setIsTracking] = useState(false);
  const [completedHours, setCompletedHours] = useState(0);
  const [todayDutyHours, setTodayDutyHours] = useState("");
  const [trackingData, setTrackingData] = useState<OjtTracking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadTrackingData = async () => {
    try {
      setLoadError("");
      const response = await getOjtTracking();
      if (response.success && response.tracking) {
        setTrackingData(response.tracking);
        setCompletedHours(response.tracking.completedHours || 0);
        setIsTracking(true);
        return;
      }

      setTrackingData(null);
      setCompletedHours(0);
      setIsTracking(false);
    } catch (error) {
      console.error("Failed to load tracking data:", error);
      setLoadError("Failed to load your tracking data. Please try again.");
      setTrackingData(null);
      setCompletedHours(0);
      setIsTracking(false);
    } finally {
      setIsLoading(false);
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    loadTrackingData();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  if (isInitializing) {
    return (
      <Layout>
        <div className="py-16 text-center text-gray-600">
          Loading your tracking data...
        </div>
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
            onClick={loadTrackingData}
            className="px-5 py-2.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  const addTodayDuty = async (hoursOverride?: number) => {
    const hours = hoursOverride ?? parseFloat(todayDutyHours);
    if (isNaN(hours) || hours <= 0) {
      alert("Please enter valid hours");
      return;
    }

    try {
      setIsLoading(true);
      const response = await addDutyHours({
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
      const response = await resetOjtTracking();

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

  const getProgressPercentage = () => {
    if (!trackingData) return 0;
    return Math.min((completedHours / trackingData.totalHours) * 100, 100);
  };

  const getRemainingHours = () => {
    if (!trackingData) return 0;
    return Math.max(trackingData.totalHours - completedHours, 0);
  };

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
      )}
    </Layout>
  );
};

export default Home;
