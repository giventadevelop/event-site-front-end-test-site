"use client";
import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { bootstrapUserProfile } from './ProfileBootstrapperApiServerActions';

export function ProfileBootstrapper() {
  const { isSignedIn, userId, isLoaded } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId || !user) return;
    console.log("ProfileBootstrapper useEffect running", { isLoaded, isSignedIn, userId, user });
    // Extract serializable data from user object (client reference)
    // This prevents "Cannot access primaryEmailAddress on the server" errors
    const userData = {
      email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      imageUrl: user.imageUrl || "",
    };
    bootstrapUserProfile({ userId, userData })
      .catch((err) => {
        console.error("Profile bootstrap failed:", err);
      });
  }, [isLoaded, isSignedIn, userId, user]);
  return null;
}