
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { updateComment } from "@/utils/db-helpers";

interface EditCommentDialogProps {
  commentId: string;
  userId: string;
  initialContent: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommentUpdated: () => void;
}

const EditCommentDialog = ({
  commentId,
  userId,
  initialContent,
  open,
  onOpenChange,
  onCommentUpdated
}: EditCommentDialogProps) => {
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Ошибка",
        description: "Комментарий не может быть пустым",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await updateComment(commentId, userId, content);
      
      if (result.success) {
        toast({
          title: "Успешно",
          description: result.message
        });
        onOpenChange(false);
        onCommentUpdated();
      } else {
        toast({
          title: "Ошибка",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при обновлении комментария",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактирование комментария</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[150px]"
            placeholder="Введите комментарий"
          />
          
          <DialogFooter className="mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={loading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCommentDialog;
