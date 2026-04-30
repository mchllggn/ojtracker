import { useEffect, useState } from "react";
import {
  getOjtTracking,
  updateDutyLog,
  deleteDutyLog,
  type OjtTracking,
} from "../apis";
import Layout from "../components/Layout";
import DutyLogsTable from "../components/DutyLogsTable";

const DutyLogs = () => {
  const [trackingData, setTrackingData] = useState<OjtTracking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadTrackingData = async () => {
    try {
      setLoadError("");
      const response = await getOjtTracking();
      if (response.success) {
        setTrackingData(response.tracking ?? null);
      }
    } catch (error) {
      console.error("Failed to load duty logs:", error);
      setLoadError("Failed to load your duty logs. Please try again.");
      setTrackingData(null);
    } finally {
      setIsLoading(false);
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    loadTrackingData();
  }, []);

  const handleEditDutyLog = async (dutyLogId: number, hoursWorked: number) => {
    try {
      setIsLoading(true);
      const response = await updateDutyLog(dutyLogId, {
        hoursWorked,
      });

      if (response.success && response.tracking) {
        setTrackingData(response.tracking);
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
      const response = await deleteDutyLog(dutyLogId);

      if (response.success && response.tracking) {
        setTrackingData(response.tracking);
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

  if (isInitializing) {
    return (
      <Layout>
        <div className="py-16 text-center text-gray-600">
          Loading duty logs...
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

  return (
    <Layout>
      <div className="py-8">
        <DutyLogsTable
          trackingData={trackingData}
          onEditDutyLog={handleEditDutyLog}
          onDeleteDutyLog={handleDeleteDutyLog}
        />
        {isLoading && (
          <p className="mt-3 text-sm text-gray-500">Saving changes...</p>
        )}
      </div>
    </Layout>
  );
};

export default DutyLogs;
