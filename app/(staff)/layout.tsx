import { StaffAppProviders } from "@/components/layouts/StaffAppProviders";

export default function StaffGroupLayout({ children }: { children: React.ReactNode }) {
  return <StaffAppProviders>{children}</StaffAppProviders>;
}
