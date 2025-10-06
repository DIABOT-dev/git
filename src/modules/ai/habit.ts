export type HabitLog = { date: string; action: string; done: boolean };

export function checkDailyHabits(logs: HabitLog[]) {
  const today = new Date().toISOString().slice(0, 10);
  return logs.filter(l => l.date === today && l.done).map(l => l.action);
}

export function rewardCoins(actions: string[]): number {
  return actions.length * 5; // mỗi hành động được 5 coin
}
