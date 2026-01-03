// Garmin 健康數據型別

export interface GarminStats {
  date: string;
  steps: number;
  totalSteps: number;
  stepGoal: number;
  floorsAscended: number;
  floorsDescended: number;
  activeKilocalories: number;
  totalKilocalories: number;
  restingHeartRate: number;
  minHeartRate: number;
  maxHeartRate: number;
  averageStressLevel: number;
  maxStressLevel: number;
  stressDuration: number;
  restStressDuration: number;
  bodyBatteryChargedValue: number;
  bodyBatteryDrainedValue: number;
  bodyBatteryHighestValue: number;
  bodyBatteryLowestValue: number;
}

export interface GarminSleep {
  date: string;
  sleepTimeSeconds: number;
  sleepStartTimestampGMT: number;
  sleepEndTimestampGMT: number;
  deepSleepSeconds: number;
  lightSleepSeconds: number;
  remSleepSeconds: number;
  awakeSleepSeconds: number;
  averageSpO2Value: number;
  lowestSpO2Value: number;
  averageRespirationValue: number;
  sleepScores: {
    overall: number;
    quality: number;
    recovery: number;
    restfulness: number;
  };
}

export interface GarminActivity {
  activityId: number;
  activityName: string;
  startTimeLocal: string;
  activityType: string;
  distance: number;
  duration: number;
  elapsedDuration: number;
  movingDuration: number;
  averageSpeed: number;
  maxSpeed: number;
  calories: number;
  averageHR: number;
  maxHR: number;
  steps: number;
}

export interface GarminHeartRate {
  date: string;
  restingHeartRate: number;
  minHeartRate: number;
  maxHeartRate: number;
  heartRateValues: Array<{
    timestamp: number;
    heartRate: number;
  }>;
}

export interface GarminSyncResult {
  success: boolean;
  stats?: GarminStats;
  sleep?: GarminSleep;
  error?: string;
}

export interface GarminHealthSummary {
  date: string;
  steps: {
    current: number;
    goal: number;
    percentage: number;
  };
  sleep: {
    totalHours: number;
    quality: string;
    deepHours: number;
    remHours: number;
  };
  heart: {
    resting: number;
    min: number;
    max: number;
  };
  stress: {
    average: number;
    max: number;
  };
  bodyBattery: {
    highest: number;
    lowest: number;
    charged: number;
    drained: number;
  };
}
