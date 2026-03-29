"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserGuardProps {
  children: (user: { email: string; name: string }) => React.ReactNode;
}

/**
 * Client wrapper that checks localStorage for a saved user.
 * If no user found, redirects to /register.
 * Passes user data to children via render prop.
 */
export default function UserGuard({ children }: UserGuardProps) {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem("bb_email");
    const name = localStorage.getItem("bb_name");

    if (!email || !name) {
      router.replace("/register");
      return;
    }

    setUser({ email, name });
    setChecking(false);
  }, [router]);

  if (checking || !user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full" />
      </div>
    );
  }

  return <>{children(user)}</>;
}
