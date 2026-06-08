import type { ResumeRow, UserProfileRow } from "@/types/database";

export interface ProfileCompletionItem {
  readonly key: string;
  readonly label: string;
  readonly completed: boolean;
}

export interface ProfileCompletionResult {
  readonly percentage: number;
  readonly completedItems: readonly ProfileCompletionItem[];
  readonly missingItems: readonly ProfileCompletionItem[];
}

export function calculateProfileCompletion(
  profile: UserProfileRow | null,
  resume: ResumeRow | null,
): ProfileCompletionResult {
  const items: ProfileCompletionItem[] = [
    {
      key: "resume",
      label: "Resume Uploaded",
      completed: Boolean(resume),
    },
    {
      key: "skills",
      label: "Skills",
      completed: Boolean(profile?.skills && profile.skills.length > 0),
    },
    {
      key: "education",
      label: "Education",
      completed: Boolean(profile?.education?.trim()),
    },
    {
      key: "experience",
      label: "Experience",
      completed:
        typeof profile?.experience_years === "number" && profile.experience_years >= 0,
    },
    {
      key: "location",
      label: "Location",
      completed: Boolean(profile?.location?.trim()),
    },
    {
      key: "contact",
      label: "Contact Information",
      completed: Boolean(
        profile?.full_name?.trim() && (profile?.phone?.trim() || profile?.email?.trim()),
      ),
    },
  ];

  const completedItems = items.filter((item) => item.completed);
  const missingItems = items.filter((item) => !item.completed);
  const percentage = Math.round((completedItems.length / items.length) * 100);

  return { percentage, completedItems, missingItems };
}
