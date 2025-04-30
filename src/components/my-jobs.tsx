"use client";

import { useState, useEffect } from 'react';
import { getAppliedJobs, removeAppliedJob, updateApplicationStatus, AppliedJob } from '@/services/applied-jobs-service';
import { 
  Building, 
  Calendar, 
  MapPin, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileEdit, 
  RefreshCcw, 
  ExternalLink 
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { useToast } from './ui/toast';

// Status options with colors
const STATUS_COLORS: Record<string, string> = {
  'Applied': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
  'Interview': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
  'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
  'Offer': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
  'Accepted': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200',
  'Withdrawn': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
};

export default function MyJobs() {
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<AppliedJob | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const { toast } = useToast();
  
  const loadAppliedJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const jobs = await getAppliedJobs();
      setAppliedJobs(jobs);
    } catch (err) {
      console.error('Error loading applied jobs:', err);
      setError('Failed to load your job applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadAppliedJobs();
  }, []);
  
  const handleUpdateStatus = async (jobId: string, status: string) => {
    try {
      await updateApplicationStatus(jobId, status);
      setAppliedJobs(jobs => 
        jobs.map(job => 
          job.job_id === jobId 
            ? {...job, application_status: status} 
            : job
        )
      );
      toast({ 
        message: "Application status updated", 
        type: "success" 
      });
    } catch (error) {
      console.error('Error updating job status:', error);
      toast({ 
        message: "Failed to update status", 
        type: "error" 
      });
    }
  };

  const handleRemoveJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to remove this job application?')) {
      return;
    }
    
    try {
      await removeAppliedJob(jobId);
      setAppliedJobs(jobs => jobs.filter(job => job.job_id !== jobId));
      toast({ 
        message: "Job application removed", 
        type: "info" 
      });
    } catch (error) {
      console.error('Error removing job application:', error);
      toast({ 
        message: "Failed to remove job application", 
        type: "error" 
      });
    }
  };
  
  const openJobDetails = (job: AppliedJob) => {
    setSelectedJob(job);
    setNoteText(job.notes || '');
    setSelectedStatus(job.application_status);
  };
  
  const closeJobDetails = () => {
    setSelectedJob(null);
    setIsEditingNotes(false);
  };
  
  const saveNotes = async () => {
    if (!selectedJob) return;
    
    try {
      await updateApplicationStatus(selectedJob.job_id, selectedStatus, noteText);
      
      // Update the local state
      setAppliedJobs(jobs => 
        jobs.map(job => 
          job.job_id === selectedJob.job_id 
            ? {...job, notes: noteText, application_status: selectedStatus} 
            : job
        )
      );
      
      setIsEditingNotes(false);
      
      toast({ 
        message: "Application updated successfully", 
        type: "success" 
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({ 
        message: "Failed to update application", 
        type: "error" 
      });
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p>Loading your job applications...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
        <p className="text-red-700 dark:text-red-300">{error}</p>
        <Button 
          variant="outline" 
          onClick={loadAppliedJobs} 
          className="mt-2"
        >
          <RefreshCcw className="h-4 w-4 mr-2" /> Try Again
        </Button>
      </div>
    );
  }
  
  if (appliedJobs.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-medium mb-2">No job applications yet</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
          After you apply for jobs, come back here to track your applications and update their status.
        </p>
        <Button>
          Find Jobs to Apply
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Your Job Applications</h2>
          <p className="text-sm text-gray-500">
            Track and manage your job applications
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadAppliedJobs}>
          <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {appliedJobs.map(job => (
          <Card key={job.job_id} className="overflow-hidden hover:shadow-md transition-all">
            <CardHeader className="bg-gray-50 dark:bg-gray-800 pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {job.employer_logo ? (
                      <img
                        src={job.employer_logo}
                        alt={`${job.employer_name} logo`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Building className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-base font-medium line-clamp-1">
                      {job.job_title}
                    </CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {job.employer_name}
                    </p>
                  </div>
                </div>
                <Badge 
                  className={STATUS_COLORS[job.application_status] || STATUS_COLORS['Applied']}
                >
                  {job.application_status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="py-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4 mr-1" />
                  {job.job_location}
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-1" />
                  Applied {new Date(job.applied_at).toLocaleDateString()}
                </div>
                {job.notes && (
                  <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm line-clamp-2">
                    {job.notes}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 dark:bg-gray-800 pt-3 flex justify-between">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleRemoveJob(job.job_id)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remove
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openJobDetails(job)}
              >
                Update Status
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <Dialog open={!!selectedJob} onOpenChange={closeJobDetails}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl">{selectedJob.job_title}</DialogTitle>
              <p className="text-gray-500">{selectedJob.employer_name} · {selectedJob.job_location}</p>
            </DialogHeader>
            
            <div className="space-y-6 mt-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-medium">Application Status</label>
                  <Select 
                    value={selectedStatus} 
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Applied">Applied</SelectItem>
                      <SelectItem value="Interview">Interview</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Offer">Offer</SelectItem>
                      <SelectItem value="Accepted">Accepted</SelectItem>
                      <SelectItem value="Withdrawn">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1 w-full">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Notes</label>
                    {!isEditingNotes && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsEditingNotes(true)}
                      >
                        <FileEdit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                    )}
                  </div>
                  
                  {isEditingNotes ? (
                    <Textarea
                      placeholder="Add notes about your application here..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      rows={4}
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md min-h-[100px]">
                      {selectedJob.notes || "No notes added yet."}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Job Details</h3>
                <div className="prose dark:prose-invert max-h-[200px] overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: selectedJob.job_description }} />
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between gap-2">
              <Button
                variant="outline"
                onClick={() => window.open(selectedJob.job_apply_link, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View Listing
              </Button>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={closeJobDetails}>
                  Cancel
                </Button>
                <Button onClick={saveNotes}>
                  Save Changes
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
