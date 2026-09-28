import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shadcn/ui/table";
import { useParams } from "react-router-dom";
import aptitudeService from "@/api/services/aptitude.service";
import { useToast } from "@/hooks/use-toast";
import PaginationComp from "@/components/pagination/PaginationComp";
import { ApiResponse } from "@/types/Api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/ui/select";
import { Link } from "react-router-dom";
import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";

interface AptitudeResponse {
  id: number;
  regno: string;
  marks: number;
  name: string;
  trade: string | null;
  rank: any;
}

function AptitudeResponses() {
  const [responses, setResponses] = useState<AptitudeResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResponses, setTotalResponses] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const { id } = useParams();

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const response: ApiResponse =
          await aptitudeService.getAptitudeResponses(
            Number(id),
            page,
            itemsPerPage,
            search
          );
        console.log();
        setResponses(response.data.responses);
        setTotalPages(response.data.totalPages);
        setPage(response.data.currentPage);
        setTotalResponses(response.data.totalResponses);
      } catch (error) {
        setResponses([]); // Set empty array on error
        toast({
          title: "Error",
          description: "Failed to fetch responses",
          variant: "destructive",
        });
      }
    };
    fetchResponses();
  }, [id, page, itemsPerPage, search]);

  const handleResetAttempt = async (regno: string) => {
    if (!id) return;

    const confirmed = window.confirm(
      `Reset the aptitude attempt for ${regno}? This will delete their submitted response and allow them to attempt again.`
    );

    if (!confirmed) return;

    try {
      await aptitudeService.resetAptitudeResponse(
        Number(id),
        regno
      );

      toast({
        title: "Attempt Reset",
        description: `Attempt reset successfully for ${regno}`,
      });

      // Remove the student from the current page immediately
      setResponses((prev) =>
        prev.filter((response) => response.regno !== regno)
      );

      setTotalResponses((prev) => prev - 1);
    } catch (error) {
      console.error(error);

      toast({
        title: "Error",
        description: "Failed to reset attempt",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Aptitude Responses</h1>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-2">
          <p className="text-xs sm:text-sm lg:text-base text-gray-600">
            Total Responses: {totalResponses}
          </p>

          <div className="flex items-center gap-3">
            <Input
              placeholder="Search regno, name or trade..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-[220px]"
            />

            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs lg:text-sm text-gray-600">
                Rows per page:
              </span>

              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="25" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="75">75</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-[10px] sm:text-xs lg:text-sm">Registration No.</TableHead>
            <TableHead className="text-[10px] sm:text-xs lg:text-sm">Name</TableHead>
            <TableHead className="text-[10px] sm:text-xs lg:text-sm">Rank</TableHead>
            <TableHead className="text-[10px] sm:text-xs lg:text-sm">Marks</TableHead>
            <TableHead className="text-[10px] sm:text-xs lg:text-sm">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {responses?.map((response) => (
            <TableRow key={response.id}>
              <TableCell className="text-[10px] sm:text-xs lg:text-sm">{response.regno} {response.trade ? '/' + response.trade : ''}</TableCell>
              <TableCell className="text-[10px] sm:text-xs lg:text-sm">{response.name}</TableCell>
              <TableCell className="text-[10px] sm:text-xs lg:text-sm">{response.rank || "_"}</TableCell>
              <TableCell className="text-[10px] sm:text-xs lg:text-sm">{response.marks}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/aptitude/response/${id}?regno=${response.regno}`}
                  >
                    <Button
                      size="sm"
                      className="text-[10px] sm:text-xs lg:text-sm"
                    >
                      View
                    </Button>
                  </Link>

                  <Button
                    size="sm"
                    variant="destructive"
                    className="text-[10px] sm:text-xs lg:text-sm"
                    onClick={() => handleResetAttempt(response.regno)}
                  >
                    Reset
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PaginationComp page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}

export default AptitudeResponses;
