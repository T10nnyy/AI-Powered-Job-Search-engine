import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, MapPin, Clock, Building } from "lucide-react";
import { JobSearchResult } from "@/services/job-search-service";

interface JobDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobSearchResult;
}

export default function JobDescriptionModal({
  isOpen,
  onClose,
  job,
}: JobDescriptionModalProps) {
  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
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
              <DialogTitle className="text-xl">{job.job_title}</DialogTitle>
              <DialogDescription>{job.employer_name}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4 mr-1" />
              {job.job_location}
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4 mr-1" />
              {job.job_posted_human_readable}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {job.job_employment_type_text || "Not specified"}
            </Badge>
            {job.job_is_remote && <Badge variant="outline">Remote</Badge>}
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-lg font-medium">Job Description</h3>
            <div dangerouslySetInnerHTML={{ __html: job.job_description }} />
          </div>

          {job.job_highlights?.Qualifications && (
            <div>
              <h3 className="text-lg font-medium mb-2">Qualifications</h3>
              <ul className="list-disc pl-5 space-y-1">
                {job.job_highlights.Qualifications.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {job.job_highlights?.Responsibilities && (
            <div>
              <h3 className="text-lg font-medium mb-2">Responsibilities</h3>
              <ul className="list-disc pl-5 space-y-1">
                {job.job_highlights.Responsibilities.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {job.job_highlights?.Benefits && (
            <div>
              <h3 className="text-lg font-medium mb-2">Benefits</h3>
              <ul className="list-disc pl-5 space-y-1">
                {job.job_highlights.Benefits.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={() => window.open(job.job_apply_link, "_blank")}
            className="gap-1"
          >
            Apply Now <ExternalLink className="h-3 w-3" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
