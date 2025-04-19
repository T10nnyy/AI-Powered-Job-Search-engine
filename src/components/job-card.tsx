"use client";

import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Bookmark, Building, ExternalLink, MapPin, Clock } from "lucide-react";
import { JobSearchResult } from "@/services/job-search-service";

interface JobProps {
  job: JobSearchResult;
  onViewDetails?: (job: JobSearchResult) => void;
}

export default function JobCard({ job, onViewDetails }: JobProps) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white dark:bg-gray-800">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {job.employer_logo ? (
                  <img
                    src={job.employer_logo}
                    alt={`${job.employer_name} logo`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                  {job.job_title}
                </h3>
                <p className="text-sm text-muted-foreground">{job.employer_name}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Bookmark className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                {job.job_employment_type_text || "Unknown"}
              </Badge>
              {job.job_is_remote && (
                <Badge
                  variant="outline"
                  className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                >
                  Remote
                </Badge>
              )}
              <span className="text-xs text-muted-foreground ml-auto flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {job.job_posted_human_readable}
              </span>
            </div>

            <div>
              <p className="text-sm flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                {job.job_location}
              </p>
              {(job.job_salary || job.job_min_salary || job.job_max_salary) && (
                <p className="text-sm">
                  <span className="font-medium">Salary:</span>{" "}
                  {job.job_salary || 
                   (job.job_min_salary && job.job_max_salary 
                    ? `$${job.job_min_salary} - $${job.job_max_salary}`
                    : "Competitive")}
                </p>
              )}
            </div>

            {job.job_highlights?.Qualifications && (
              <div>
                <p className="text-sm font-medium mb-1">Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {job.job_highlights.Qualifications.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill.length > 30 ? skill.substring(0, 30) + "..." : skill}
                    </Badge>
                  ))}
                  {job.job_highlights.Qualifications.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{job.job_highlights.Qualifications.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 flex justify-between items-center">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onViewDetails && onViewDetails(job)}
          >
            View Details
          </Button>
          <Button 
            size="sm" 
            className="gap-1"
            onClick={() => window.open(job.job_apply_link, "_blank")}
          >
            Apply <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
