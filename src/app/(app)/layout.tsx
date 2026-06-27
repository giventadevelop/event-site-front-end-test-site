import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { SideNav } from "@/components/side-nav";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer_original_backup";

// Force Node.js runtime
export const runtime = 'nodejs';

interface AppLayoutProps {
  children: ReactNode;
}

export default async function AppLayout({ children }: AppLayoutProps) {
  try {
    // Initialize auth at runtime
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      redirect("/sign-in");
    }

    return (
      <div className="min-h-screen flex flex-col bg-gray-50">

        {/* Top navbar */}
        <Navbar />

        <div className="flex min-h-[calc(100vh-4rem)] flex-1">
          {/* Sidebar */}
          <SideNav />

          {/* Main content */}
          <div className="flex-1 flex flex-col">
            {/* Page content */}
            <div className="p-8 flex-1 flex flex-col">
              {children}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  } catch (error) {
    console.error('Error in app layout:', error);
    redirect("/sign-in");
  }
}