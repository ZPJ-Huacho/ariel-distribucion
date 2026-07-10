"use client";

import type { User } from "@/core/users";
import { useProfile } from "../../../api/useProfile";
import { ProfileHero } from "../ProfileHero";
import { ProfileTabs } from "../ProfileTabs";

export function ProfileClient({ initialUser }: { initialUser: User }) {
  const { data } = useProfile(initialUser);
  const user = data ?? initialUser;
  return (
    <div className="flex flex-col gap-6">
      <ProfileHero user={user} />
      <ProfileTabs user={user} />
    </div>
  );
}
