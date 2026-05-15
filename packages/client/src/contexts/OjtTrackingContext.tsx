import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { authStorage, getOjtTracking, type OjtTracking } from "../apis";
import { AUTH_CHANGE_EVENT } from "../apis/authEvents";

type OjtTrackingContextValue = {
  trackingData: OjtTracking | null;
  isInitializing: boolean;
  loadError: string;
  ensureTrackingLoaded: () => Promise<void>;
  refreshTracking: () => Promise<void>;
  setTrackingData: (tracking: OjtTracking | null) => void;
  clearTrackingState: () => void;
};

const OjtTrackingContext = createContext<OjtTrackingContextValue | undefined>(
  undefined,
);

export const OjtTrackingProvider = ({ children }: PropsWithChildren) => {
  const [trackingData, setTrackingDataState] = useState<OjtTracking | null>(
    null,
  );
  const [isInitializing, setIsInitializing] = useState(() =>
    authStorage.isAuthenticated(),
  );
  const [loadError, setLoadError] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const inFlightLoadRef = useRef<Promise<void> | null>(null);

  const clearTrackingState = useCallback(() => {
    setTrackingDataState(null);
    setLoadError("");
    setHasLoaded(false);
    setIsInitializing(false);
  }, []);

  const setTrackingData = useCallback((tracking: OjtTracking | null) => {
    setTrackingDataState(tracking);
    setLoadError("");
    setHasLoaded(true);
  }, []);

  const loadTracking = useCallback(
    async (forceRefresh: boolean) => {
      if (!authStorage.isAuthenticated()) {
        clearTrackingState();
        return;
      }

      if (!forceRefresh && hasLoaded) {
        return;
      }

      if (inFlightLoadRef.current) {
        return inFlightLoadRef.current;
      }

      const loadPromise = (async () => {
        setIsInitializing(true);
        setLoadError("");

        try {
          const response = await getOjtTracking();

          if (response.success) {
            setTrackingDataState(response.tracking ?? null);
            setHasLoaded(true);
            return;
          }

          setLoadError(response.message || "Failed to load tracking data");
        } catch (error) {
          console.error("Failed to load tracking data:", error);
          setLoadError("Failed to load tracking data. Please try again.");
        } finally {
          setIsInitializing(false);
          inFlightLoadRef.current = null;
        }
      })();

      inFlightLoadRef.current = loadPromise;
      return loadPromise;
    },
    [clearTrackingState, hasLoaded],
  );

  const ensureTrackingLoaded = useCallback(async () => {
    await loadTracking(false);
  }, [loadTracking]);

  const refreshTracking = useCallback(async () => {
    await loadTracking(true);
  }, [loadTracking]);

  useEffect(() => {
    const handleAuthChange = () => {
      if (!authStorage.isAuthenticated()) {
        clearTrackingState();
      }
    };

    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [clearTrackingState]);

  const value = useMemo(
    () => ({
      trackingData,
      isInitializing,
      loadError,
      ensureTrackingLoaded,
      refreshTracking,
      setTrackingData,
      clearTrackingState,
    }),
    [
      clearTrackingState,
      ensureTrackingLoaded,
      isInitializing,
      loadError,
      refreshTracking,
      setTrackingData,
      trackingData,
    ],
  );

  return (
    <OjtTrackingContext.Provider value={value}>
      {children}
    </OjtTrackingContext.Provider>
  );
};

export const useOjtTracking = (): OjtTrackingContextValue => {
  const context = useContext(OjtTrackingContext);
  if (!context) {
    throw new Error("useOjtTracking must be used within OjtTrackingProvider");
  }

  return context;
};
