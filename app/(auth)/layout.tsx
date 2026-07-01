import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "AvsarGrid — Government Exam Platform",
  description: "Sign in or create your account to start tracking government exams. Get personalized exam recommendations and eligibility analysis.",
};

interface AuthLayoutProps {
  readonly children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return <>{children}</>;
}
