import { useState, useEffect } from "react";
import { addDutyHours, resetTracking as resetOjtTracking } from "../apis";
import Layout from "../components/Layout";
import StartTrackingForm from "../components/StartTrackingForm";
import TrackingView from "../components/TrackingView";
import SkeletonLoader from "../components/SkeletonLoader";
import { useAuth } from "../hooks/useAuth";
import { useOjtTracking } from "../contexts/OjtTrackingContext";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const {
    trackingData,
    isInitializing,
    loadError,
    ensureTrackingLoaded,
    refreshTracking,
    setTrackingData,
  } = useOjtTracking();

  // Tracking state
  const [todayDutyHours, setTodayDutyHours] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isTracking = Boolean(trackingData);
  const completedHours = trackingData?.completedHours ?? 0;

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    void ensureTrackingLoaded();
  }, [ensureTrackingLoaded, isAuthenticated]);

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
        setTrackingData(null);
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

  return (
    <Layout>
      {isTracking ? (
        <TrackingView
          trackingData={trackingData}
          completedHours={completedHours}
          todayDutyHours={todayDutyHours}
          setTodayDutyHours={setTodayDutyHours}
          isLoading={isLoading}
          onAddTodayDuty={addTodayDuty}
          onResetTracking={resetTracking}
        />
      ) : (
        <StartTrackingForm
          onSuccess={(tracking) => {
            setTrackingData(tracking);
          }}
        />
      )}
    </Layout>
  );
};

export default Home;
