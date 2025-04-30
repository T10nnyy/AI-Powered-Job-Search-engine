"use client";

import { useState, useEffect } from 'react';
import { getSavedJobs, removeSavedJob } from '@/services/saved-jobs-service';
import JobCard from './job-card';
import { Button } from './ui/button';
import { RefreshCcw, Search, Briefcase, Filter } from 'lucide-react';
import { JobSearchResult } from '@/services/job-search-service';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Badge } from './ui/badge';
import { handleApplyClick } from '@/services/job-application-service';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';

export default function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState<JobSearchResult[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobSearchResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching saved jobs...');
      const jobs = await getSavedJobs();
      console.log('Fetched saved jobs:', jobs);
      setSavedJobs(jobs);
      setFilteredJobs(jobs);
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
      setError('Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  // Filter jobs when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredJobs(savedJobs);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = savedJobs.filter(job => 
      job.job_title?.toLowerCase().includes(query) || 
      job.employer_name?.toLowerCase().includes(query) ||
      job.job_location?.toLowerCase().includes(query)
    );
    
    setFilteredJobs(filtered);
  }, [searchQuery, savedJobs]);

  const handleRemoveSavedJob = async (jobId: string) => {
    try {
      await removeSavedJob(jobId);
      setSavedJobs(jobs => jobs.filter(job => job.job_id !== jobId));
      // Also update filtered jobs
      setFilteredJobs(jobs => jobs.filter(job => job.job_id !== jobId));
    } catch (err) {
      console.error('Error removing saved job:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-gray-600">Loading your saved jobs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
        <p className="text-red-700 dark:text-red-300">{error}</p>
        <Button variant="outline" onClick={fetchSavedJobs} className="mt-2">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold mb-0 text-gray-800 dark:text-gray-200">
          Your Saved Jobs
        </h2>
        <Button variant="outline" size="sm" onClick={fetchSavedJobs}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <div className="flex items-center gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search saved jobs..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? "bg-gray-100 dark:bg-gray-800" : ""}
        >
          <Filter className="h-4 w-4" />
        </Button>
        <div className="text-sm text-muted-foreground">
          {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {savedJobs.length === 0 ? (
        <Card className="text-center py-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="pt-12">
            <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium mb-2">No saved jobs yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              When you find jobs you're interested in, save them here to apply later or compare offers.
            </p>
          </CardContent>
        </Card>
      ) : filteredJobs.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent className="pt-8">
            <p className="text-gray-500">No saved jobs match your search criteria.</p>
            <Button 
              variant="outline" 
              className="mt-2" 
              onClick={() => setSearchQuery('')}
            >
              Clear Search
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map(job => (
            <JobCard
              key={job.job_id}
              job={job}
              onViewDetails={(job) => setSelectedJob(job)}
              onApplyClick={(job) => handleApplyClick(job)}
            />
          ))}
        </div>
      )}

      {/* Job Detail Modal */}
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
                    {selectedJob.job_highlights.Responsibilities.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => handleRemoveSavedJob(selectedJob.job_id)}
                className="mr-auto"
              >
                Remove from Saved
              </Button>
              <Button variant="outline" onClick={() => setSelectedJob(null)}>
                Close
              </Button>
              <Button onClick={() => handleApplyClick(selectedJob)}>
                Apply Now
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
