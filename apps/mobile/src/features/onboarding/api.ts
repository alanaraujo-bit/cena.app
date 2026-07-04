import type {
  OnboardingStatus,
  OnboardingStepInput,
  UpdateGenresInput,
  UpdateLevelInput,
} from '@cena/shared';
import { api } from '@/lib/api';

export const onboardingApi = {
  status: () => api.get<OnboardingStatus>('/onboarding/status'),
  setLevel: (input: UpdateLevelInput) => api.patch<OnboardingStatus>('/onboarding/level', input),
  setGenres: (input: UpdateGenresInput) =>
    api.patch<OnboardingStatus>('/onboarding/genres', input),
  setStep: (input: OnboardingStepInput) => api.patch<OnboardingStatus>('/onboarding/step', input),
  complete: () => api.post<OnboardingStatus>('/onboarding/complete'),
};
