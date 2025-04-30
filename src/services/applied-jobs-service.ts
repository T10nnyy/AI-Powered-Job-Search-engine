/**
 * Applied Jobs Service
 * This file handles operations related to jobs the user has applied to
 */

import { createClient } from "../../supabase/client";
import { JobSearchResult } from "./job-search-service";

export interface AppliedJob extends JobSearchResult {
  applied_at: string;
  application_status: string;
  notes?: string;
}

/**
 * Track a job application
 */
export async function trackJobApplication(job: JobSearchResult, notes?: string): Promise<boolean> {
  const supabase = createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User must be authenticated to track a job application");
  }
  
  // Save job to database
  const { error } = await supabase
    .from("applied_jobs")
    .upsert({
      user_id: user.id,
      job_id: job.job_id,
      job_title: job.job_title,
      employer_name: job.employer_name,
      employer_logo: job.employer_logo,
      job_location: job.job_location,
      job_description: job.job_description,
      job_apply_link: job.job_apply_link,
      job_posted: job.job_posted_human_readable,
      job_employment_type: job.job_employment_type_text,
      job_is_remote: job.job_is_remote,
      notes: notes || null,
      application_status: "Applied"
    }, {
      onConflict: "user_id, job_id"
    });
    
  if (error) {
    console.error("Error tracking job application:", error);
    throw error;
  }
  
  return true;
}

/**
 * Update job application status
 */
export async function updateApplicationStatus(jobId: string, status: string, notes?: string): Promise<boolean> {
  const supabase = createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User must be authenticated to update application status");
  }
  
  // Update data
  const updateData: any = { application_status: status };
  if (notes !== undefined) {
    updateData.notes = notes;
  }
  
  // Update job application
  const { error } = await supabase
    .from("applied_jobs")
    .update(updateData)
    .eq("user_id", user.id)
    .eq("job_id", jobId);
    
  if (error) {
    console.error("Error updating application status:", error);
    throw error;
  }
  
  return true;
}

/**
 * Remove a job application
 */
export async function removeAppliedJob(jobId: string): Promise<boolean> {
  const supabase = createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User must be authenticated to remove a job application");
  }
  
  // Remove job from database
  const { error } = await supabase
    .from("applied_jobs")
    .delete()
    .eq("user_id", user.id)
    .eq("job_id", jobId);
    
  if (error) {
    console.error("Error removing job application:", error);
    throw error;
  }
  
  return true;
}

/**
 * Get all applied jobs for the current user
 */
export async function getAppliedJobs(): Promise<AppliedJob[]> {
  const supabase = createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User must be authenticated to get applied jobs");
  }
  
  // Get applied jobs from database
  const { data, error } = await supabase
    .from("applied_jobs")
    .select("*")
    .eq("user_id", user.id)
    .order("applied_at", { ascending: false });
    
  if (error) {
    console.error("Error getting applied jobs:", error);
    throw error;
  }
  
  return data as AppliedJob[];
}

/**
 * Check if a job has been applied to by the current user
 */
export async function hasAppliedToJob(jobId: string): Promise<boolean> {
  const supabase = createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return false;
  }
  
  // Check if job has been applied to
  const { data, error } = await supabase
    .from("applied_jobs")
    .select("id")
    .eq("user_id", user.id)
    .eq("job_id", jobId)
    .maybeSingle();
    
  if (error) {
    console.error("Error checking if job has been applied to:", error);
    throw error;
  }
  
  return !!data;
}
