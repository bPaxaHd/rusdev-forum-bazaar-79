
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { NavLink } from "react-router-dom";

interface TechCategoryCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  technologies: string[];
  to: string;
}

const TechCategoryCard: React.FC<TechCategoryCardProps> = ({
  title,
  description,
  icon,
  color,
  technologies,
  to
}) => {
  return (
    <Card className="card-glass overflow-hidden h-full flex flex-col">
      <div className={`h-2 ${color}`}></div>
      <CardContent className="pt-6 flex-grow">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-lg ${color.replace('bg-', 'bg-').replace('500', '100')} ${color.replace('bg-', 'text-')}`}>
            {icon}
          </div>
          <h3 className="text-xl font-medium">{title}</h3>
        </div>
        <p className="text-muted-foreground mb-4">{description}</p>
        
        <div className="flex flex-wrap gap-2">
          {technologies.map((tech, index) => (
            <Badge key={index} variant="secondary" className="text-xs font-normal">
              {tech}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="pt-4 pb-6">
        <NavLink to={to} className="w-full">
          <Button variant="ghost" className="w-full justify-between text-primary">
            Перейти к разделу
            <ArrowRight size={16} />
          </Button>
        </NavLink>
      </CardFooter>
    </Card>
  );
};

export default TechCategoryCard;
