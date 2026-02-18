/**
 * Failed Attempt Counter Utility
 * Centralized counter for tracking activation failures across components
 */

const FAILED_ATTEMPT_KEY = "activation_failed_attempts";
const MAX_ATTEMPTS = 3;

interface AttemptLog {
  sn: string;
  message: string;
}

interface FailedAttemptData {
  count: number;
  lastFailedAt: number | null;
  serialNumbers: string[];
  attempts: AttemptLog[];
}

// Initialize default data
const getDefaultData = (): FailedAttemptData => ({
  count: 0,
  lastFailedAt: null,
  serialNumbers: [],
  attempts: [],
});

// Get current failed attempt data
export const getFailedAttemptData = (): FailedAttemptData => {
  try {
    const saved = localStorage.getItem(FAILED_ATTEMPT_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        count: parsed.count || 0,
        lastFailedAt: parsed.lastFailedAt || null,
        serialNumbers: Array.isArray(parsed.serialNumbers)
          ? parsed.serialNumbers
          : [],
        attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
      };
    }
  } catch (error) {
    console.error("Failed to parse failed attempt data:", error);
  }
  return getDefaultData();
};

// Save failed attempt data
export const saveFailedAttemptData = (data: FailedAttemptData): void => {
  try {
    localStorage.setItem(FAILED_ATTEMPT_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save failed attempt data:", error);
  }
};

// Increment failed attempt counter
export const incrementFailedAttempt = (
  serialNumber?: string,
  errorMessage?: string, // Baru: Menerima pesan error
): FailedAttemptData => {
  const data = getFailedAttemptData();

  // Increment counter
  data.count += 1;
  data.lastFailedAt = Date.now();

  // Track serial number if provided
  if (serialNumber && !data.serialNumbers.includes(serialNumber)) {
    data.serialNumbers.push(serialNumber);
    // Keep only last 5 serial numbers
    if (data.serialNumbers.length > 5) {
      data.serialNumbers.shift();
    }
  }

  // Track error message if provided
  if (serialNumber && errorMessage) {
    data.attempts.push({
      sn: serialNumber,
      message: errorMessage,
    });

    // Batasi riwayat hanya 5 percobaan terakhir agar tidak terlalu panjang
    if (data.attempts.length > 5) {
      data.attempts.shift();
    }
  }

  saveFailedAttemptData(data);
  return data;
};

// Reset failed attempt counter
export const resetFailedAttempt = (): void => {
  saveFailedAttemptData(getDefaultData());
};

// Check if max attempts reached
export const hasReachedMaxAttempts = (): boolean => {
  const data = getFailedAttemptData();
  return data.count >= MAX_ATTEMPTS;
};

// Get current attempt count
export const getCurrentAttemptCount = (): number => {
  const data = getFailedAttemptData();
  return data.count;
};

// Get serial numbers that have failed
export const getFailedSerialNumbers = (): string[] => {
  const data = getFailedAttemptData();
  return data.serialNumbers;
};

// Clear specific serial number from failed list
export const removeFailedSerialNumber = (serialNumber: string): void => {
  const data = getFailedAttemptData();
  data.serialNumbers = data.serialNumbers.filter((sn) => sn !== serialNumber);
  saveFailedAttemptData(data);
};

// Export constants
export const FAILED_ATTEMPT_CONFIG = {
  MAX_ATTEMPTS,
  FAILED_ATTEMPT_KEY,
};
