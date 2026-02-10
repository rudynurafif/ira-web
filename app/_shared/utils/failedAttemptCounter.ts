/**
 * Failed Attempt Counter Utility
 * Centralized counter for tracking activation failures across components
 */

const FAILED_ATTEMPT_KEY = "activation_failed_attempts";
const LAST_FAILED_KEY = "activation_last_failed";
const MAX_ATTEMPTS = 3;
const COOLDOWN_DURATION = 120; // seconds

interface FailedAttemptData {
  count: number;
  lastFailedAt: number | null;
  cooldownEndAt: number | null;
  serialNumbers: string[];
}

// Initialize default data
const getDefaultData = (): FailedAttemptData => ({
  count: 0,
  lastFailedAt: null,
  cooldownEndAt: null,
  serialNumbers: [],
});

// Get current failed attempt data
export const getFailedAttemptData = (): FailedAttemptData => {
  try {
    const saved = localStorage.getItem(FAILED_ATTEMPT_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate structure
      return {
        count: parsed.count || 0,
        lastFailedAt: parsed.lastFailedAt || null,
        cooldownEndAt: parsed.cooldownEndAt || null,
        serialNumbers: Array.isArray(parsed.serialNumbers)
          ? parsed.serialNumbers
          : [],
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
): FailedAttemptData => {
  const data = getFailedAttemptData();

  // Increment counter
  data.count += 1;
  data.lastFailedAt = Date.now();

  // Set cooldown end time
  data.cooldownEndAt = Date.now() + COOLDOWN_DURATION * 1000;

  // Track serial number if provided
  if (serialNumber && !data.serialNumbers.includes(serialNumber)) {
    data.serialNumbers.push(serialNumber);
    // Keep only last 5 serial numbers
    if (data.serialNumbers.length > 5) {
      data.serialNumbers.shift();
    }
  }

  saveFailedAttemptData(data);
  return data;
};

// Reset failed attempt counter
export const resetFailedAttempt = (): void => {
  saveFailedAttemptData(getDefaultData());
};

// Check if cooldown is active
export const isCooldownActive = (): boolean => {
  const data = getFailedAttemptData();
  if (!data.cooldownEndAt) return false;

  return Date.now() < data.cooldownEndAt;
};

// Get remaining cooldown time in seconds
export const getRemainingCooldown = (): number => {
  const data = getFailedAttemptData();
  if (!data.cooldownEndAt) return 0;

  const remaining = Math.ceil((data.cooldownEndAt - Date.now()) / 1000);
  return Math.max(0, remaining);
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

// Get time since last failure in seconds
export const getTimeSinceLastFailure = (): number | null => {
  const data = getFailedAttemptData();
  if (!data.lastFailedAt) return null;

  return Math.floor((Date.now() - data.lastFailedAt) / 1000);
};

// Export constants
export const FAILED_ATTEMPT_CONFIG = {
  MAX_ATTEMPTS,
  COOLDOWN_DURATION,
  FAILED_ATTEMPT_KEY,
};

// Helper: Format time for display
export const formatCooldownTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
};
