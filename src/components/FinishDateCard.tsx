import { format } from "date-fns";
import type { OjtTracking } from "../../backend/services/ojtTrackingService";

interface FinishDateCardProps {
  trackingData: OjtTracking | null;
  completedHours: number;
}

const FinishDateCard = ({
  trackingData,
  completedHours,
}: FinishDateCardProps) => {
  const calculateEndDate = () => {
    if (!trackingData) return "N/A";

    const remainingHours = Math.max(
      trackingData.totalHours - completedHours,
      0,
    );
    if (remainingHours <= 0) {
      return format(new Date(), "MMMM dd, yyyy");
    }

    const dutyHoursPerDay =
      trackingData.dutyHoursPerDay > 0
        ? trackingData.dutyHoursPerDay
        : trackingData.totalDays > 0
          ? trackingData.totalHours / trackingData.totalDays
          : 0;

    if (dutyHoursPerDay <= 0) {
      return format(new Date(), "MMMM dd, yyyy");
    }

    let remainingDutyDays = Math.ceil(remainingHours / dutyHoursPerDay);
    const estimatedDate = new Date();
    estimatedDate.setHours(0, 0, 0, 0);

    const dutyDateKeys = new Set(
      (trackingData.dutyLogs ?? []).map((log) => {
        const logDate = new Date(log.date);
        return `${logDate.getFullYear()}-${logDate.getMonth()}-${logDate.getDate()}`;
      }),
    );

    while (remainingDutyDays > 0) {
      const isWeekend =
        estimatedDate.getDay() === 0 || estimatedDate.getDay() === 6;
      const dateKey = `${estimatedDate.getFullYear()}-${estimatedDate.getMonth()}-${estimatedDate.getDate()}`;
      const hasDutyOnDate = dutyDateKeys.has(dateKey);

      if (!isWeekend || hasDutyOnDate) {
        remainingDutyDays -= 1;
        if (remainingDutyDays === 0) {
          break;
        }
      }

      estimatedDate.setDate(estimatedDate.getDate() + 1);
    }

    return format(estimatedDate, "MMMM dd, yyyy");
  };

  return (
    <div className="p-4 bg-gray-100 rounded-md">
      <p className="text-xs font-medium uppercase text-gray-600">
        Estimated Finish Date:
        <span className="text-blue-600 pl-2">{calculateEndDate()}</span>
      </p>
    </div>
  );
};

export default FinishDateCard;
