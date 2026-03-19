import type { OjtTracking } from "../../backend/services/ojtTrackingService";
import { format } from "date-fns";
import { useState } from "react";

interface DutyLogsTableProps {
  trackingData: OjtTracking | null;
  onEditDutyLog?: (dutyLogId: number, hoursWorked: number) => Promise<void>;
  onDeleteDutyLog?: (dutyLogId: number) => Promise<void>;
}

const DutyLogsTable = ({
  trackingData,
  onEditDutyLog,
  onDeleteDutyLog,
}: DutyLogsTableProps) => {
  const [editingLogId, setEditingLogId] = useState<number | null>(null);
  const [editingHours, setEditingHours] = useState("");
  const [isActingOnLogId, setIsActingOnLogId] = useState<number | null>(null);

  const formatLogDate = (value: string | Date) => {
    return format(new Date(value), "MMM dd, yyyy");
  };

  const handleEditClick = (logId: number, hoursWorked: number) => {
    setEditingLogId(logId);
    setEditingHours(hoursWorked.toString());
  };

  const handleSaveEdit = async (logId: number) => {
    if (!onEditDutyLog) return;

    const parsedHours = parseFloat(editingHours);
    if (isNaN(parsedHours) || parsedHours <= 0) {
      alert("Please enter valid hours.");
      return;
    }

    setIsActingOnLogId(logId);
    try {
      await onEditDutyLog(logId, parsedHours);
      setEditingLogId(null);
      setEditingHours("");
    } finally {
      setIsActingOnLogId(null);
    }
  };

  const handleDelete = async (logId: number) => {
    if (!onDeleteDutyLog) return;
    if (!confirm("Delete this duty log?")) return;

    setIsActingOnLogId(logId);
    try {
      await onDeleteDutyLog(logId);
    } finally {
      setIsActingOnLogId(null);
    }
  };

  return (
    <div className="mt-6 bg-white border border-gray-200 rounded-xl shadow-sm p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">Duty Logs</h3>
        <span className="text-sm text-gray-500">
          {trackingData?.dutyLogs?.length || 0} entries
        </span>
      </div>

      {trackingData?.dutyLogs && trackingData.dutyLogs.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-sm text-gray-500 border-b bg-gray-50">
                <th className="py-3 pr-4 font-medium">Date</th>
                <th className="py-3 pr-4 font-medium">Hours Worked</th>
                <th className="py-3 pr-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {trackingData.dutyLogs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b last:border-b-0 text-sm text-gray-700"
                >
                  <td className="py-3 pr-4">{formatLogDate(log.date)}</td>
                  <td className="py-3 pr-4 font-semibold text-indigo-600">
                    {editingLogId === log.id ? (
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={editingHours}
                        onChange={(e) => setEditingHours(e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded-md"
                      />
                    ) : (
                      log.hoursWorked
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex justify-end gap-2">
                      {editingLogId === log.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(log.id)}
                            disabled={isActingOnLogId === log.id}
                            className="px-3 py-1 text-xs font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingLogId(null);
                              setEditingHours("");
                            }}
                            disabled={isActingOnLogId === log.id}
                            className="px-3 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditClick(log.id, log.hoursWorked)}
                            className="px-3 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(log.id)}
                            disabled={isActingOnLogId === log.id}
                            className="px-3 py-1 text-xs font-medium rounded-md bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
          No duty logs yet. Add today&#39;s hours to start tracking.
        </div>
      )}
    </div>
  );
};

export default DutyLogsTable;
