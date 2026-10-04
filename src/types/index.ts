export type Status = 'not-started' | 'in-progress' | 'completed' | 'skipped';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type SolveType = 'independent' | 'hint' | 'solution';
export interface DSAQuestion {
  id: string; title: string; topic: string; subtopic: string; difficulty: Difficulty;
  platforms: { leetcode?: string; gfg?: string; codingNinjas?: string }; sources: string[]; order: number;
}
export interface Progress {
  status: Status; notes?: string; completedAt?: string; completedOn?: string;
  revisionCount: number; isFavorite: boolean; solveType?: SolveType; attempted?: boolean;
}
export type QView = DSAQuestion & Progress;
export interface Settings {
  theme: 'light' | 'dark' | 'system'; streakEnabled: boolean; streakRequiresCompletion: boolean;
  autoUnlock: boolean; unlockPercent: number; intervals: number[]; revisionSize: number; defaultDifficulty: 'Any' | Difficulty;
}
export interface Activity { completed: string[]; attempted: string[]; skipped: string[] }
export interface Persisted {
  progress: Record<string, Progress>; settings: Settings; plan: { paused: boolean; pausedAt?: string; defaultTarget: number };
  dailyTargets: Record<string, number>; targetLog: Record<string, number>; queues: Record<string, string[]>;
  activity: Record<string, Activity>; pausedDates: Record<string, boolean>; sections: Record<string, { startedOn: string; done: number[] }>; onboarded: boolean; updatedAt?: string;
}
