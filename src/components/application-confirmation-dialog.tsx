import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle } from "lucide-react";
import { JobSearchResult } from "@/services/job-search-service";
import { trackJobApplication } from "@/services/applied-jobs-service";
import { useToast } from "./ui/toast";
import { markJobAsDismissed } from "@/services/job-application-service";

interface ApplicationConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobSearchResult;
}

export default function ApplicationConfirmationDialog({
  isOpen,
  onClose,
  job
}: ApplicationConfirmationDialogProps) {
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleConfirmApplication = async () => {
    try {
      setSaving(true);
      await trackJobApplication(job, notes);
      toast({ 
        message: "Job application tracked successfully!", 
        type: "success" 
      });
      onClose();
    } catch (error) {
      console.error("Error tracking job application:", error);
      toast({ 
        message: "Failed to track job application", 
        type: "error" 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDismiss = () => {
    // Mark this job as dismissed so we don't show the dialog again
    markJobAsDismissed(job.job_id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Did you apply for this job?
          </DialogTitle>
          <DialogDescription>
            If you applied to "{job.job_title}" at {job.employer_name}, 
            we can help you track your application.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm font-medium">Add notes about your application (optional):</p>
          <Textarea 
            placeholder="E.g., Applied through company website, used resume version 2, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={handleDismiss}
          >
            I didn't apply
          </Button>
          <Button
            onClick={handleConfirmApplication}
            disabled={saving}
          >
            {saving ? "Saving..." : "Yes, I applied"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
