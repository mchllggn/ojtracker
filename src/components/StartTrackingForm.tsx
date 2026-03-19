import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import NumberInput from "./NumberInput";
import ojtTrackingService from "../../backend/services/ojtTrackingService";
import type { OjtTracking } from "../../backend/services/ojtTrackingService";
import PrimaryButton from "./PrimaryButton";

interface StartTrackingFormProps {
  onSuccess: (trackingData: OjtTracking) => void;
  guestMode?: boolean;
}

const StartTrackingForm = ({
  onSuccess,
  guestMode = false,
}: StartTrackingFormProps) => {
  const TOTAL_STEPS = 4;
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formError, setFormError] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [totalHours, setTotalHours] = useState("");
  const [dutyHours, setDutyHours] = useState("");
  const [submissionHoursInput, setSubmissionHoursInput] = useState("");

  const total = parseFloat(totalHours);
  const duty = parseFloat(dutyHours);
  const submission = parseFloat(submissionHoursInput) || 0;

  const validateStep = (step: number) => {
    if (step === 1 && !startDate) {
      return "Please select your OJT start date.";
    }

    if (step === 2 && (Number.isNaN(total) || total <= 0)) {
      return "Please enter a valid total required hours.";
    }

    if (step === 3 && (Number.isNaN(duty) || duty <= 0)) {
      return "Please enter valid duty hours per day.";
    }

    if (step === 4 && submission < 0) {
      return "Submission hours cannot be negative.";
    }

    return "";
  };

  const handleNextStep = () => {
    const validationMessage = validateStep(currentStep);
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    setFormError("");
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handlePreviousStep = () => {
    setFormError("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationMessage =
      validateStep(1) || validateStep(2) || validateStep(3) || validateStep(4);
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    if (!startDate) return;

    const days = Math.ceil(total / duty);

    if (guestMode) {
      const now = new Date();
      onSuccess({
        id: 0,
        userId: 0,
        startDate,
        totalHours: total,
        dutyHoursPerDay: duty,
        submissionHours: submission,
        totalDays: days,
        completedHours: 0,
        createdAt: now,
        updatedAt: now,
        dutyLogs: [],
      });
      return;
    }

    try {
      setFormError("");
      setIsLoading(true);
      const response = await ojtTrackingService.startTracking({
        startDate: startDate.toISOString(),
        totalHours: total,
        dutyHoursPerDay: duty,
        submissionHours: submission,
        totalDays: days,
      });

      if (response.success && response.tracking) {
        onSuccess(response.tracking);
      } else {
        setFormError(response.message || "Failed to start tracking");
      }
    } catch (error) {
      console.error("Failed to start tracking:", error);
      setFormError("An error occurred while starting tracking");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Start Tracking Your OJT
      </h2>
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: TOTAL_STEPS }, (_, index) => {
          const step = index + 1;
          const isActive = currentStep === step;
          const isCompleted = currentStep > step;

          return (
            <div
              key={step}
              className={`h-2 rounded-full transition-colors ${
                isCompleted || isActive ? "bg-indigo-500" : "bg-gray-200"
              }`}
            />
          );
        })}
      </div>

      {formError && (
        <p className="text-sm text-red-600" role="alert">
          {formError}
        </p>
      )}

      {currentStep === 1 && (
        <div className="space-y-3">
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700"
          >
            Step 1 of 4 · OJT Start Date
          </label>
          <div className="flex justify-center rounded-lg max-w-xs mx-auto border border-gray-300 bg-white p-3 shadow-sm">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              className="w-full"
            />
          </div>
          <p className="text-sm text-gray-600">
            {startDate
              ? `Selected: ${format(startDate, "PP")}`
              : "Select your OJT starting day."}
          </p>
        </div>
      )}

      {currentStep === 2 && (
        <div>
          <label
            htmlFor="totalHours"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Step 2 of 4 · Hours needed to complete
          </label>
          <NumberInput
            id="totalHours"
            value={totalHours}
            onChange={(value) => {
              setTotalHours(value);
              setFormError("");
            }}
            placeholder="e.g., 500"
            min={0}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm hover:border-indigo-400 bg-white"
          />
        </div>
      )}

      {currentStep === 3 && (
        <div>
          <label
            htmlFor="dutyHours"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Step 3 of 4 · Hours of Duty (Per Day)
          </label>
          <NumberInput
            id="dutyHours"
            value={dutyHours}
            onChange={(value) => {
              setDutyHours(value);
              setFormError("");
            }}
            placeholder="e.g., 8"
            min={0}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm hover:border-indigo-400 bg-white"
          />
        </div>
      )}

      {currentStep === 4 && (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="submissionHours"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Step 4 of 4 · Hours for Report Submission
            </label>
            <NumberInput
              id="submissionHours"
              value={submissionHoursInput}
              onChange={(value) => {
                setSubmissionHoursInput(value);
                setFormError("");
              }}
              placeholder="e.g., 40"
              min={0}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm hover:border-indigo-400 bg-white"
            />
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {currentStep > 1 && (
          <PrimaryButton
            type="button"
            onClick={handlePreviousStep}
            className="w-full py-3 text-lg bg-gray-800 hover:bg-gray-900 transition-all"
            disabled={isLoading}
          >
            Back
          </PrimaryButton>
        )}

        {currentStep < TOTAL_STEPS ? (
          <PrimaryButton
            type="button"
            onClick={handleNextStep}
            className="w-full py-3 text-lg"
            disabled={isLoading}
          >
            Next
          </PrimaryButton>
        ) : (
          <PrimaryButton
            type="submit"
            className="w-full py-3 text-lg"
            disabled={isLoading}
          >
            {isLoading ? "Starting..." : "Start Tracking"}
          </PrimaryButton>
        )}
      </div>
    </form>
  );
};

export default StartTrackingForm;
