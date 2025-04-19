"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Edit, Save } from "lucide-react";

interface ProfileProps {
  user: any;
}

export default function Profile({ user }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.email?.split("@")[0] || "User",
    email: user?.email || "user@example.com",
    location: "San Francisco, CA",
    title: "Software Engineer",
    skills: ["JavaScript", "React", "Node.js", "TypeScript"],
    experience: "5 years",
    education: "Bachelor's in Computer Science",
    bio: "Passionate software engineer with experience in full-stack development.",
  });

  const handleSave = () => {
    // Here you would typically save the profile data to your backend
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Profile Information
        </h2>
        <Button
          variant="outline"
          onClick={() => setIsEditing(!isEditing)}
          className="hover:scale-105 transition-transform"
        >
          {isEditing ? (
            <>
              <Save className="mr-2 h-4 w-4" /> Save
            </>
          ) : (
            <>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </>
          )}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <Card className="overflow-hidden">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="mb-4 mt-2">
                <Avatar className="h-24 w-24 hover:scale-105 transition-transform">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {profileData.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {profileData.email}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {profileData.location}
              </p>
              <p className="text-md font-medium mt-2 text-gray-800 dark:text-gray-200">
                {profileData.title}
              </p>

              <div className="mt-4 w-full">
                <h4 className="text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">
                  Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-2/3">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            email: e.target.value,
                          })
                        }
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            location: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        id="title"
                        value={profileData.title}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      className="w-full min-h-[100px] p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData({ ...profileData, bio: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSave}>Save Changes</Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                        Bio
                      </h4>
                      <p className="mt-1 text-gray-800 dark:text-gray-200">
                        {profileData.bio}
                      </p>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                          Experience
                        </h4>
                        <p className="mt-1 text-gray-800 dark:text-gray-200">
                          {profileData.experience}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                          Education
                        </h4>
                        <p className="mt-1 text-gray-800 dark:text-gray-200">
                          {profileData.education}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
