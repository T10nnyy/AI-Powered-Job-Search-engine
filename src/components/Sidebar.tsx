import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Bookmark,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  FileUp,
  Home,
  LogOut,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { createClient } from "../../supabase/client";

interface SidebarProps {
  user: any;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  setShowProfile: (show: boolean) => void;
  setShowResumeUpload: (show: boolean) => void;
  setShowMyJobs: (show: boolean) => void;
  setShowAiPreferences: (show: boolean) => void; // Add this prop
  handleResumeUpload: () => void;
}

export default function Sidebar({
  user,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  activeSection,
  setActiveSection,
  setShowProfile,
  setShowResumeUpload,
  setShowMyJobs,
  setShowAiPreferences, // Add this prop in function parameters
  handleResumeUpload,
}: SidebarProps) {
  const supabase = createClient();
  const router = useRouter();

  return (
    <aside
      className={`${
        isSidebarCollapsed ? "w-20" : "w-64"
      } border-r bg-white dark:bg-gray-800 p-6 flex flex-col shadow-lg transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          {!isSidebarCollapsed && (
            <h1 className="text-xl font-bold">Job Finder</h1>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>
      <nav className="flex flex-col gap-2">
        <Button
          variant="ghost"
          className="justify-start hover:scale-105 transition-transform"
          onClick={() => {
            setShowProfile(false);
            setShowResumeUpload(false);
            setShowMyJobs(false);
            setActiveSection("recommended");
          }}
        >
          <Home className="mr-2 h-4 w-4" />
          {!isSidebarCollapsed && "Dashboard"}
        </Button>
        <Button
          variant="ghost"
          className="justify-start hover:scale-105 transition-transform"
          onClick={() => {
            setShowProfile(false);
            setShowResumeUpload(false);
            setShowMyJobs(true);
            setActiveSection("my-jobs");
          }}
        >
          <Briefcase className="mr-2 h-4 w-4" />
          {!isSidebarCollapsed && "My Jobs"}
        </Button>
        {/* Make sure the "Saved Jobs" button properly sets the activeSection */}
        <Button
          variant="ghost"
          className={`justify-start hover:scale-105 transition-transform ${
            activeSection === "saved" ? "bg-gray-100 dark:bg-gray-700" : ""
          }`}
          onClick={() => {
            setShowProfile(false);
            setShowResumeUpload(false);
            setShowMyJobs(false);
            setActiveSection("saved");
          }}
        >
          <Bookmark className="mr-2 h-4 w-4" />
          {!isSidebarCollapsed && "Saved Jobs"}
        </Button>
        <Button
          variant="ghost"
          className="justify-start hover:scale-105 transition-transform"
          onClick={() => {
            setShowProfile(false);
            setShowResumeUpload(false);
            setShowMyJobs(false);
            setActiveSection("notifications");
          }}
        >
          <Bell className="mr-2 h-4 w-4" />
          {!isSidebarCollapsed && "Notifications"}
        </Button>
        <Button
          variant="ghost"
          className={`justify-start hover:scale-105 transition-transform ${
            activeSection === "ai-preferences" ? "bg-gray-100 dark:bg-gray-700" : ""
          }`}
          onClick={() => {
            setShowProfile(false);
            setShowResumeUpload(false);
            setShowMyJobs(false);
            setShowAiPreferences(true); // Set this to true
            setActiveSection("ai-preferences");
          }}
        >
          <Settings className="mr-2 h-4 w-4" />
          {!isSidebarCollapsed && "AI Assistant"}
        </Button>
        {/* Make sure the upload resume button is set up to properly show the upload component: */}
        <Button
          variant="ghost"
          className="justify-start hover:scale-105 transition-transform"
          onClick={() => {
            setShowProfile(false);
            setShowMyJobs(false);
            setShowResumeUpload(true); // This will trigger the ResumeUpload component
            setActiveSection("upload-resume");
          }}
        >
          <FileUp className="mr-2 h-4 w-4" />
          {!isSidebarCollapsed && "Upload Resume"}
        </Button>
      </nav>
      <Separator className="my-4" />
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="hover:scale-105 transition-transform">
          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        {!isSidebarCollapsed && (
          <div>
            <p className="text-sm font-medium">
              {user.email?.split("@")[0] || "User"}
            </p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        )}
      </div>
      <Button
        variant="outline"
        className="w-full justify-start hover:scale-105 transition-transform"
        onClick={async () => {
          await supabase.auth.signOut();
          router.refresh();
        }}
      >
        <LogOut className="mr-2 h-4 w-4" />
        {!isSidebarCollapsed && "Log Out"}
      </Button>
    </aside>
  );
}
