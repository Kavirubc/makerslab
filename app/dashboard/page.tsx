import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PortfolioLinkCard } from "@/components/portfolio-link-card";
import { getDatabase } from "@/lib/mongodb";
import { Project } from "@/lib/models/Project";
import { ProjectLike } from "@/lib/models/ProjectLike";
import { ObjectId } from "mongodb";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Edit,
  FolderKanban,
  Users,
  TrendingUp,
  Heart,
  ExternalLink,
} from "lucide-react";
import { StatsCard } from "@/components/admin/stats-card";
import { ProjectViewsChart } from "@/components/user/charts/project-views-chart";
import { ProjectCreationChart } from "@/components/user/charts/project-creation-chart";
import { UserCategoryChart } from "@/components/user/charts/user-category-chart";
import { UserEngagementChart } from "@/components/user/charts/user-engagement-chart";
import { getUserAnalyticsData } from "@/lib/utils/user-analytics";
import { DashboardDrafts } from "@/components/dashboard-drafts";

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const db = await getDatabase();
  const userId = new ObjectId(session.user.id);

  // Get stats
  const projectsCount = await db
    .collection<Project>("projects")
    .countDocuments({
      userId: userId,
    });

  const collaborationsCount = await db
    .collection<Project>("projects")
    .countDocuments({
      "teamMembers.userId": session.user.id,
      userId: { $ne: userId },
    });

  // Calculate total views and likes across all user's projects
  const totalViewsResult = await db
    .collection<Project>("projects")
    .aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
          totalLikes: { $sum: "$likes" },
        },
      },
    ])
    .toArray();
  const totalViews = totalViewsResult[0]?.totalViews || 0;
  const totalLikes = totalViewsResult[0]?.totalLikes || 0;

  // Get analytics data
  const analytics = await getUserAnalyticsData(session.user.id, 30);

  // Calculate trends for stats cards
  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const previous7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const projectsLast7Days = await db
    .collection<Project>("projects")
    .countDocuments({
      userId: userId,
      createdAt: { $gte: last7Days },
    });
  const projectsPrevious7Days = await db
    .collection<Project>("projects")
    .countDocuments({
      userId: userId,
      createdAt: { $gte: previous7Days, $lt: last7Days },
    });
  const projectGrowthRate =
    projectsPrevious7Days > 0
      ? ((projectsLast7Days - projectsPrevious7Days) / projectsPrevious7Days) *
        100
      : 0;

  // Get recent projects
  const recentProjects = await db
    .collection<Project>("projects")
    .find({ userId: userId })
    .sort({ createdAt: -1 })
    .limit(6)
    .toArray();

  // Get liked projects
  const likedProjectIds = await db
    .collection<ProjectLike>("projectLikes")
    .find({ userId: userId })
    .sort({ createdAt: -1 })
    .limit(6)
    .toArray();

  // Fetch projects and maintain order
  const likedProjects =
    likedProjectIds.length > 0
      ? (
          await db
            .collection<Project>("projects")
            .find({
              _id: { $in: likedProjectIds.map((like) => like.projectId) },
            })
            .toArray()
        ).sort((a, b) => {
          // Maintain the order from likedProjectIds
          const aIndex = likedProjectIds.findIndex(
            (like) => like.projectId.toString() === a._id!.toString()
          );
          const bIndex = likedProjectIds.findIndex(
            (like) => like.projectId.toString() === b._id!.toString()
          );
          return aIndex - bIndex;
        })
      : [];

  // Get base URL - prioritize NEXT_PUBLIC_BASE_URL from .env, fallback to request headers
  let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol =
      headersList.get("x-forwarded-proto") ||
      (host.includes("localhost") ? "http" : "https");
    baseUrl = `${protocol}://${host}`;
  }
  const portfolioUrl = `${baseUrl}/profile/${session.user.id}`;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user.name}!
          </p>
        </div>

        {/* Portfolio Link Card */}
        <PortfolioLinkCard
          userId={session.user.id}
          portfolioUrl={portfolioUrl}
        />

        {/* Drafts Section */}
        <DashboardDrafts />

        {/* Enhanced Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="My Projects"
            value={projectsCount}
            description="Total projects created"
            icon={FolderKanban}
            trend={
              projectsCount > 0
                ? {
                    value: projectGrowthRate,
                    label: "vs last 7 days",
                    isPositive: projectGrowthRate >= 0,
                  }
                : undefined
            }
          />
          <StatsCard
            title="Collaborations"
            value={collaborationsCount}
            description="Projects you're part of"
            icon={Users}
          />
          <StatsCard
            title="Total Views"
            value={totalViews}
            description="Across all projects"
            icon={Eye}
          />
          <StatsCard
            title="Total Likes"
            value={totalLikes}
            description="On your projects"
            icon={TrendingUp}
          />
        </div>

        {/* Charts Grid */}
        {projectsCount > 0 && (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              <ProjectViewsChart data={analytics.projectViews} />
              <ProjectCreationChart data={analytics.projectCreation} />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <UserCategoryChart data={analytics.categoryDistribution} />
              <UserEngagementChart data={analytics.engagement} />
            </div>
          </>
        )}

        {/* Top Projects */}
        {analytics.topProjects.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex justify-between gap-2 md:items-center flex-col md:flex-row">
                <div>
                  <CardTitle>Top Performing Projects</CardTitle>
                  <CardDescription>
                    Your projects with the most views
                  </CardDescription>
                </div>
                <Link href="/projects" className="w-full md:w-fit">
                  <Button variant="outline" size="sm" className="w-full">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors flex-col md:flex-row gap-4"
                  >
                    <div className="flex-1 flex flex-col gap-4">
                      <h3 className="font-semibold mb-1">{project.title}</h3>
                      <div className="flex w-full justify-between md:justify-start md:justify-start md:items-center gap-2 text-sm text-muted-foreground flex-col md:flex-row">
                        <div className="flex justify-start items-start gap-2 w-full md:w-fit">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {project.views} views
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            {project.likes} likes
                          </span>
                        </div>
                        <Badge variant="outline">{project.category}</Badge>
                      </div>
                    </div>
                    <Link
                      href={`/projects/${project.id}`}
                      className="w-full md:w-fit block"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Information */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Your account details</CardDescription>
                </div>
                <Link href="/profile/edit">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Full Name
                </p>
                <p className="text-base">{session.user.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Email
                </p>
                <p className="text-base">{session.user.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Index Number
                </p>
                <p className="text-base">{session.user.indexNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Registration Number
                </p>
                <p className="text-base">{session.user.registrationNumber}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/projects/new" className="block">
                <Button className="w-full" variant="default">
                  <FolderKanban className="h-4 w-4 mr-2" />
                  Create New Project
                </Button>
              </Link>
              <Link href="/projects" className="block">
                <Button className="w-full" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View All Projects
                </Button>
              </Link>
              <Link href="/explore" className="block">
                <Button className="w-full" variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Explore Projects
                </Button>
              </Link>
              <Link href="/settings" className="block">
                <Button className="w-full" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Account Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Liked Projects */}
        {likedProjects.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Liked Projects</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {likedProjects.map((project) => (
                <Card
                  key={project._id!.toString()}
                  className="flex flex-col overflow-hidden"
                >
                  {project.thumbnailUrl && (
                    <div className="relative w-full h-48 bg-muted overflow-hidden">
                      <img
                        src={project.thumbnailUrl}
                        alt={project.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  )}
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
                    <CardTitle className="line-clamp-1">
                      {project.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grow">
                    <div className="flex flex-wrap gap-2 mb-4">
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
                  <CardContent className="pt-0">
                    <Link href={`/projects/${project._id!.toString()}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View Project
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recent Projects */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recent Projects</h2>
            <Link href="/projects">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  No projects yet. Start by creating your first project!
                </p>
                <Link href="/projects/new">
                  <Button>Create Your First Project</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentProjects.map((project) => (
                <Card
                  key={project._id!.toString()}
                  className="flex flex-col overflow-hidden"
                >
                  {project.thumbnailUrl && (
                    <div className="relative w-full h-48 bg-muted overflow-hidden">
                      <img
                        src={project.thumbnailUrl}
                        alt={project.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  )}
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
                    <CardTitle className="line-clamp-1">
                      {project.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grow">
                    <div className="flex flex-wrap gap-2 mb-4">
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
                  <CardContent className="pt-0">
                    <Link href={`/projects/${project._id!.toString()}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View Project
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
