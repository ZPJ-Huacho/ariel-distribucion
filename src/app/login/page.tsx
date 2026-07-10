import { LoginView } from "@/features/auth";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return <LoginView nextPromise={searchParams} />;
}
