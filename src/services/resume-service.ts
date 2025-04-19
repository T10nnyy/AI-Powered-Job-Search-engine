/**
 * Resume parsing service
 * This file handles the parsing and processing of uploaded resume files
 */

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
    return data as ResumeData;
  } catch (error: any) {
    console.error('Resume parsing error:', error);
    throw new Error(error.message || 'Failed to parse resume');
  }
}
