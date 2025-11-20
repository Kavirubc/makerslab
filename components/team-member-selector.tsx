"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { X, Search, UserPlus } from "lucide-react";
import { User } from "@/lib/models/User";
import { useNotification } from "@/lib/hooks/use-notification";

interface TeamMember {
  name: string;
  email: string;
  role: string;
  indexNumber?: string;
  userId?: string; // If they're a registered user
}

interface TeamMemberSelectorProps {
  teamMembers: TeamMember[];
  onChange: (members: TeamMember[]) => void;
  disabled?: boolean;
}

export function TeamMemberSelector({
  teamMembers,
  onChange,
  disabled,
}: TeamMemberSelectorProps) {
  const [mode, setMode] = useState<"search" | "manual">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [role, setRole] = useState("");
  const { success, warning } = useNotification();

  // Manual mode states
  const [manualName, setManualName] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualRole, setManualRole] = useState("");
  const [manualIndex, setManualIndex] = useState("");

  // Search for users
  useEffect(() => {
    if (mode === "search" && searchQuery.length >= 3) {
      const timeoutId = setTimeout(() => {
        searchUsers();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, mode]);

  const searchUsers = async () => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/users/search?email=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      setSearchResults(data.users || []);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleAddSearchedUser = () => {
    if (selectedUser && role.trim()) {
      const newMember: TeamMember = {
        name: selectedUser.name,
        email: selectedUser.email,
        role: role.trim(),
        indexNumber: selectedUser.indexNumber,
        userId: selectedUser._id?.toString(),
      };
      onChange([...teamMembers, newMember]);
      success(`${selectedUser.name} added to team`);
      setSelectedUser(null);
      setRole("");
    } else {
      warning("Please select a user and enter their role");
    }
  };

  const handleAddManualMember = () => {
    if (manualName.trim() && manualEmail.trim() && manualRole.trim()) {
      const newMember: TeamMember = {
        name: manualName.trim(),
        email: manualEmail.trim(),
        role: manualRole.trim(),
        indexNumber: manualIndex.trim() || undefined,
      };
      onChange([...teamMembers, newMember]);
      success(`${manualName.trim()} added to team`);
      setManualName("");
      setManualEmail("");
      setManualRole("");
      setManualIndex("");
    } else {
      warning("Please fill in all required fields");
    }
  };

  const handleRemoveMember = (index: number) => {
    onChange(teamMembers.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex gap-2 flex-col md:flex-row">
        <Button
          type="button"
          variant={mode === "search" ? "default" : "outline"}
          onClick={() => setMode("search")}
          disabled={disabled}
          className="flex-1"
        >
          <Search className="h-4 w-4 mr-2" />
          Search Registered Users
        </Button>
        <Button
          type="button"
          variant={mode === "manual" ? "default" : "outline"}
          onClick={() => setMode("manual")}
          disabled={disabled}
          className="flex-1"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Manually
        </Button>
      </div>

      {/* Search Mode */}
      {mode === "search" && (
        <div className="space-y-4">
          {!selectedUser ? (
            <div className="space-y-2">
              <Label htmlFor="search">Search by Email</Label>
              <div className="relative">
                <Input
                  id="search"
                  type="email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="teammate@stu.ucsc.cmb.ac.lk"
                  disabled={disabled}
                />
                {isSearching && (
                  <div className="absolute right-3 top-2.5 text-muted-foreground text-sm">
                    Searching...
                  </div>
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
                  {searchResults.map((user) => (
                    <button
                      key={user._id?.toString()}
                      type="button"
                      onClick={() => handleSelectUser(user)}
                      className="w-full p-3 hover:bg-accent text-left transition-colors"
                    >
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email} • {user.indexNumber}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery.length >= 3 &&
                searchResults.length === 0 &&
                !isSearching && (
                  <p className="text-sm text-muted-foreground">
                    No users found. Try manual entry instead.
                  </p>
                )}
            </div>
          ) : (
            <div className="space-y-4">
              <Card className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-medium">{selectedUser.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedUser.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedUser.indexNumber}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUser(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role in Project</Label>
                  <Input
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Frontend Developer, Team Lead, etc."
                    disabled={disabled}
                  />
                </div>
              </Card>

              <Button
                type="button"
                onClick={handleAddSearchedUser}
                disabled={!role.trim() || disabled}
                className="w-full"
              >
                Add to Team
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Manual Mode */}
      {mode === "manual" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manualName">Name</Label>
              <Input
                id="manualName"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="John Doe"
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manualEmail">Email</Label>
              <Input
                id="manualEmail"
                type="email"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                placeholder="john@stu.ucsc.cmb.ac.lk"
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manualRole">Role</Label>
              <Input
                id="manualRole"
                value={manualRole}
                onChange={(e) => setManualRole(e.target.value)}
                placeholder="Frontend Developer"
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manualIndex">Index Number (Optional)</Label>
              <Input
                id="manualIndex"
                value={manualIndex}
                onChange={(e) => setManualIndex(e.target.value)}
                placeholder="2022IS031"
                disabled={disabled}
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={handleAddManualMember}
            disabled={
              !manualName.trim() ||
              !manualEmail.trim() ||
              !manualRole.trim() ||
              disabled
            }
            className="w-full"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Team Member
          </Button>
        </div>
      )}

      {/* Team Members List */}
      {teamMembers.length > 0 && (
        <div className="space-y-2">
          <Label>Team Members ({teamMembers.length})</Label>
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-3 border rounded-md"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{member.name}</p>
                  {member.userId && (
                    <Badge variant="secondary" className="text-xs">
                      Registered
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {member.role} • {member.email}
                  {member.indexNumber && ` • ${member.indexNumber}`}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveMember(index)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
