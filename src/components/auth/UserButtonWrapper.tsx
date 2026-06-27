'use client';

import { UserButton } from "@clerk/nextjs";
import { UserButtonSkeleton } from "./UserButtonSkeleton";
import { Suspense } from "react";

export function UserButtonWrapper() {
  return (
    <Suspense fallback={<UserButtonSkeleton />}>
      <UserButton
        appearance={{
          elements: {
            avatarBox: "h-10 w-10",
            userButtonPopoverCard: "shadow-lg border dark:border-gray-700",
            userPreviewMainIdentifier: "font-semibold",
            userPreviewSecondaryIdentifier: "text-gray-500 dark:text-gray-400",
            userButtonBox: "hover:bg-gray-100 dark:hover:bg-gray-700",
            userButtonTrigger: "rounded-full",
            userButtonAvatarBox: "rounded-full",
          }
        }}
        showName={false}
        userProfileMode="navigation"
        userProfileUrl="/profile"
      />
    </Suspense>
  );
}