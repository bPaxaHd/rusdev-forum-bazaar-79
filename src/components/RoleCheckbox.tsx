
import React, { useEffect, useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from '@/utils/auth-helpers';

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

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', role)
          .single();
          
        setChecked(!!data);
      } catch (err) {
        console.error(`Error checking if user has role ${role}:`, err);
      } finally {
        setLoading(false);
      }
    };
    
    checkUserRole();
  }, [userId, role]);

  const handleToggle = async (checked: boolean) => {
    setChecked(checked);
    await onToggle(userId, role, checked);
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
