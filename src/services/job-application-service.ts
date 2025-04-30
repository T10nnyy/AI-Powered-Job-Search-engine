/**
 * Job application service
 * This file centralizes application-related logic
 */

import { JobSearchResult } from './job-search-service';

// Key for storing dismissed jobs in localStorage
const DISMISSED_JOBS_KEY = 'dismissedJobApplications';
const LAST_APPLIED_JOB_KEY = 'lastAppliedJob';
const RECENTLY_VIEWED_JOBS_KEY = 'recentlyViewedJobs';

/**
 * Handle a job application click
 */
export function handleApplyClick(job: JobSearchResult): void {
  // Open the job application link in a new tab
  window.open(job.job_apply_link, "_blank");
  
  // Store the job for confirmation later
  storeJobForConfirmation(job);
}

/**
 * Store a job for application confirmation
 */
function storeJobForConfirmation(job: JobSearchResult): void {
  // Store the job in session storage for recently viewed
  const storedJobs = sessionStorage.getItem(RECENTLY_VIEWED_JOBS_KEY);
  let jobs: JobSearchResult[] = storedJobs ? JSON.parse(storedJobs) : [];
  
  // Add the current job to the beginning if it's not already there
  if (!jobs.some(j => j.job_id === job.job_id)) {
    jobs.unshift(job);
    // Keep only the last 10 jobs
    jobs = jobs.slice(0, 10);
  }
  
  // Save to session storage
  sessionStorage.setItem(RECENTLY_VIEWED_JOBS_KEY, JSON.stringify(jobs));
  
  // Store the job for confirmation dialog
  localStorage.setItem(LAST_APPLIED_JOB_KEY, JSON.stringify(job));
}

/**
 * Check if we should show application confirmation for a job
 */
export function shouldShowConfirmation(jobId: string): boolean {
  // Check if this job has been dismissed before
  const dismissedJobs = getDismissedJobs();
  
  // If the job ID is in the dismissed list, don't show confirmation
  return !dismissedJobs.includes(jobId);
}

/**
 * Mark a job as having its application confirmation dismissed
 */
export function markJobAsDismissed(jobId: string): void {
  const dismissedJobs = getDismissedJobs();
  
  // Add the job ID if it's not already in the list
  if (!dismissedJobs.includes(jobId)) {
    dismissedJobs.push(jobId);
    
    // Store the updated list
    localStorage.setItem(DISMISSED_JOBS_KEY, JSON.stringify(dismissedJobs));
  }
  
  // Clear the last applied job if it matches this ID
  const lastAppliedJob = localStorage.getItem(LAST_APPLIED_JOB_KEY);
  if (lastAppliedJob) {
    try {
      const job = JSON.parse(lastAppliedJob);
      if (job.job_id === jobId) {
        localStorage.removeItem(LAST_APPLIED_JOB_KEY);
      }
    } catch (e) {
      // Ignore parsing errors
      localStorage.removeItem(LAST_APPLIED_JOB_KEY);
    }
  }
}

/**
 * Get the list of jobs that have had their application confirmation dismissed
 */
function getDismissedJobs(): string[] {
  const dismissed = localStorage.getItem(DISMISSED_JOBS_KEY);
  return dismissed ? JSON.parse(dismissed) : [];
}

/**
 * Clear all application tracking data
 */
export function clearAllApplicationData(): void {
  localStorage.removeItem(DISMISSED_JOBS_KEY);
  localStorage.removeItem(LAST_APPLIED_JOB_KEY);
  sessionStorage.removeItem(RECENTLY_VIEWED_JOBS_KEY);
}
