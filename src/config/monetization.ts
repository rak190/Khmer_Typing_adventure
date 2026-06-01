function readBooleanEnv(value: string | undefined, fallback: boolean) {
  if (value === undefined || value.trim() === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

export type AdTreatmentConfig = {
  personalizedAdsEnabled: boolean;
  childDirectedTreatment: boolean;
};

// AdSense child/teen treatment, privacy controls, and school-use expectations
// must be configured correctly before enabling any production ad code.
// Never ask learners to click ads, never use rewarded ad clicks, and keep
// personalized ads disabled by default for an education app used by students.
export const monetizationConfig = {
  ADS_ENABLED: readBooleanEnv(import.meta.env.VITE_ADS_ENABLED, false),
  PERSONALIZED_ADS_ENABLED: readBooleanEnv(import.meta.env.VITE_PERSONALIZED_ADS_ENABLED, false),
  CHILD_DIRECTED_TREATMENT: readBooleanEnv(import.meta.env.VITE_CHILD_DIRECTED_TREATMENT, true),
} as const;

export function getAdTreatmentConfig(): AdTreatmentConfig {
  return {
    personalizedAdsEnabled: monetizationConfig.PERSONALIZED_ADS_ENABLED,
    childDirectedTreatment: monetizationConfig.CHILD_DIRECTED_TREATMENT,
  };
}

export function canRenderAds() {
  return monetizationConfig.ADS_ENABLED;
}
