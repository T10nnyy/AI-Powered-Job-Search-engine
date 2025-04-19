/**
 * Job search service
 * This file handles job search API requests
 */

export interface JobSearchResult {
  job_id: string;
  employer_name: string;
  employer_logo: string | null;
  job_title: string;
  job_employment_type_text: string;
  job_apply_link: string;
  job_description: string;
  job_is_remote: boolean;
  job_posted_human_readable: string;
  job_location: string;
  job_city: string;
  job_state: string;
  job_highlights: {
    Qualifications?: string[];
    Responsibilities?: string[];
    Benefits?: string[];
  };
  job_salary: string | null;
  job_min_salary: number | null;
  job_max_salary: number | null;
  // Additional fields can be added as needed
}

export interface JobSearchResponse {
  status: string;
  data: JobSearchResult[];
  // Other fields from the API response
}

/**
 * Search for jobs based on query and location
 */
export async function searchJobs(role: string, location: string): Promise<JobSearchResult[]> {
  try {
    // Construct the query string
    const query = `${role} jobs in ${location}`;
    
    // Call the backend API
    const response = await fetch(`http://localhost:8000/api/job-search?query=${encodeURIComponent(query)}&page=1&num_pages=1`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.status !== "OK" || !data.data) {
      console.error("API returned an error or invalid data:", data);
      return [];
    }
    
    return data.data;
  } catch (error) {
    console.error("Error searching for jobs:", error);
    throw error;
  }
}
