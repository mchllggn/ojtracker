import { useEffect } from "react";
import { updateDutyLog, deleteDutyLog } from "../apis";
import Layout from "../components/Layout";
import DutyLogsTable from "../components/DutyLogsTable";
import SkeletonLoader from "../components/SkeletonLoader";
import { useOjtTracking } from "../contexts/OjtTrackingContext";

const DutyLogs = () => {
  const {
    trackingData,
    isInitializing,
    loadError,
    ensureTrackingLoaded,
    refreshTracking,
    setTrackingData,
  } = useOjtTracking();

  useEffect(() => {
    void ensureTrackingLoaded();
  }, [ensureTrackingLoaded]);

  const handleEditDutyLog = async (dutyLogId: number, hoursWorked: number) => {
    try {
      const response = await updateDutyLog(dutyLogId, {
        hoursWorked,
      });

      if (response.success && response.tracking) {
        setTrackingData(response.tracking);
        alert(response.message);
      } else {
        alert(response.message || "Failed to update duty log");
      }
    } catch (error) {
      console.error("Failed to update duty log:", error);
      alert("An error occurred while updating duty log");
    }
  };

  const handleDeleteDutyLog = async (dutyLogId: number) => {
    try {
      const response = await deleteDutyLog(dutyLogId);

      if (response.success && response.tracking) {
        setTrackingData(response.tracking);
      } else {
        alert(response.message || "Failed to delete duty log");
      }
    } catch (error) {
      console.error("Failed to delete duty log:", error);
      alert("An error occurred while deleting duty log");
    }
  };

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

  return (
    <Layout>
      <DutyLogsTable
        trackingData={trackingData}
        onEditDutyLog={handleEditDutyLog}
        onDeleteDutyLog={handleDeleteDutyLog}
      />
    </Layout>
  );
};

export default DutyLogs;
