import Layout from "../components/Layout";
import StartTrackingForm from "../components/StartTrackingForm";
import TrackingView from "../components/TrackingView";
import DutyLogsTable from "../components/DutyLogsTable";
import { useGuestTracking } from "../hooks/useGuestTracking";

const Demo = () => {
  const {
    isGuestTracking,
    guestTrackingData,
    completedHours,
    todayDutyHours,
    isLoading,
    setTodayDutyHours,
    startGuestTracking,
    addTodayDuty,
    resetTracking,
    getProgressPercentage,
    getRemainingHours,
    handleEditGuestDutyLog,
    handleDeleteGuestDutyLog,
  } = useGuestTracking();

  return (
    <Layout>
      {!isGuestTracking ? (
        <StartTrackingForm guestMode onSuccess={startGuestTracking} />
      ) : (
        <>
          <TrackingView
            trackingData={guestTrackingData}
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
            trackingData={guestTrackingData}
            onEditDutyLog={handleEditGuestDutyLog}
            onDeleteDutyLog={handleDeleteGuestDutyLog}
          />
        </>
      )}
    </Layout>
  );
};

export default Demo;
