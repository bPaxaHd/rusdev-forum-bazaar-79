
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Clock } from "lucide-react";

interface JobCardProps {
  job: {
    id: string;
    company_name: string;
    title: string;
    location: string;
    type: string;
    salary: string | null;
    description: string;
    logo_url: string | null;
    created_at: string;
    requirements: string[];
  };
  onClick: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onClick }) => {
  // Calculate how long ago the job was posted
  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const posted = new Date(timestamp);
    const diffInMs = now.getTime() - posted.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Сегодня";
    if (diffInDays === 1) return "Вчера";
    if (diffInDays < 7) return `${diffInDays} дн. назад`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} нед. назад`;
    return `${Math.floor(diffInDays / 30)} мес. назад`;
  };

  return (
    <div 
      className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="shrink-0">
          <div className="w-16 h-16 bg-muted/50 rounded-md flex items-center justify-center">
            <img 
              src={job.logo_url || "https://via.placeholder.com/80"} 
              alt={job.company_name} 
              className="max-w-full max-h-full"
            />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">{job.title}</h3>
          <p className="text-lg mb-3">{job.company_name}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Briefcase size={14} />
              <span>{job.type}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>Опубликовано {getTimeAgo(job.created_at)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-lg">{job.salary}</span>
            <Button variant="outline">Подробнее</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
