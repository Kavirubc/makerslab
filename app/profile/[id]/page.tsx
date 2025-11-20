import { notFound } from "next/navigation";
import { getDatabase } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { Project } from "@/lib/models/Project";
import { University } from "@/lib/models/University";
import { ObjectId } from "mongodb";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ContributorBadge } from "@/components/contributor-badge";
import {
  Mail,
  MapPin,
  School,
  Eye,
  Linkedin,
  Github,
  FileText,
  Edit,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    notFound();
  }

  const session = await auth();
  const isOwner = session?.user?.id === id;

  const db = await getDatabase();

  const user = await db.collection<User>("users").findOne({
    _id: new ObjectId(id),
  });

  if (!user) {
    notFound();
  }

  // Get university info
  const university = await db.collection<University>("universities").findOne({
    _id: user.universityId,
  });

  // Get user's public projects
  const projects = await db
    .collection<Project>("projects")
    .find({ userId: new ObjectId(id), isPublic: true })
    .sort({ updatedAt: -1 })
    .toArray();

  const totalViews = projects.reduce((sum, project) => sum + project.views, 0);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className=" shrink-0">
                  <Avatar className="w-32 h-32">
                    <AvatarImage
                      src={user.profilePicture || undefined}
                      alt={user.name}
                    />
                    <AvatarFallback className="text-3xl">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className=" grow space-y-4">
                  <div>
                    <div className="flex items-baseline gap-2 mb-2 flex-col md:flex-row md:items-center md:gap-3">
                      <h1 className="text-3xl font-bold">{user.name}</h1>
                      {/* Contributor badge with glassy styling - aligned with name baseline */}
                      {user.contributorType && (
                        <ContributorBadge
                          contributorType={user.contributorType}
                        />
                      )}
                    </div>
                    {user.bio && (
                      <p className="text-muted-foreground mb-4">{user.bio}</p>
                    )}
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {user.email}
                      </div>
                      {university && (
                        <div className="flex items-center gap-2">
                          <School className="h-4 w-4" />
                          {university.name}
                        </div>
                      )}
                      {university && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {university.district}, {university.province}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div>
                      <p className="text-2xl font-bold">{projects.length}</p>
                      <p className="text-sm text-muted-foreground">Projects</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{totalViews}</p>
                      <p className="text-sm text-muted-foreground">
                        Total Views
                      </p>
                    </div>
                  </div>

                  {/* Social Links and CV */}
                  <div className="flex flex-wrap gap-2">
                    {user.linkedin && (
                      <a
                        href={user.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          <Linkedin className="h-4 w-4 mr-2" />
                          LinkedIn
                        </Button>
                      </a>
                    )}
                    {user.github && (
                      <a
                        href={user.github}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          <Github className="h-4 w-4 mr-2" />
                          GitHub
                        </Button>
                      </a>
                    )}
                    {user.cv && (
                      <a
                        href={user.cv}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Download CV
                        </Button>
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <div className="text-sm">
                      <p className="text-muted-foreground">Index Number</p>
                      <p className="font-medium">{user.indexNumber}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">
                        Registration Number
                      </p>
                      <p className="font-medium">{user.registrationNumber}</p>
                    </div>
                  </div>

                  {isOwner && (
                    <Link href="/profile/edit">
                      <Button variant="outline" className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projects Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Projects Portfolio</h2>

            {projects.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-muted-foreground">
                    This user hasn&apos;t shared any projects yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <Card
                    key={project._id?.toString()}
                    className="flex flex-col hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge
                          variant={
                            project.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {project.status}
                        </Badge>
                        <Badge variant="outline">{project.category}</Badge>
                      </div>
                      <CardTitle className="line-clamp-2">
                        {project.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {project.tags.slice(0, 3).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {project.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{project.tags.length - 3}
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {project.views}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {project.likes || 0}
                        </span>
                        <span>•</span>
                        <span>
                          {project.teamMembers.length} member
                          {project.teamMembers.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </CardContent>
                    <div className="p-6 pt-0">
                      <Link href={`/projects/${project._id}`}>
                        <Button className="w-full">View Project</Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
