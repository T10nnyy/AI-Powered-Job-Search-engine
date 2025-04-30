"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { parseResume, getUserResumeData, ResumeData } from "@/services/resume-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUp, ChevronLeft, Upload, Home, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function UploadResumePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingResumeData, setExistingResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("current");
  
  // Load existing resume data when component mounts
  useEffect(() => {
    async function loadResumeData() {
      try {
        setLoading(true);
        const data = await getUserResumeData();
        setExistingResumeData(data);
      } catch (err) {
        console.error("Error loading resume data:", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadResumeData();
  }, []);

  // Improved file change handler with logging
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      console.log("File selected:", selectedFile.name);
    }
  };

  // Add drag and drop functionality
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

  // Improved upload handler with better error handling and logging
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      console.log("Starting file upload for:", file.name);
      const data = await parseResume(file);
      console.log("Parsed resume data:", data);
      setUploadSuccess(true);
      setExistingResumeData(data); // Update existing data with new upload
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleResetAndUploadNew = () => {
    setActiveTab("upload");
    setFile(null);
    setUploadSuccess(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading your resume data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          className="mr-4 hover:bg-gray-100 transition-colors"
          asChild
        >
          <Link href="/dashboard">
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Resume Management</h1>
      </div>
      
      {existingResumeData ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="current">Current Resume</TabsTrigger>
            <TabsTrigger value="upload">Upload New Resume</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Your Current Resume</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleResetAndUploadNew}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Upload New Resume
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                          {existingResumeData.basic_info.name}
                        </p>
                        <p>
                          <span className="font-semibold">Email:</span>{" "}
                          {existingResumeData.basic_info.email}
                        </p>
                        <p>
                          <span className="font-semibold">Phone:</span>{" "}
                          {existingResumeData.basic_info.phone}
                        </p>
                        <p>
                          <span className="font-semibold">Location:</span>{" "}
                          {existingResumeData.basic_info.location}
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
                        {existingResumeData?.recommended_job_roles ? (
                          <ul className="space-y-1">
                            {existingResumeData.recommended_job_roles.map(
                              (role, index) => (
                                <li
                                  key={index}
                                  className="flex items-center"
                                >
                                  <span className="text-gray-800 dark:text-gray-200">
                                    • {role}
                                  </span>
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
                            {existingResumeData.technical_skills.map(
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
                            {existingResumeData.soft_skills.map((skill, index) => (
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
                        {existingResumeData.experience.map((exp, index) => (
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
                        {existingResumeData.education.map((edu, index) => (
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
                        {existingResumeData.certifications.map((cert, index) => (
                          <li key={index}>{cert}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="upload">
            <div className="bg-white rounded-lg shadow p-6">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <FileUp className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4 text-center">
                  Drag and drop your updated resume file here, or click to browse
                </p>
                <input
                  type="file"
                  id="resumeUpload"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
                <label htmlFor="resumeUpload">
                  <Button type="button" className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                    Browse Files
                  </Button>
                </label>
                {file && (
                  <p className="text-green-600 mt-2">
                    Selected: {file.name}
                  </p>
                )}
                <p className="text-gray-500 text-sm mt-2">
                  Supported formats: PDF, DOC, DOCX
                </p>
              </div>
              <div className="mt-6">
                {error ? (
                  <div className="bg-red-50 text-red-700 p-4 rounded-md text-center">
                    {error}
                  </div>
                ) : uploadSuccess ? (
                  <div className="bg-green-50 text-green-700 p-4 rounded-md text-center">
                    Resume uploaded successfully! Redirecting to dashboard...
                  </div>
                ) : (
                  <Button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </span>
                    ) : (
                      "Upload New Resume"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        // No existing resume data, show upload form
        <div className="bg-white rounded-lg shadow p-6">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <FileUp className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4 text-center">
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
              <Button type="button" className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                Browse Files
              </Button>
            </label>
            {file && (
              <p className="text-green-600 mt-2">
                Selected: {file.name}
              </p>
            )}
            <p className="text-gray-500 text-sm mt-2">
              Supported formats: PDF, DOC, DOCX
            </p>
          </div>
          <div className="mt-6">
            {error ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-md text-center">
                {error}
              </div>
            ) : uploadSuccess ? (
              <div className="bg-green-50 text-green-700 p-4 rounded-md text-center">
                Resume uploaded successfully! Redirecting to dashboard...
              </div>
            ) : (
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {uploading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
  );
}
