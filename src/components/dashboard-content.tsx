"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../supabase/client";
import { useRouter } from "next/navigation";
import {
  Search,
  Sun,
  Moon,
  ChevronLeft,
  FileUp, // Add FileUp import
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ToastProvider } from "@/components/ui/toast";

import Sidebar from "@/components/Sidebar"; // Import the new Sidebar component
import JobCard from "@/components/job-card";
import FilterPanel from "@/components/filter-panel";
import Profile from "@/components/Profile";
import { parseResume, ResumeData, getUserResumeData, getPreferredLocation, updatePreferredLocation } from "@/services/resume-service";
import { searchJobs, JobSearchResult } from "@/services/job-search-service";
import SavedJobs from "@/components/saved-jobs";
import MyJobs from "@/components/my-jobs";
import ApplicationConfirmationDialog from "@/components/application-confirmation-dialog";
import { hasAppliedToJob } from "@/services/applied-jobs-service";
import { handleApplyClick, shouldShowConfirmation, markJobAsDismissed } from "@/services/job-application-service";
import ResumeUpload from "@/components/ResumeUpload"; // Add this import
import AiPreferences from '@/components/AiPreferences'; // Add this import

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
  const [activeSection, setActiveSection] = useState("recommended");
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

  // Add state for My Jobs
  const [showMyJobs, setShowMyJobs] = useState(false);
  const [lastAppliedJob, setLastAppliedJob] = useState<JobSearchResult | null>(null);
  const [showAppliedConfirmation, setShowAppliedConfirmation] = useState(false);
  const [recentlyVisitedJobSites, setRecentlyVisitedJobSites] = useState<Set<string>>(new Set());

  // Add a new state variable for showing AI Preferences
  const [showAiPreferences, setShowAiPreferences] = useState(false);

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

  // Add a function to load the user's existing resume data
  const loadUserResumeData = async () => {
    try {
      // Get the user's resume data
      const data = await getUserResumeData();
      if (data) {
        setResumeData(data);
        setResumeUploaded(true);
        console.log("Loaded existing resume data");
        
        // Get the user's preferred location
        const location = await getPreferredLocation();
        if (location) {
          setPreferredLocation(location);
          console.log("Loaded preferred location:", location);
        }
      }
    } catch (error) {
      console.error("Error loading user resume data:", error);
    }
  };

  // Load the user's resume data when the component mounts
  useEffect(() => {
    loadUserResumeData();
  }, []);

  // Update the handleContinueToDashboard function to save the preferred location
  const handleContinueToDashboard = async () => {
    if (preferredLocation) {
      try {
        // Store the preferred location
        await updatePreferredLocation(preferredLocation);
      } catch (error) {
        console.error("Error updating preferred location:", error);
      }
    }
    
    setShowResumeUpload(false);
    setActiveSection("recommended");
  };

  // Modify handleJobRoleClick to ensure location is entered first
  const handleJobRoleClick = async (role: string) => {
    if (!preferredLocation.trim()) {
      // If no location, we won't show the prompt but just inform user they need to set location
      return; // Don't proceed without location
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

  // Also update the section where preferred location is changed
  const handleLocationChange = async (newLocation: string) => {
    if (newLocation && newLocation !== preferredLocation) {
      setPreferredLocation(newLocation);
      
      try {
        // Store the updated location
        await updatePreferredLocation(newLocation);
        
        // If we're viewing a specific job role, refresh the search
        if (selectedJobRole) {
          handleJobRoleClick(selectedJobRole);
        }
      } catch (error) {
        console.error("Error updating preferred location:", error);
      }
    }
  };

  // Check for jobs that the user may have applied to
  useEffect(() => {
    const checkForAppliedJobs = async () => {
      // Get jobs from session storage
      const storedJobs = sessionStorage.getItem('recentlyViewedJobs');
      if (storedJobs) {
        const jobs = JSON.parse(storedJobs) as JobSearchResult[];
        
        // Find the first job that hasn't been confirmed yet
        for (const job of jobs) {
          const applied = await hasAppliedToJob(job.job_id);
          if (!applied && !recentlyVisitedJobSites.has(job.job_id)) {
            setLastAppliedJob(job);
            setShowAppliedConfirmation(true);
            return;
          }
        }
      }
    };
    
    // Only check if we're on the dashboard (not in other sections)
    if (!showProfile && !showResumeUpload && !showMyJobs) {
      checkForAppliedJobs();
    }
  }, [showProfile, showResumeUpload, showMyJobs, recentlyVisitedJobSites]);

  // Fix the useEffect that checks for pending job applications
  useEffect(() => {
    // Check if there's a stored job in localStorage
    const storedJob = localStorage.getItem('lastAppliedJob');
    if (storedJob) {
      try {
        const job = JSON.parse(storedJob) as JobSearchResult;
        
        // Only show the confirmation if:
        // 1. We haven't already confirmed or dismissed this job
        // 2. The job hasn't already been applied to
        if (shouldShowConfirmation(job.job_id)) {
          hasAppliedToJob(job.job_id).then(applied => {
            if (!applied) {
              setLastAppliedJob(job);
              setShowAppliedConfirmation(true);
            } else {
              // Already tracked, clear from storage and mark as dismissed
              markJobAsDismissed(job.job_id);
            }
          });
        }
      } catch (e) {
        console.error("Error parsing stored job:", e);
        localStorage.removeItem('lastAppliedJob');
      }
    }
  }, []);

  // Update the handleApplyClick function to use the new service
  const handleJobApply = (job: JobSearchResult) => {
    handleApplyClick(job); // Use the centralized service
    
    // Show confirmation dialog immediately
    setLastAppliedJob(job);
    setShowAppliedConfirmation(true);
    
    // Close the job details modal
    setSelectedJob(null);
  };

  // Fix the confirmation close handler
  const handleConfirmationClose = () => {
    setShowAppliedConfirmation(false);
    
    if (lastAppliedJob) {
      // Mark this job as dismissed so we don't show the dialog again
      markJobAsDismissed(lastAppliedJob.job_id);
      setLastAppliedJob(null);
    }
  };

  // Updating the main return statement to use our new Sidebar component
  return (
    <ToastProvider>
      <div className={isDarkMode ? "dark" : ""}>
        <div className="flex h-screen bg-gradient-to-r from-gray-50 to-gray-100 dark:bg-gray-900 dark:from-gray-800 dark:to-gray-700 transition-colors duration-300">
          {/* Use the new Sidebar component */}
          <Sidebar 
            user={user}
            isSidebarCollapsed={isSidebarCollapsed}
            setIsSidebarCollapsed={setIsSidebarCollapsed}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            setShowProfile={setShowProfile}
            setShowResumeUpload={setShowResumeUpload}
            setShowMyJobs={setShowMyJobs}
            setShowAiPreferences={setShowAiPreferences} // Add this prop
            handleResumeUpload={handleResumeUpload}
          />
          
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
                </div>
              </div>
            </header>
            
            {/* Filter Panel */}
            {showFilters && (
              <div className="p-4">
                <FilterPanel />
              </div>
            )}
            
            {/* Dashboard Content */}
            <section className="p-6">
              {showAiPreferences ? (
                <div>
                  <div className="flex items-center mb-6">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowAiPreferences(false);
                        setActiveSection("recommended");
                      }}
                      className="mr-2"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      AI Career Assistant
                    </h2>
                  </div>
                  <AiPreferences />
                </div>
              ) : showProfile ? (
                <div>
                  <div className="flex items-center mb-6">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowProfile(false);
                        setActiveSection("recommended");
                      }}
                      className="mr-2"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      User Profile
                    </h2>
                  </div>
                  {/* Profile Panel */}
                  <Profile user={user} />
                </div>
              ) : showResumeUpload ? (
                <ResumeUpload
                  onBack={() => {
                    setShowResumeUpload(false);
                    setActiveSection("recommended");
                  }}
                  onComplete={() => {
                    setShowResumeUpload(false);
                    setActiveSection("recommended");
                  }}
                  resumeData={resumeData}
                  setResumeData={setResumeData}
                  setResumeUploaded={setResumeUploaded}
                  preferredLocation={preferredLocation}
                  setPreferredLocation={setPreferredLocation}
                />
              ) : showMyJobs ? (
                <div>
                  <div className="flex items-center mb-6">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowMyJobs(false);
                        setActiveSection("recommended");
                      }}
                      className="mr-2"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      My Job Applications...
                    </h2>
                  </div>
                  <MyJobs />
                </div>
              ) : (
                <>
                  {activeSection === "recommended" && (
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
                                      {selectedJobRole}s
                                    </span>{" "}
                                    in {preferredLocation}
                                  </span>
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
                                        handleLocationChange(newLocation);
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
                                    <ChevronLeft className="h-4 w-4 mr-1" /> Back to Roles
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {jobSearchResults[selectedJobRole]?.length > 0 ? (
                                  jobSearchResults[selectedJobRole].map(
                                    (job) => (
                                      <JobCard
                                        key={job.job_id}
                                        job={job}
                                        onViewDetails={(job) =>
                                          setSelectedJob(job)
                                        }
                                        onApplyClick={handleJobApply}
                                      />
                                    )
                                  )
                                ) : (
                                  <div className="text-center py-8">
                                    <p className="text-gray-500">
                                      No job results found for {selectedJobRole} in{" "}
                                      {preferredLocation}. Try a different location.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <h3 className="text-xl font-medium mb-4">Select a Job Role to Search:</h3>
                              
                              {/* Add the missing location input box */}
                              <div className="mb-6">
                                <Card className="border mb-6">
                                  <CardHeader>
                                    <CardTitle className="text-lg">Set Your Job Location</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-4">
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Enter your preferred job location to search for opportunities. 
                                        This is required before you can search for jobs.
                                      </p>
                                      <div className="flex space-x-2">
                                        <Input
                                          placeholder="Enter your preferred location (e.g., New York, Remote)"
                                          value={preferredLocation}
                                          onChange={(e) => setPreferredLocation(e.target.value)}
                                          className="flex-1"
                                        />
                                        <Button 
                                          onClick={() => {
                                            if (preferredLocation.trim()) {
                                              // Just to trigger a re-render and confirm location
                                              setPreferredLocation(preferredLocation.trim());
                                              updatePreferredLocation(preferredLocation.trim())
                                                .catch(e => console.error("Error saving location:", e));
                                            }
                                          }}
                                          disabled={!preferredLocation.trim()}
                                        >
                                          Set Location
                                        </Button>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {resumeData.recommended_job_roles.map(
                                  (role, index) => (
                                    <Card
                                      key={index}
                                      className={`
                                        transition-all duration-300 
                                        ${!preferredLocation.trim() ? 'opacity-60' : 'hover:shadow-lg cursor-pointer'}
                                      `}
                                      onClick={() => preferredLocation.trim() && handleJobRoleClick(role)}
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
                                          disabled={!preferredLocation.trim()}
                                        >
                                          {!preferredLocation.trim() 
                                            ? "Set location first" 
                                            : "Search Jobs"}
                                        </Button>
                                      </CardContent>
                                    </Card>
                                  )
                                )}
                              </div>
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
                              variant="outline"
                              onClick={handleResumeUpload}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Upload Resume Now
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeSection === "saved" && (
                    <SavedJobs />
                  )}
                  
                  {activeSection === "notifications" && (
                    <div>
                      <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">
                        Your Notifications
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        Stay updated with job-related notifications
                      </p>
                      <div className="space-y-3">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className="p-4 border rounded-lg"
                            >
                              {notification.message}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">
                            No notifications available yet.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          </main>
        </div>

        {/* Job Description Modal */}
        {selectedJob && (
          <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedJob.job_title}</DialogTitle>
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
                      {selectedJob.job_highlights.Qualifications.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
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
                  onClick={() => handleJobApply(selectedJob)}
                >
                  Apply Now
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Application Confirmation Dialog */}
        {lastAppliedJob && (
          <ApplicationConfirmationDialog
            isOpen={showAppliedConfirmation}
            onClose={handleConfirmationClose}
            job={lastAppliedJob}
          />
        )}
      </div>
    </ToastProvider>
  );
}
