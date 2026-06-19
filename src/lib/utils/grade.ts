export type Grade = "S" | "A" | "B" | "C" | "D" | "F";

interface GradeConfig {
  bg: string;
  text: string;
  border: string;
  label: string;
}

export const GRADE_CONFIG: Record<Grade, GradeConfig> = {
  S: { bg: "#EEF2FF", text: "#3730A3", border: "#A5B4FC", label: "S级" },
  A: { bg: "#D1FAE5", text: "#065F46", border: "#6EE7B7", label: "A级" },
  B: { bg: "#FEF9C3", text: "#713F12", border: "#FDE047", label: "B级" },
  C: { bg: "#FEF3C7", text: "#92400E", border: "#FCD34D", label: "C级" },
  D: { bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5", label: "D级" },
  F: { bg: "#1F2937", text: "#F9FAFB", border: "#374151", label: "F级" },
};

export function scoreToGrade(score: number): Grade {
  if (score >= 90) return "S";
  if (score >= 75) return "A";
  if (score >= 60) return "B";
  if (score >= 45) return "C";
  if (score >= 30) return "D";
  return "F";
}

export function statusToGrade(status: "PASS" | "WARN" | "FAIL"): Grade {
  const map = { PASS: "A", WARN: "C", FAIL: "F" } as const;
  return map[status];
}
