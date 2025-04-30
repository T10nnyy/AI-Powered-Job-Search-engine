/**
 * Saved jobs service
 * This file handles storing and retrieving saved jobs
 */

import { createClient } from "../../supabase/client";
import { JobSearchResult } from "./job-search-service";

/**
 * Save a job to the user's saved jobs
 */
export async function saveJob(job: JobSearchResult): Promise<void> {
  const supabase = createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User must be authenticated to save jobs");
  }
  
  console.log("Saving job:", job.job_id);
  
  // Store job in Supabase - modified structure based on your actual table
  const { error } = await supabase
    .from('saved_jobs')
    .upsert({
      user_id: user.id,
      job_id: job.job_id,
      job_title: job.job_title,
      employer_name: job.employer_name,
      job_location: job.job_location,
      job_apply_link: job.job_apply_link,
      job_description: job.job_description,
      job_posted_human_readable: job.job_posted_human_readable,
      job_employment_type_text: job.job_employment_type_text,
      job_is_remote: job.job_is_remote,
      saved_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,job_id'
    });
    
  if (error) {
    console.error("Error saving job:", error);
    throw error;
  }
}

/**
 * Check if a job is saved by the current user
 */
export async function isJobSaved(jobId: string): Promise<boolean> {
  const supabase = createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return false;
  }
  
  // Check if job is saved
  const { data, error } = await supabase
    .from('saved_jobs')
    .select('job_id')
    .eq('user_id', user.id)
    .eq('job_id', jobId)
    .single();
    
  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error("Error checking if job is saved:", error);
    return false;
  }
  
  return !!data;
}

/**
 * Get all saved jobs for the current user
 */
export async function getSavedJobs(): Promise<JobSearchResult[]> {
  const supabase = createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log("User not authenticated");
    return [];
  }
  
  console.log("Fetching saved jobs for user:", user.id);
  
  // Get saved jobs
  const { data, error } = await supabase
    .from('saved_jobs')
    .select('*')
    .eq('user_id', user.id)
    .order('saved_at', { ascending: false });
    
  if (error) {
    console.error("Error getting saved jobs:", error);
    throw error;
  }
  
  console.log("Retrieved saved jobs data:", data);
  
  // Convert DB rows to JobSearchResult format - improved mapping based on actual DB columns
  const savedJobs: JobSearchResult[] = data?.map(item => ({
    job_id: item.job_id,
    employer_name: item.employer_name || "",
    employer_logo: null, // This might not be in your table
    job_title: item.job_title || "",
    job_employment_type_text: item.job_employment_type_text || "",
    job_apply_link: item.job_apply_link || "",
    job_description: item.job_description || "",
    job_is_remote: item.job_is_remote || false,
    job_posted_human_readable: item.job_posted_human_readable || "",
    job_location: item.job_location || "",
    job_city: item.job_city || "",
    job_state: item.job_state || "",
    job_highlights: item.job_highlights || {},
    job_salary: item.job_salary || null,
    job_min_salary: item.job_min_salary || null,
    job_max_salary: item.job_max_salary || null
  })) || [];
  
  console.log("Transformed saved jobs:", savedJobs);
  
  return savedJobs;
}

/**
 * Remove a saved job
 */
export async function removeSavedJob(jobId: string): Promise<void> {
  const supabase = createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User must be authenticated to remove saved jobs");
  }
  
  // Remove job from saved jobs
  const { error } = await supabase
    .from('saved_jobs')
    .delete()
    .eq('user_id', user.id)
    .eq('job_id', jobId);
    
  if (error) {
    console.error("Error removing saved job:", error);
    throw error;
  }
}
