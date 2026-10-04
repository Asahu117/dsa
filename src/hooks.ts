import { useMemo } from 'react';
import { QUESTIONS } from './data/questions';
import { blank, useStore } from './store/useStore';
import type { QView } from './types';
export const useQuestions = (): QView[] => { const p = useStore((s) => s.progress); return useMemo(() => QUESTIONS.map((q) => ({ ...q, ...blank(), ...p[q.id] })), [p]); };
