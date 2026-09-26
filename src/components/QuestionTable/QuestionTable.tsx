import React from "react";
import { Question } from "@/types/Question";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shadcn/ui/table";
import { Button } from "@/shadcn/ui/button";
import { Checkbox } from "@/shadcn/ui/checkbox";
import { Input } from "@/shadcn/ui/input";
import { Textarea } from "@/shadcn/ui/textarea";
import { Label } from "@/shadcn/ui/label";
import questionService from "@/api/services/question.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/ui/dialog";
interface QuestionTableProps {
  questions: Question[];
}
import { useDispatch, useSelector } from "react-redux";
import { checkeQs, uncheckQs } from "@/redux/slices/aptitude";
import { rootState } from "@/redux/store";
import { useToast } from "@/hooks/use-toast";

const QuestionTable: React.FC<QuestionTableProps> = ({ questions }) => {
  const { selectedQuestions } = useSelector(
    (state: rootState) => state.aptitude
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [questionToDelete, setQuestionToDelete] = React.useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editingQuestion, setEditingQuestion] = React.useState<Question | null>(null);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const timestampToDate = (timestamp: string) => {
    const date = new Date(parseInt(timestamp));
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const { toast } = useToast();

  const deleteQs = async (id: number) => {
    console.log("Delete Question with id: ", id);
    try {
      await questionService.deleteQuestion(id);
      toast({
        title: "Success",
        description: "Question Deleted",
      });
      setDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete Question",
        variant: "destructive",
      });
    }
  }

  const handleEdit = (question: Question) => {
    setEditingQuestion({
      ...question,
      options: [...(question.options || [])],
      correct_option: [...(question.correct_option || [])],
    });

    setEditDialogOpen(true);
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;

    try {
      setIsUpdating(true);

      await questionService.updateQuestion(
        Number(editingQuestion.id),
        {
          description: editingQuestion.description,
          options: editingQuestion.options,
          correct_option: editingQuestion.correct_option,
          difficulty_level: editingQuestion.difficulty_level,
          question_type: editingQuestion.question_type,
          format: editingQuestion.format,
          topic_tags: editingQuestion.topic_tags,
        }
      );

      toast({
        title: "Success",
        description: "Question updated successfully",
      });

      setEditDialogOpen(false);
      setEditingQuestion(null);

      window.location.reload();

    } catch (error: any) {
      console.error("Update question error:", error);

      toast({
        title: "Error",
        description: error?.message || "Failed to update question",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const dispatch = useDispatch();

  return (
    <div className="overflow-x-auto">
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <p>Are you sure you want to delete this question?</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => questionToDelete && deleteQs(questionToDelete)}
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>

          {editingQuestion && (
            <div className="flex flex-col gap-4">

              {/* Question */}
              <div>
                <Label>Question</Label>
                <Textarea
                  value={editingQuestion.description}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              {/* Options */}
              <div>
                <Label>Options</Label>

                {editingQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 mt-2"
                  >
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...editingQuestion.options];
                        newOptions[index] = e.target.value;

                        setEditingQuestion({
                          ...editingQuestion,
                          options: newOptions,
                        });
                      }}
                    />

                    <Checkbox
                      checked={editingQuestion.correct_option.includes(index + 1)}
                      onCheckedChange={(checked) => {
                        let newCorrectOptions =
                          editingQuestion.correct_option.filter(
                            (opt) => opt !== index + 1
                          );

                        if (checked) {
                          newCorrectOptions.push(index + 1);
                        }

                        setEditingQuestion({
                          ...editingQuestion,
                          correct_option: newCorrectOptions,
                        });
                      }}
                    />

                    <span className="text-sm">
                      Correct
                    </span>
                  </div>
                ))}
              </div>

              {/* Save */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleUpdateQuestion}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Select</TableHead>
            <TableHead className="min-w-[200px]">Description</TableHead>
            <TableHead className="min-w-[120px]">Type</TableHead>
            <TableHead className="min-w-[120px]">Topics</TableHead>
            <TableHead className="min-w-[100px]">Difficulty</TableHead>
            <TableHead className="min-w-[120px]">Last Used</TableHead>
            <TableHead className="min-w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question) => (
            <TableRow key={question.id}>
              <TableCell>
                <Checkbox
                  checked={selectedQuestions.includes(Number(question?.id))}
                  onCheckedChange={(checked) => {
                    console.log(selectedQuestions);
                    if (checked) {
                      dispatch(checkeQs(Number(question.id)));
                    } else {
                      dispatch(uncheckQs(Number(question.id)));
                    }
                  }}
                />
              </TableCell>
              <TableCell className="font-medium">
                {question.description}
              </TableCell>
              <TableCell>{question.question_type}</TableCell>
              <TableCell>{question.topic_tags}</TableCell>
              <TableCell>{question.difficulty_level}</TableCell>
              <TableCell>
                {question.last_used
                  ? timestampToDate(question.last_used)
                  : "N/A"}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(question)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => {
                      setQuestionToDelete(Number(question.id));
                      setDeleteDialogOpen(true);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default QuestionTable;
