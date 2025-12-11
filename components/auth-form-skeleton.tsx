import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthFormSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader className="space-y-2 pb-6">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-11 w-full" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-11 w-full" />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 pt-6">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </CardFooter>
    </Card>
  );
}
