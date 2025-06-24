import { useQuery } from "@tanstack/react-query";
import { Smartphone, Monitor, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getRecentScreenshots } from "@/lib/screenshot-api";
import { formatDistanceToNow } from "date-fns";

export default function RecentScreenshots() {
  const { toast } = useToast();
  
  const { data: screenshots = [], isLoading } = useQuery({
    queryKey: ["/api/screenshots"],
    queryFn: () => getRecentScreenshots(8),
  });

  const handleDownload = (screenshot: any) => {
    const downloadUrl = `/api/screenshots/${screenshot.id}/download`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${screenshot.title}-${screenshot.deviceType}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download started",
      description: "Your screenshot is being downloaded.",
    });
  };

  if (isLoading) {
    return (
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Screenshots</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="aspect-video bg-gray-200" />
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Recent Screenshots</h2>
        {screenshots.length > 0 && (
          <Button variant="link" className="text-primary hover:text-primary/80">
            View All
          </Button>
        )}
      </div>

      {screenshots.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-48 text-center">
            <p className="text-gray-500 mb-2">No screenshots yet</p>
            <p className="text-sm text-gray-400">
              Start capturing websites to see your history here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {screenshots.map((screenshot) => (
            <Card
              key={screenshot.id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <div
                className="aspect-video p-4"
                style={{ background: screenshot.backgroundColor }}
              >
                <div className="bg-white rounded shadow-lg h-full flex items-center justify-center">
                  <img
                    src={screenshot.screenshotUrl}
                    alt={screenshot.title}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling!.style.display = 'block';
                    }}
                  />
                  <span className="text-gray-500 text-sm hidden">
                    {screenshot.title}
                  </span>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium text-gray-900 truncate">
                  {screenshot.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(screenshot.createdAt), { addSuffix: true })}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {screenshot.deviceType === "mobile" ? (
                      <Smartphone className="w-3 h-3 mr-1" />
                    ) : (
                      <Monitor className="w-3 h-3 mr-1" />
                    )}
                    {screenshot.deviceType}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(screenshot)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
