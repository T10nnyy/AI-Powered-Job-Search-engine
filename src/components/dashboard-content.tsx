"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../../supabase/client";
import { useRouter } from "next/navigation";
import {
  Bell,
  Bookmark,
  Briefcase,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Home,
  LogOut,
  Search,
  Settings,
  User,
  Sun,
  Moon,
  FileUp,
  MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

import JobCard from "@/components/job-card";
import FilterPanel from "@/components/filter-panel";
import Profile from "@/components/Profile";
import JobDescriptionModal from "@/components/JobDescriptionModal";
import { parseResume, ResumeData } from "@/services/resume-service";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { searchJobs, JobSearchResult } from "@/services/job-search-service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DashboardContentProps {
  user: any;
}

export default function DashboardContent({ user }: DashboardContentProps) {
  const supabase = createClient();
  const router = useRouter();

  const [showFilters, setShowFilters] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("recommended");
  const [showProfile, setShowProfile] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobSearchResult | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [jobs, setJobs] = useState([]); // Placeholder for jobs fetched via API
  const [savedSearches, setSavedSearches] = useState([]); // Placeholder for saved searches
  const [notifications, setNotifications] = useState([]); // Placeholder for notifications
  const [showResumeUpload, setShowResumeUpload] = useState(false);

  // Resume upload state
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);

  const [preferredLocation, setPreferredLocation] = useState<string>("");
  const [jobSearchResults, setJobSearchResults] = useState<Record<string, JobSearchResult[]>>({});
  const [isSearchingJobs, setIsSearchingJobs] = useState<boolean>(false);
  const [selectedJobRole, setSelectedJobRole] = useState<string | null>(null);

  const handleResumeUpload = () => {
    setShowProfile(false);
    setShowResumeUpload(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      console.log("File selected:", selectedFile.name);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      console.log("File dropped:", droppedFile.name);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError("Please select a file first");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      console.log("Starting file upload for:", file.name);
      const data = await parseResume(file);
      console.log("Parsed resume data:", data);
      setResumeData(data);
      setUploadSuccess(true);
      setResumeUploaded(true);
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const searchJobsForRole = async (role: string, location: string) => {
    try {
      console.log(`Searching for ${role} jobs in ${location}`);
      const results = await searchJobs(role, location);
      return results;
    } catch (error) {
      console.error(`Error searching for ${role} jobs:`, error);
      return [];
    }
  };

  const handleContinueToDashboard = () => {
    setShowResumeUpload(false);
    setActiveTab("recommended");
  };

  const handleJobRoleClick = async (role: string) => {
    if (!preferredLocation) {
      const location = prompt("Please enter a location for job search:", "");
      if (!location) return;

      setPreferredLocation(location);
    }

    setSelectedJobRole(role);
    setIsSearchingJobs(true);

    try {
      const results = await searchJobsForRole(role, preferredLocation);
      setJobSearchResults((prev) => ({
        ...prev,
        [role]: results,
      }));
    } catch (error) {
      console.error(`Error searching for ${role} jobs:`, error);
    } finally {
      setIsSearchingJobs(false);
    }
  };

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="flex h-screen bg-gradient-to-r from-gray-50 to-gray-100 dark:bg-gray-900 dark:from-gray-800 dark:to-gray-700 transition-colors duration-300">
        {/* Sidebar */}
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
              className="p-1"
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
              asChild
            >
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                {!isSidebarCollapsed && "Dashboard"}
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="justify-start hover:scale-105 transition-transform"
            >
              <Briefcase className="mr-2 h-4 w-4" />
              {!isSidebarCollapsed && "My Jobs"}
            </Button>
            <Button
              variant="ghost"
              className="justify-start hover:scale-105 transition-transform"
            >
              <Bookmark className="mr-2 h-4 w-4" />
              {!isSidebarCollapsed && "Saved Jobs"}
            </Button>
            <Button
              variant="ghost"
              className="justify-start hover:scale-105 transition-transform"
            >
              <Bell className="mr-2 h-4 w-4" />
              {!isSidebarCollapsed && "Notifications"}
            </Button>
            <Button
              variant="ghost"
              className="justify-start hover:scale-105 transition-transform"
            >
              <Settings className="mr-2 h-4 w-4" />
              {!isSidebarCollapsed && "AI Preferences"}
            </Button>
            <Button
              variant="ghost"
              className="justify-start hover:scale-105 transition-transform"
              onClick={handleResumeUpload}
            >
              <FileUp className="mr-2 h-4 w-4" />
              {!isSidebarCollapsed && "Upload Resume"}
            </Button>
          </nav>
          <div className="mt-auto">
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
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto dark:bg-gray-900 transition-colors duration-300">
          {/* Header */}
          <header className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b p-4 shadow-md transition-colors duration-300">
            <div className="flex justify-between items-center">
              <div className="relative w-1/3">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for jobs..."
                  className="pl-9 border rounded-md shadow-sm focus:shadow-lg transition-all"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="hover:scale-105 transition-transform"
                >
                  {isDarkMode ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="hover:scale-105 transition-transform"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
                <Button
                  variant="outline"
                  className="hover:scale-105 transition-transform"
                  onClick={() => {
                    setShowProfile(true);
                    setShowResumeUpload(false);
                    setActiveTab("profile");
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
              </div>
            </div>
          </header>

          {/* Resume Upload Prompt */}
          {!resumeUploaded && !showResumeUpload && (
            <div className="p-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <h3 className="text-lg font-medium">
                    Get Started with Your Job Search
                  </h3>
                  <p className="text-gray-600">
                    Upload your resume to start matching with relevant job
                    opportunities
                  </p>
                  <Button
                    onClick={handleResumeUpload}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
                  >
                    Upload Your Resume First
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Filter Panel */}
          {showFilters && (
            <div className="p-4">
              <FilterPanel />
            </div>
          )}

          {/* Dashboard Tabs & Content */}
          <section className="p-6">
            {showProfile ? (
              <div>
                <div className="flex items-center mb-6">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowProfile(false);
                      setActiveTab("recommended");
                    }}
                    className="mr-2"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    User Profile
                  </h2>
                </div>
                <Profile user={user} />
              </div>
            ) : showResumeUpload ? (
              <div>
                <div className="flex items-center mb-6">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowResumeUpload(false);
                      setActiveTab("recommended");
                    }}
                    className="mr-2"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    Upload Your Resume
                  </h2>
                </div>

                {resumeData && uploadSuccess ? (
                  <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                      Parsed Resume Data
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Basic Info */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p>
                              <span className="font-semibold">Name:</span>{" "}
                              {resumeData.basic_info.name}
                            </p>
                            <p>
                              <span className="font-semibold">Email:</span>{" "}
                              {resumeData.basic_info.email}
                            </p>
                            <p>
                              <span className="font-semibold">Phone:</span>{" "}
                              {resumeData.basic_info.phone}
                            </p>
                            <p>
                              <span className="font-semibold">Location:</span>{" "}
                              {resumeData.basic_info.location}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Recommended Job Roles */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Recommended Job Roles</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {resumeData?.recommended_job_roles ? (
                              <ul className="space-y-3">
                                {resumeData.recommended_job_roles.map(
                                  (role, index) => (
                                    <li
                                      key={index}
                                      className="flex justify-between items-center"
                                    >
                                      <span className="text-gray-800 dark:text-gray-200">
                                        {role}
                                      </span>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          handleJobRoleClick(role)
                                        }
                                      >
                                        Search Jobs
                                      </Button>
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <p className="text-gray-500">
                                No job roles generated
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Skills */}
                      <Card className="md:col-span-2">
                        <CardHeader>
                          <CardTitle>Skills</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold mb-2">
                                Technical Skills
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {resumeData.technical_skills.map(
                                  (skill, index) => (
                                    <Badge key={index} variant="secondary">
                                      {skill}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>

                            <div>
                              <h3 className="font-semibold mb-2">Soft Skills</h3>
                              <div className="flex flex-wrap gap-2">
                                {resumeData.soft_skills.map((skill, index) => (
                                  <Badge key={index} variant="outline">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Experience */}
                      <Card className="md:col-span-2">
                        <CardHeader>
                          <CardTitle>Experience</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {resumeData.experience.map((exp, index) => (
                              <div
                                key={index}
                                className="border-b pb-4 last:border-0"
                              >
                                <h3 className="font-bold">{exp.job_title}</h3>
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                  <p>{exp.company}</p>
                                  <p>{exp.duration}</p>
                                </div>
                                <p className="mt-2">{exp.description}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Education */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Education</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {resumeData.education.map((edu, index) => (
                              <div
                                key={index}
                                className="border-b pb-4 last:border-0"
                              >
                                <h3 className="font-bold">{edu.degree}</h3>
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                  <p>{edu.institution}</p>
                                  <p>{edu.year}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Certifications */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Certifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="list-disc pl-5 space-y-1">
                            {resumeData.certifications.map((cert, index) => (
                              <li key={index}>{cert}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Preferred Location */}
                    <div className="mt-6 mb-6">
                      <h3 className="text-lg font-medium mb-2">
                        Preferred Job Location
                      </h3>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Enter your preferred location (e.g., New York, Remote)"
                          value={preferredLocation}
                          onChange={(e) =>
                            setPreferredLocation(e.target.value)
                          }
                          className="max-w-md"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        This will help us find relevant job opportunities in
                        your desired location
                      </p>
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setResumeData(null);
                          setFile(null);
                          setUploadSuccess(false);
                        }}
                      >
                        Upload Another Resume
                      </Button>
                      <Button
                        onClick={handleContinueToDashboard}
                        disabled={!preferredLocation.trim()}
                      >
                        Continue to Dashboard
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-2xl mx-auto">
                    <div
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <FileUp className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600 dark:text-gray-300 mb-4 text-center">
                        Drag and drop your resume file here, or click to browse
                      </p>
                      <input
                        type="file"
                        id="resumeUpload"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="resumeUpload">
                        <Button
                          type="button"
                          className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                        >
                          Browse Files
                        </Button>
                      </label>
                      {file && (
                        <p className="text-green-600 dark:text-green-400 mt-2">
                          Selected: {file.name}
                        </p>
                      )}
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                        Supported formats: PDF, DOC, DOCX
                      </p>
                    </div>
                    <div className="mt-6">
                      {uploadError ? (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-md text-center">
                          {uploadError}
                        </div>
                      ) : uploadSuccess ? (
                        <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-4 rounded-md text-center">
                          Resume uploaded successfully! Analyzing your resume...
                        </div>
                      ) : (
                        <Button
                          onClick={handleUpload}
                          disabled={!file || uploading}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {uploading ? (
                            <span className="flex items-center">
                              <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Uploading...
                            </span>
                          ) : (
                            "Upload Resume"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                <div className="flex justify-between items-center mb-6">
                  <TabsList>
                    <TabsTrigger value="recommended">Recommended</TabsTrigger>
                    <TabsTrigger value="saved">Saved Searches</TabsTrigger>
                    <TabsTrigger value="notifications">
                      Notifications
                    </TabsTrigger>
                  </TabsList>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Sort by:
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 hover:scale-105 transition-transform"
                    >
                      Relevance <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <TabsContent value="recommended" className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">
                      AI-Recommended Jobs
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Based on your skills and preferences
                    </p>

                    {resumeUploaded && resumeData?.recommended_job_roles ? (
                      <div>
                        {isSearchingJobs ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="flex flex-col items-center">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                              <p>Searching for jobs based on your resume...</p>
                            </div>
                          </div>
                        ) : selectedJobRole ? (
                          <div>
                            <div className="mb-6 flex items-center justify-between">
                              <div className="flex items-center">
                                <span className="font-medium mr-2">
                                  Searching for{" "}
                                  <span className="text-blue-600">
                                    {selectedJobRole}
                                  </span>{" "}
                                  in
                                </span>
                                <span>{preferredLocation}</span>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const newLocation = prompt(
                                      "Enter your preferred location:",
                                      preferredLocation
                                    );
                                    if (newLocation) {
                                      setPreferredLocation(newLocation);
                                      handleJobRoleClick(selectedJobRole);
                                    }
                                  }}
                                >
                                  Change Location
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedJobRole(null)}
                                >
                                  Back to Roles
                                </Button>
                              </div>
                            </div>

                            {jobSearchResults[selectedJobRole]?.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {jobSearchResults[selectedJobRole].map(
                                  (job) => (
                                    <JobCard
                                      key={job.job_id}
                                      job={job}
                                      onViewDetails={(job) =>
                                        setSelectedJob(job)
                                      }
                                    />
                                  )
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <p className="text-gray-500">
                                  No job results found for {selectedJobRole} in{" "}
                                  {preferredLocation}. Try a different location.
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <h3 className="text-xl font-medium mb-4">
                              Select a Job Role to Search:
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                              {resumeData.recommended_job_roles.map(
                                (role, index) => (
                                  <Card
                                    key={index}
                                    className="hover:shadow-lg transition-all duration-300 cursor-pointer"
                                    onClick={() => handleJobRoleClick(role)}
                                  >
                                    <CardContent className="p-6">
                                      <h4 className="text-lg font-semibold mb-2">
                                        {role}
                                      </h4>
                                      <p className="text-sm text-gray-500 mb-4">
                                        Find opportunities matching your skills
                                      </p>
                                      <Button
                                        className="w-full"
                                        variant="outline"
                                      >
                                        Search Jobs
                                      </Button>
                                    </CardContent>
                                  </Card>
                                )
                              )}
                            </div>

                            {preferredLocation ? (
                              <div className="mt-4 flex items-center text-sm text-gray-500">
                                <MapPin className="h-4 w-4 mr-1" />
                                Current location: {preferredLocation}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="ml-2 h-auto py-1 px-2"
                                  onClick={() => {
                                    const newLocation = prompt(
                                      "Enter your preferred location:",
                                      preferredLocation
                                    );
                                    if (newLocation) {
                                      setPreferredLocation(newLocation);
                                    }
                                  }}
                                >
                                  Change
                                </Button>
                              </div>
                            ) : (
                              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                  You'll be asked to enter your preferred
                                  location when you select a job role.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 mb-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                          <h3 className="text-lg font-medium">
                            Upload Your Resume to See Job Matches
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            We'll analyze your skills and experience to find the
                            best job matches for you
                          </p>
                          <Button
                            onClick={handleResumeUpload}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Upload Resume Now
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="saved" className="space-y-6">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                    Your Saved Searches
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {savedSearches.length > 0 ? (
                      savedSearches.map((search) => (
                        <div
                          key={search.id}
                          className="p-4 border rounded-lg"
                        ></div>
                      ))
                    ) : (
                      <p className="text-gray-500">
                        No saved searches available yet.
                      </p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="notifications" className="space-y-6">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                    Your Notifications
                  </h2>
                  <div className="space-y-3">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-4 border rounded-lg"
                        ></div>
                      ))
                    ) : (
                      <p className="text-gray-500">
                        No notifications available yet.
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </section>
        </main>
      </div>

      {/* Job Description Modal */}
      {selectedJob && (
        <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {selectedJob.job_title}
              </DialogTitle>
              <DialogDescription>
                {selectedJob.employer_name} · {selectedJob.job_location}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {selectedJob.job_employment_type_text || "Not specified"}
                </Badge>
                {selectedJob.job_is_remote && (
                  <Badge variant="outline">Remote</Badge>
                )}
                <Badge variant="outline">
                  {selectedJob.job_posted_human_readable}
                </Badge>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-lg font-medium">Job Description</h3>
                <div
                  dangerouslySetInnerHTML={{
                    __html: selectedJob.job_description,
                  }}
                />
              </div>

              {selectedJob.job_highlights?.Qualifications && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Qualifications</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedJob.job_highlights.Qualifications.map(
                      (item, i) => (
                        <li key={i}>{item}</li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {selectedJob.job_highlights?.Responsibilities && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Responsibilities</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedJob.job_highlights.Responsibilities.map(
                      (item, i) => (
                        <li key={i}>{item}</li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {selectedJob.job_highlights?.Benefits && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Benefits</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedJob.job_highlights.Benefits.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedJob(null)}>
                Close
              </Button>
              <Button
                onClick={() =>
                  window.open(selectedJob.job_apply_link, "_blank")
                }
              >
                Apply Now
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
