"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { X } from "lucide-react";

export default function FilterPanel() {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const addFilter = (filter: string) => {
    if (!selectedFilters.includes(filter)) {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };

  const removeFilter = (filter: string) => {
    setSelectedFilters(selectedFilters.filter((f) => f !== filter));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Filters
      </h3>

      {/* Selected filters */}
      {selectedFilters.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">
            Selected filters:
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedFilters.map((filter) => (
              <Badge
                key={filter}
                variant="secondary"
                className="flex items-center gap-1 px-3 py-1"
              >
                {filter}
                <button onClick={() => removeFilter(filter)} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Job Type */}
      <div className="mb-4">
        <p className="text-sm font-medium mb-2 text-gray-800 dark:text-gray-200">
          Job Type
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            "Full-time",
            "Part-time",
            "Contract",
            "Freelance",
            "Internship",
          ].map((type) => (
            <Button
              key={type}
              variant={selectedFilters.includes(type) ? "default" : "outline"}
              size="sm"
              onClick={() =>
                selectedFilters.includes(type)
                  ? removeFilter(type)
                  : addFilter(type)
              }
              className="text-xs"
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Experience Level */}
      <div className="mb-4">
        <p className="text-sm font-medium mb-2 text-gray-800 dark:text-gray-200">
          Experience Level
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            "Entry Level",
            "Mid Level",
            "Senior Level",
            "Director",
            "Executive",
          ].map((level) => (
            <Button
              key={level}
              variant={selectedFilters.includes(level) ? "default" : "outline"}
              size="sm"
              onClick={() =>
                selectedFilters.includes(level)
                  ? removeFilter(level)
                  : addFilter(level)
              }
              className="text-xs"
            >
              {level}
            </Button>
          ))}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Salary Range */}
      <div className="mb-4">
        <p className="text-sm font-medium mb-2 text-gray-800 dark:text-gray-200">
          Salary Range
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Min" type="number" className="text-sm" />
          <Input placeholder="Max" type="number" className="text-sm" />
        </div>
      </div>

      <Separator className="my-4" />

      {/* Location */}
      <div className="mb-4">
        <p className="text-sm font-medium mb-2 text-gray-800 dark:text-gray-200">
          Location
        </p>
        <Input
          placeholder="City, state, or zip code"
          className="mb-2 text-sm"
        />
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant={selectedFilters.includes("Remote") ? "default" : "outline"}
            size="sm"
            onClick={() =>
              selectedFilters.includes("Remote")
                ? removeFilter("Remote")
                : addFilter("Remote")
            }
            className="text-xs"
          >
            Remote
          </Button>
          <Button
            variant={selectedFilters.includes("Hybrid") ? "default" : "outline"}
            size="sm"
            onClick={() =>
              selectedFilters.includes("Hybrid")
                ? removeFilter("Hybrid")
                : addFilter("Hybrid")
            }
            className="text-xs"
          >
            Hybrid
          </Button>
          <Button
            variant={
              selectedFilters.includes("On-site") ? "default" : "outline"
            }
            size="sm"
            onClick={() =>
              selectedFilters.includes("On-site")
                ? removeFilter("On-site")
                : addFilter("On-site")
            }
            className="text-xs"
          >
            On-site
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={() => setSelectedFilters([])}>
          Clear All
        </Button>
        <Button>Apply Filters</Button>
      </div>
    </div>
  );
}
