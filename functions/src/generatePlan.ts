import { HttpsError, onCall } from 'firebase-functions/v2/https';

type Experience = 'beginner' | 'intermediate' | 'advanced';
type Goal = 'hypertrophy' | 'strength' | 'fat_loss';
type Equipment = 'gym' | 'home' | 'minimal';

type UserProfile = {
  experience: Experience;
  goal: Goal;
  equipment: Equipment;
};

type PlanExercise = {
  name: string;
  sets: number;
  targetReps: string;
  targetWeight: string;
};

type PlanDay = {
  dayName: string;
  exercises: PlanExercise[];
};

type TrainingPlan = {
  name: string;
  splitType: string;
  days: PlanDay[];
};

const EXPERIENCES: Experience[] = ['beginner', 'intermediate', 'advanced'];
const GOALS: Goal[] = ['hypertrophy', 'strength', 'fat_loss'];
const EQUIPMENT: Equipment[] = ['gym', 'home', 'minimal'];

function assertEnum<T extends string>(
  value: unknown,
  options: readonly T[],
  field: string,
): T {
  if (typeof value !== 'string' || !options.includes(value as T)) {
    throw new HttpsError('invalid-argument', `Invalid ${field}`);
  }
  return value as T;
}

function parseProfile(data: unknown): UserProfile {
  if (typeof data !== 'object' || data === null) {
    throw new HttpsError('invalid-argument', 'Payload must be an object');
  }

  const payload = data as Record<string, unknown>;
  return {
    experience: assertEnum(payload.experience, EXPERIENCES, 'experience'),
    goal: assertEnum(payload.goal, GOALS, 'goal'),
    equipment: assertEnum(payload.equipment, EQUIPMENT, 'equipment'),
  };
}

function buildMockPlan(profile: UserProfile): TrainingPlan {
  const splitType = profile.goal === 'strength' ? 'upper-lower' : 'push-pull-legs';
  const baseWeight = profile.experience === 'beginner' ? 'light' : 'moderate';
  const reps = profile.goal === 'strength' ? '4-6' : profile.goal === 'fat_loss' ? '12-15' : '8-12';

  const accessory = profile.equipment === 'minimal' ? 'Bodyweight Row' : 'Cable Row';

  return {
    name: 'Week 1 Foundation',
    splitType,
    days: [
      {
        dayName: 'Day 1',
        exercises: [
          { name: 'Squat', sets: 4, targetReps: reps, targetWeight: baseWeight },
          { name: accessory, sets: 3, targetReps: reps, targetWeight: baseWeight },
        ],
      },
      {
        dayName: 'Day 2',
        exercises: [
          { name: 'Bench Press', sets: 4, targetReps: reps, targetWeight: baseWeight },
          { name: 'Romanian Deadlift', sets: 3, targetReps: reps, targetWeight: baseWeight },
        ],
      },
      {
        dayName: 'Day 3',
        exercises: [
          { name: 'Overhead Press', sets: 3, targetReps: reps, targetWeight: baseWeight },
          { name: 'Walking Lunge', sets: 3, targetReps: reps, targetWeight: baseWeight },
        ],
      },
    ],
  };
}

function validatePlan(plan: TrainingPlan): TrainingPlan {
  if (!plan.name || !plan.splitType || !Array.isArray(plan.days) || plan.days.length == 0) {
    throw new HttpsError('internal', 'Invalid generated plan structure');
  }

  for (const day of plan.days) {
    if (!day.dayName || !Array.isArray(day.exercises) || day.exercises.length == 0) {
      throw new HttpsError('internal', 'Invalid generated day structure');
    }
    for (const exercise of day.exercises) {
      if (
        !exercise.name ||
        typeof exercise.sets !== 'number' ||
        !exercise.targetReps ||
        !exercise.targetWeight
      ) {
        throw new HttpsError('internal', 'Invalid generated exercise structure');
      }
    }
  }

  return plan;
}

export const generatePlan = onCall({ cors: true }, async (request) => {
  const profile = parseProfile(request.data);
  const mode = process.env.GAINX_PLAN_MODE ?? 'mock';

  if (mode === 'live') {
    throw new HttpsError(
      'unimplemented',
      'Live OpenAI integration is not enabled yet. Set GAINX_PLAN_MODE=mock for emulator testing.',
    );
  }

  return validatePlan(buildMockPlan(profile));
});
