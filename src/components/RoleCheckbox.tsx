
import React, { useEffect, useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from '@/utils/auth-helpers';
import { useToast } from '@/hooks/use-toast';

interface RoleCheckboxProps {
  userId: string;
  role: UserRole;
  label: string;
  description: string;
  onToggle: (userId: string, role: UserRole, checked: boolean) => Promise<void>;
  disabled?: boolean;
  icon?: React.ReactNode;
}

const RoleCheckbox: React.FC<RoleCheckboxProps> = ({
  userId,
  role,
  label,
  description,
  onToggle,
  disabled = false,
  icon
}) => {
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        setLoading(true);
        
        if (!userId) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', role);
          
        if (error) {
          console.error(`Error checking if user has role ${role}:`, error);
          toast({
            title: "Ошибка",
            description: `Не удалось проверить роль ${role}`,
            variant: "destructive"
          });
          return;
        }
        
        setChecked(data && data.length > 0);
      } catch (err) {
        console.error(`Error checking if user has role ${role}:`, err);
      } finally {
        setLoading(false);
      }
    };
    
    checkUserRole();
  }, [userId, role, toast]);

  const handleToggle = async (checked: boolean) => {
    try {
      // First update UI state optimistically
      setChecked(checked);
      // Then call the provided toggle function
      await onToggle(userId, role, checked);
    } catch (error) {
      console.error(`Error toggling role ${role}:`, error);
      // Revert UI state if there was an error
      setChecked(!checked);
      toast({
        title: "Ошибка",
        description: `Не удалось ${checked ? 'назначить' : 'удалить'} роль ${role}`,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-3 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <Label className="font-medium">{label}</Label>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <Switch 
          checked={checked}
          onCheckedChange={handleToggle}
          disabled={disabled || loading}
        />
      </div>
    </Card>
  );
};

export default RoleCheckbox;
