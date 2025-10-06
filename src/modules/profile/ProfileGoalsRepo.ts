// This file is no longer directly used for saving/getting goals as the logic has been moved to API routes.
// It's kept here for reference or if its methods are used elsewhere.
// Định nghĩa kiểu dữ liệu cho mục tiêu (ví dụ)
export interface UserGoals {
  primaryGoal: string;
  targetWeight: number;
  targetHbA1c: number;
  dailySteps: number;
  waterCups: number;
}

// In-memory mock store
const mockGoalsStore = new Map<string, UserGoals>();
// This class is now deprecated as goal management is handled directly in API routes.
// It's kept for historical context or if other parts of the app still reference it.
export class ProfileGoalsRepo {
  async saveGoals(userId: string, goals: UserGoals): Promise<UserGoals> {
    console.warn("ProfileGoalsRepo.saveGoals is deprecated. Use /api/profile/goals POST instead.");
    return mockGoalsStore.get(userId) || goals; // Fallback to mock or provided goals
  }
  async getGoals(userId: string): Promise<UserGoals | null> {
    console.warn("ProfileGoalsRepo.getGoals is deprecated. Use /api/profile/goals GET instead.");
    return mockGoalsStore.get(userId) || null; // Fallback to mock
  }
}
