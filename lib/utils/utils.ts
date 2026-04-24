export const formatAge = (dateOfBirth: string | null): string => {
  if (!dateOfBirth) {
    return "";
  }
  const dob = new Date(dateOfBirth);
  const now = new Date();
  const months =
    (now.getFullYear() - dob.getFullYear()) * 12 +
    (now.getMonth() - dob.getMonth());
  if (months < 12) {
    return `${months} mo`;
  }
  const years = months / 12;
  const rounded = Math.round(years * 2) / 2;
  return rounded === 1 ? "1 yr" : `${rounded} yrs`;
};

export const formatWeight = (weightLbs: number | null): string => {
  if (weightLbs == null) {
    return "";
  }
  return `${weightLbs} lbs`;
};

export type TimePeriod = "morning" | "afternoon" | "evening" | "night";

export const getTimePeriod = (hour: number): TimePeriod => {
  if (hour >= 5 && hour < 12) {
    return "morning";
  }
  if (hour >= 12 && hour < 17) {
    return "afternoon";
  }
  if (hour >= 17 && hour < 21) {
    return "evening";
  }
  return "night";
};
