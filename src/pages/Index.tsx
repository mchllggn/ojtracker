import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, BarChart3, Calendar } from "lucide-react";
import { login } from "../../backend/services/loginService";
import { register } from "../../backend/services/registerService";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";
import Layout from "../components/Layout";
import PrimaryButton from "@/components/PrimaryButton";
import StartTrackingForm from "../components/StartTrackingForm";
import TrackingView from "../components/TrackingView";
import DutyLogsTable from "../components/DutyLogsTable";
import type { OjtTracking } from "../../backend/services/ojtTrackingService";
import { useAuth } from "../hooks/useAuth";
import type {
  LoginFieldErrors,
  RegisterFieldErrors,
} from "../../backend/services/authTypes";

const Index = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login: loginUser } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [isGuestTracking, setIsGuestTracking] = useState(false);
  const [guestTrackingData, setGuestTrackingData] =
    useState<OjtTracking | null>(null);
  const [completedHours, setCompletedHours] = useState(0);
  const [todayDutyHours, setTodayDutyHours] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginFieldErrors, setLoginFieldErrors] = useState<LoginFieldErrors>(
    {},
  );
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [registerError, setRegisterError] = useState("");
  const [registerFieldErrors, setRegisterFieldErrors] =
    useState<RegisterFieldErrors>({});

  useEffect(() => {
    if (user && isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate, user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginFieldErrors({});
    const response = await login({
      email: loginData.email,
      password: loginData.password,
    });
    if (response.success) {
      loginUser(response.user!, response.token!);
      navigate("/home");
    } else {
      const fieldErrors = (response.fieldErrors ?? {}) as LoginFieldErrors;
      setLoginFieldErrors(fieldErrors);
      if (!fieldErrors.email && !fieldErrors.password) {
        setLoginError(response.message || "Login failed. Please try again.");
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterFieldErrors({});

    const response = await register({
      name: registerData.name,
      email: registerData.email,
      password: registerData.password,
      confirmPassword: registerData.confirmPassword,
    });

    if (response.success) {
      alert("Registration successful! Please login.");
      setShowRegisterModal(false);
      setShowLoginModal(true);
      setRegisterError("");
      setRegisterFieldErrors({});
      setRegisterData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } else {
      const fieldErrors = (response.fieldErrors ?? {}) as RegisterFieldErrors;
      setRegisterFieldErrors(fieldErrors);
      if (
        !fieldErrors.name &&
        !fieldErrors.email &&
        !fieldErrors.password &&
        !fieldErrors.confirmPassword
      ) {
        setRegisterError(
          response.message || "Registration failed. Please try again.",
        );
      }
    }
  };

  const addTodayDuty = async (hoursOverride?: number) => {
    const hours = hoursOverride ?? parseFloat(todayDutyHours);
    if (isNaN(hours) || hours <= 0) {
      alert("Please enter valid hours");
      return;
    }

    if (!guestTrackingData) return;

    const hasTimedInToday = (guestTrackingData.dutyLogs ?? []).some((log) => {
      const logDate = new Date(log.date);
      const today = new Date();

      return (
        logDate.getFullYear() === today.getFullYear() &&
        logDate.getMonth() === today.getMonth() &&
        logDate.getDate() === today.getDate()
      );
    });

    if (hasTimedInToday) {
      alert("You already timed in today.");
      return;
    }

    setIsLoading(true);
    const roundedHours = Math.round(hours);
    if (roundedHours <= 0) {
      alert("Please enter valid hours");
      setIsLoading(false);
      return;
    }

    const nextDutyLogId =
      (guestTrackingData.dutyLogs?.length
        ? Math.max(...guestTrackingData.dutyLogs.map((log) => log.id))
        : 0) + 1;

    const updatedCompletedHours = Math.min(
      Math.round(completedHours + roundedHours),
      Math.round(guestTrackingData.totalHours),
    );
    setCompletedHours(updatedCompletedHours);
    setGuestTrackingData({
      ...guestTrackingData,
      completedHours: updatedCompletedHours,
      dutyLogs: [
        ...(guestTrackingData.dutyLogs ?? []),
        {
          id: nextDutyLogId,
          date: new Date(),
          hoursWorked: roundedHours,
        },
      ],
      updatedAt: new Date(),
    });
    setTodayDutyHours("");
    setIsLoading(false);
  };

  const resetTracking = async () => {
    if (!confirm("Are you sure you want to reset your tracking data?")) {
      return;
    }

    setIsGuestTracking(false);
    setGuestTrackingData(null);
    setCompletedHours(0);
    setTodayDutyHours("");
  };

  const getProgressPercentage = () => {
    if (!guestTrackingData) return 0;
    return Math.round(
      Math.min((completedHours / guestTrackingData.totalHours) * 100, 100),
    );
  };

  const getRemainingHours = () => {
    if (!guestTrackingData) return 0;
    return Math.round(
      Math.max(guestTrackingData.totalHours - completedHours, 0),
    );
  };

  const handleEditGuestDutyLog = async (
    dutyLogId: number,
    hoursWorked: number,
  ) => {
    if (!guestTrackingData) return;

    const roundedHours = Math.round(hoursWorked);
    if (roundedHours <= 0) {
      alert("Please enter valid hours.");
      return;
    }

    const targetLog = guestTrackingData.dutyLogs?.find(
      (log) => log.id === dutyLogId,
    );
    if (!targetLog) return;

    const delta = roundedHours - targetLog.hoursWorked;
    const nextCompletedHours = Math.min(
      Math.max(0, completedHours + delta),
      Math.round(guestTrackingData.totalHours),
    );

    setCompletedHours(nextCompletedHours);
    setGuestTrackingData({
      ...guestTrackingData,
      completedHours: nextCompletedHours,
      dutyLogs: (guestTrackingData.dutyLogs ?? []).map((log) =>
        log.id === dutyLogId ? { ...log, hoursWorked: roundedHours } : log,
      ),
      updatedAt: new Date(),
    });
  };

  const handleDeleteGuestDutyLog = async (dutyLogId: number) => {
    if (!guestTrackingData) return;

    const targetLog = guestTrackingData.dutyLogs?.find(
      (log) => log.id === dutyLogId,
    );
    if (!targetLog) return;

    const nextCompletedHours = Math.max(
      0,
      completedHours - targetLog.hoursWorked,
    );

    setCompletedHours(nextCompletedHours);
    setGuestTrackingData({
      ...guestTrackingData,
      completedHours: nextCompletedHours,
      dutyLogs: (guestTrackingData.dutyLogs ?? []).filter(
        (log) => log.id !== dutyLogId,
      ),
      updatedAt: new Date(),
    });
  };

  return (
    <Layout onLoginClick={() => setShowLoginModal(true)}>
      {!showHowItWorks ? (
        <>
          <div className="animate-in text-center duration-700 fade-in">
            <h1 className="text-5xl font-bold text-gray-900 mb-2">OJTracker</h1>
            <p className="text-xl text-gray-700 mb-6">
              Track your OJT hours and progress.
            </p>
            <PrimaryButton
              className="px-12 py-4 text-xl hover:cursor-pointer"
              onClick={() => setShowHowItWorks(true)}
            >
              How it works
            </PrimaryButton>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Time Logging
              </h3>
              <p className="text-gray-600">
                Log your daily time in and time out with just a few clicks.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Track Progress
              </h3>
              <p className="text-gray-600">
                Monitor your total hours throughout your training period.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Calculate Duration
              </h3>
              <p className="text-gray-600">
                Calculate how many days you need to complete your OJT.
              </p>
            </div>
          </div>
        </>
      ) : !isGuestTracking ? (
        <StartTrackingForm
          guestMode
          onSuccess={(tracking) => {
            setGuestTrackingData(tracking);
            setCompletedHours(0);
            setIsGuestTracking(true);
          }}
        />
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
      <LoginModal
        showModal={showLoginModal}
        setShowModal={(show) => {
          setShowLoginModal(show);
          if (!show) {
            setLoginError("");
            setLoginFieldErrors({});
          }
        }}
        loginData={loginData}
        setLoginData={(data) => {
          setLoginData(data);
          setLoginError("");
          setLoginFieldErrors({});
        }}
        errorMessage={loginError}
        fieldErrors={loginFieldErrors}
        handleLogin={handleLogin}
        setShowRegisterModal={(show) => {
          setShowRegisterModal(show);
          if (show) {
            setLoginError("");
            setLoginFieldErrors({});
          }
        }}
      />
      <RegisterModal
        showModal={showRegisterModal}
        setShowModal={(show) => {
          setShowRegisterModal(show);
          if (!show) {
            setRegisterError("");
            setRegisterFieldErrors({});
          }
        }}
        registerData={registerData}
        setRegisterData={(data) => {
          setRegisterData(data);
          setRegisterError("");
          setRegisterFieldErrors({});
        }}
        errorMessage={registerError}
        fieldErrors={registerFieldErrors}
        handleRegister={handleRegister}
        setShowLoginModal={(show) => {
          setShowLoginModal(show);
          if (show) {
            setRegisterError("");
            setRegisterFieldErrors({});
          }
        }}
      />
    </Layout>
  );
};

export default Index;
