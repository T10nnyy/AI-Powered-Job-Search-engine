/**
 * Resume parsing service
 * This file handles the parsing and processing of uploaded resume files
 */
import { createClient } from "../../supabase/client";

export interface ResumeData {
  basic_info: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  professional_summary: string;
  skills: string[];
  technical_skills: string[];
  soft_skills: string[];
  experience: {
    job_title: string;
    company: string;
    duration: string;
    description: string;
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  certifications: string[];
  years_of_experience: number;
  recommended_job_roles: string[]; // Added for job recommendations
}

/**
 * Parse resume file and extract structured data using the backend API
 */
export async function parseResume(file: File): Promise<ResumeData> {
  // Create a FormData instance to send the file
  const formData = new FormData();
  formData.append('file', file);

  try {
    // Call the FastAPI backend to parse the resume
    // The router in main.py includes the /api prefix
    const response = await fetch('http://localhost:8000/api/resume/parse', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('API error response:', errorData);
      throw new Error(errorData?.detail || `Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const resumeData = data as ResumeData;
    
    // Store the resume data in Supabase
    await storeResumeData(resumeData);
    
    return resumeData;
  } catch (error: any) {
    console.error('Resume parsing error:', error);
    throw new Error(error.message || 'Failed to parse resume');
  }
}

/**
 * Store resume data in Supabase
 */
export async function storeResumeData(data: ResumeData, preferredLocation?: string): Promise<void> {
  const supabase = createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User must be authenticated to store resume data");
  }
  
  // Store resume data in Supabase
  const { error } = await supabase
    .from('user_resumes')
    .upsert({
      user_id: user.id,
      basic_info: data.basic_info,
      technical_skills: data.technical_skills,
      soft_skills: data.soft_skills,
      experience: data.experience,
      education: data.education,
      certifications: data.certifications,
      recommended_job_roles: data.recommended_job_roles,
      preferred_location: preferredLocation || null
    }, {
      onConflict: 'user_id'
    });
    
  if (error) {
    console.error("Error storing resume data:", error);
    throw error;
  }
}

/**
 * Update preferred location for resume
 */
export async function updatePreferredLocation(location: string): Promise<void> {
  const supabase = createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User must be authenticated to update location");
  }
  
  // Update preferred location
  const { error } = await supabase
    .from('user_resumes')
    .update({ preferred_location: location })
    .eq('user_id', user.id);
    
  if (error) {
    console.error("Error updating preferred location:", error);
    throw error;
  }
}

/**
 * Get saved resume data for the current user
 */
export async function getUserResumeData(): Promise<ResumeData | null> {
  const supabase = createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }
  
  // Get resume data
  const { data, error } = await supabase
    .from('user_resumes')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
    
  if (error) {
    console.error("Error getting resume data:", error);
    throw error;
  }
  
  if (!data) {
    return null;
  }
  
  // Convert the data to ResumeData format
  const resumeData: ResumeData = {
    basic_info: data.basic_info,
    professional_summary: "", // This might not be in the stored data
    skills: [], // This might not be in the stored data
    technical_skills: data.technical_skills,
    soft_skills: data.soft_skills,
    experience: data.experience,
    education: data.education,
    certifications: data.certifications,
    years_of_experience: 0, // This might not be accurate
    recommended_job_roles: data.recommended_job_roles
  };
  
  return resumeData;
}

/**
 * Get preferred location for the current user
 */
export async function getPreferredLocation(): Promise<string | null> {
  const supabase = createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }
  
  // Get preferred location
  const { data, error } = await supabase
    .from('user_resumes')
    .select('preferred_location')
    .eq('user_id', user.id)
    .maybeSingle();
    
  if (error) {
    console.error("Error getting preferred location:", error);
    throw error;
  }
  
  return data?.preferred_location || null;
}
