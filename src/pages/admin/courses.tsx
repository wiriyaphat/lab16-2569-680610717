import { useState } from "react";
import { PlusCircle, Trash2, X } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEnrollmentStore } from "@/lib/enrollment-store";

export default function AdminCoursesPage() {
  const { courses, addCourse, removeCourse, removeInstructor } =
    useEnrollmentStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteCode, setDeleteCode] = useState<string | null>(null);
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [instructors, setInstructors] = useState<string[]>([]);
  const [instructorQuery, setInstructorQuery] = useState("");
  const instructorAnchor = useComboboxAnchor();

  const instructorOptions = Array.from(
    new Set(courses.flatMap((course) => course.instructors ?? [])),
  );
  const normalizedCode = courseCode.trim().toUpperCase();
  const duplicateCode = Boolean(
    normalizedCode &&
    courses.some(
      (course) => course.courseCode.toUpperCase() === normalizedCode,
    ),
  );
  const filteredInstructors = instructorOptions.filter((instructor) =>
    instructor.toLowerCase().includes(instructorQuery.toLowerCase()),
  );
  const customInstructor = instructorQuery.trim();
  const canAddCustomInstructor = Boolean(
    customInstructor &&
    !instructorOptions.some(
      (instructor) =>
        instructor.toLowerCase() === customInstructor.toLowerCase(),
    ),
  );
  const instructorItems = [
    ...filteredInstructors,
    ...(canAddCustomInstructor ? [`__new__:${customInstructor}`] : []),
  ];
  const selectedCourse = courses.find(
    (course) => course.courseCode === deleteCode,
  );

  const resetForm = () => {
    setCourseCode("");
    setCourseTitle("");
    setInstructors([]);
    setInstructorQuery("");
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) resetForm();
  };

  const handleCreateCourse = () => {
    const title = courseTitle.trim();
    if (!normalizedCode || !title || !instructors.length || duplicateCode)
      return;

    addCourse({ courseCode: normalizedCode, courseTitle: title, instructors });
    handleDialogChange(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">จัดการวิชาเรียน</h1>
          <p className="text-sm text-muted-foreground">
            {courses.length} วิชา —
            เพิ่มวิชาใหม่ที่นี่แล้วจะไปโผล่เป็นตัวเลือกตอนลงทะเบียนให้นักศึกษาที่หน้า
            "จัดการการลงทะเบียน" ทันที
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger render={<Button />}>
            <PlusCircle className="h-4 w-4" />
            เพิ่มวิชา
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>เพิ่มวิชาใหม่</DialogTitle>
              <DialogDescription>
                วิชาที่เพิ่มจะไปโผล่เป็นตัวเลือกตอนลงทะเบียนให้นักศึกษาทันที
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="courseCode">รหัสวิชา</Label>
                <Input
                  id="courseCode"
                  value={courseCode}
                  onChange={(event) => setCourseCode(event.target.value)}
                  placeholder="เช่น CPE303"
                  aria-invalid={duplicateCode}
                />
                {duplicateCode && (
                  <p className="text-sm text-destructive">
                    มีรหัสวิชา {normalizedCode} นี้แล้ว
                  </p>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="courseTitle">ชื่อวิชา</Label>
                <Input
                  id="courseTitle"
                  value={courseTitle}
                  onChange={(event) => setCourseTitle(event.target.value)}
                  placeholder="เช่น Mobile Application Development"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="instructors">ผู้สอน</Label>
                <Combobox
                  multiple
                  value={instructors}
                  onValueChange={(value) => {
                    const nextValues = (value as string[]).map((item) =>
                      item.startsWith("__new__:")
                        ? item.slice("__new__:".length)
                        : item,
                    );
                    setInstructors(nextValues);
                    setInstructorQuery("");
                  }}
                  inputValue={instructorQuery}
                  onInputValueChange={setInstructorQuery}
                  items={instructorItems}
                >
                  <ComboboxChips ref={instructorAnchor} className="w-full">
                    {instructors.map((instructor) => (
                      <ComboboxChip key={instructor}>{instructor}</ComboboxChip>
                    ))}
                    <ComboboxChipsInput
                      id="instructors"
                      placeholder="เลือกหรือพิมพ์ชื่อผู้สอน (ได้หลายคน)"
                    />
                  </ComboboxChips>
                  <ComboboxContent anchor={instructorAnchor}>
                    <ComboboxList>
                      {filteredInstructors.map((instructor) => (
                        <ComboboxItem key={instructor} value={instructor}>
                          {instructor}
                        </ComboboxItem>
                      ))}
                      {canAddCustomInstructor && (
                        <ComboboxItem value={`__new__:${customInstructor}`}>
                          + เพิ่มผู้สอน &quot;{customInstructor}&quot;
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
            </div>
            <DialogFooter>
              <Button
                disabled={
                  !normalizedCode ||
                  duplicateCode ||
                  !courseTitle.trim() ||
                  !instructors.length
                }
                onClick={handleCreateCourse}
              >
                บันทึก
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-2 overflow-hidden rounded-lg border border-border bg-background">
        <Table>
          <TableHeader className="bg-background">
            <TableRow>
              <TableHead className="h-11 px-3">รหัสวิชา</TableHead>
              <TableHead className="h-11 px-3">ชื่อวิชา</TableHead>
              <TableHead className="h-11 px-3">ผู้สอน</TableHead>
              <TableHead className="h-11 w-20 px-6 text-right">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.courseCode}>
                <TableCell className="px-3 py-3 font-medium">
                  {course.courseCode}
                </TableCell>
                <TableCell className="px-3 py-3">
                  {course.courseTitle}
                </TableCell>
                <TableCell className="px-3 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {course.instructors && course.instructors.length > 0 ? (
                      course.instructors.map((instructor) => (
                        <span
                          key={instructor}
                          className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
                        >
                          {instructor}
                          <button
                            type="button"
                            className="rounded-full outline-none hover:text-blue-950 focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:text-blue-100"
                            aria-label={`ลบผู้สอน ${instructor} ออกจากวิชา ${course.courseCode}`}
                            onClick={() =>
                              removeInstructor(course.courseCode, instructor)
                            }
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        ยังไม่มีผู้สอน
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-7 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`ลบวิชา ${course.courseCode}`}
                    onClick={() => setDeleteCode(course.courseCode)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={deleteCode !== null}
        onOpenChange={(open) => !open && setDeleteCode(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ลบวิชา?</AlertDialogTitle>
            <AlertDialogDescription>
              ลบ {selectedCourse?.courseCode} — {selectedCourse?.courseTitle}{" "}
              ออกจาก รายวิชาที่เปิดสอน
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border bg-muted/50 hover:bg-muted">
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              className="border border-red-200 bg-red-100 text-red-700 hover:bg-red-200 dark:border-red-900 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
              onClick={() => {
                if (deleteCode) removeCourse(deleteCode);
                setDeleteCode(null);
              }}
            >
              ยืนยัน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
