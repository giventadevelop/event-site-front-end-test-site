import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function UserNav() {
  return (
    <div className="flex items-center gap-4">
      <Link href="/profile">
        <Button variant="ghost" className="text-sm">
          Edit Profile
        </Button>
      </Link>
      <UserButton />
    </div>
  );
}