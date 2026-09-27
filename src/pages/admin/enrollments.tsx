import { useState } from "react";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnrollmentStore } from "@/lib/enrollment-store";

type Option = { value: string; label: string };

function OptionSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <Select
      items={options}
      value={value}
      onValueChange={(v) => onChange(v as string)}
    >
      <SelectTrigger id={id} className="w-full min-w-0">
        <SelectValue className="min-w-0 truncate" placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-w-[calc(100vw-2rem)]">
        {options.map((o) => (
          <SelectItem
            key={o.value}
            value={o.value}
            className="min-w-0 whitespace-normal break-words py-2 leading-5 [&>span]:min-w-0 [&>span]:shrink [&>span]:whitespace-normal [&>span]:break-words"
          >
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function AdminEnrollmentsPage() {
  const { students, courses, enroll, drop } = useEnrollmentStore();

  const [formCourse, setFormCourse] = useState<string | null>(null);
  const [formStudents, setFormStudents] = useState<string[]>([]);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [mode, setMode] = useState<"course" | "student">("course");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStudent, setFilterStudent] = useState("all");

  // State สำหรับจัดการเปิด/ปิด Combobox และคำค้นหา
  const [isStudentOpen, setIsStudentOpen] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const studentAnchor = useComboboxAnchor();
  const studentOptions: Option[] = students.map((s) => ({
    value: s.studentId,
    label: `${s.studentId} — ${s.firstName} ${s.lastName}`,
  }));
  const courseOptions: Option[] = courses.map((c) => ({
    value: c.courseCode,
    label: `${c.courseCode} — ${c.courseTitle}`,
  }));

  // กรองรายชื่อนักศึกษาตามวิชาที่เลือก และตามคำที่พิมพ์ค้นหา
  const availableStudents = students.filter((s) => {
    // 1. ต้องยังไม่ได้ลงทะเบียนในวิชานี้
    const notEnrolled = formCourse
      ? !s.enrolledCourses.includes(formCourse)
      : true;

    // 2. ตรงกับคำค้นหา (รหัส หรือ ชื่อ-สกุล)
    const fullName =
      `${s.studentId} ${s.firstName} ${s.lastName}`.toLowerCase();
    const matchesQuery = fullName.includes(studentSearchQuery.toLowerCase());

    return notEnrolled && matchesQuery;
  });

  // ฟังก์ชันกดลงทะเบียนทั้งหมดในอาเรย์ formStudents
  const handleEnroll = () => {
    if (!formCourse || formStudents.length === 0) return;
    formStudents.forEach((studentId) => {
      enroll(studentId, formCourse);
    });
    // เคลียร์ค่าและปิด Dialog
    setEnrollDialogOpen(false);
    setFormStudents([]);
    setFormCourse(null);
    setStudentSearchQuery("");
    setIsStudentOpen(false);
  };

  // เคลียร์ฟอร์มเมื่อปิด Dialog
  const handleEnrollDialogOpenChange = (open: boolean) => {
    setEnrollDialogOpen(open);
    if (!open) {
      setFormStudents([]);
      setFormCourse(null);
      setStudentSearchQuery("");
      setIsStudentOpen(false);
    }
  };

  // แปลงโครงสร้างจาก students ให้กลายเป็นรายการรายวิชาทั้งหมดเพื่อเอาไปแสดงในตาราง-----------------------------
  const allCourseRows = courses.map((course) => ({
    courseCode: course.courseCode,
  }));

  const rows = allCourseRows.filter((row) => {
    if (mode === "course") {
      // ถ้าเลือกโหมดวิชา: กรองดูเฉพาะวิชาที่ตรงกับ filterCourse (หรือแสดงทั้งหมดถ้าเป็น "all")
      return filterCourse === "all" || row.courseCode === filterCourse;
    } else {
      // ถ้าเลือกโหมดนักศึกษา: กรองดูเฉพาะวิชาที่นักศึกษาคนนั้น (filterStudent) ลงทะเบียนไว้
      if (filterStudent === "all") return true;

      // ไปหาข้อมูลนศคนนั้นใน state.students แล้วเช็คว่าเขามีลงทะเบียนเรียนวิชานี้อยู่ไหม
      const student = students.find((s) => s.studentId === filterStudent);
      return student ? student.enrolledCourses.includes(row.courseCode) : false;
    }
  });
  //---------------------------------------------------------------------------------------------------
  const nameOf = (studentId: string) => {
    const s = students.find((x) => x.studentId === studentId);
    return s ? `${s.firstName} ${s.lastName}` : "-";
  };
  const titleOf = (courseId: string) =>
    courses.find((c) => c.courseCode === courseId)?.courseTitle ?? "-";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">จัดการการลงทะเบียน</h1>
        <p className="text-sm text-muted-foreground">
          Admin ลงทะเบียนและยกเลิกการลงทะเบียนให้นักศึกษาได้ทุกคน
        </p>
      </div>

      <Dialog
        open={enrollDialogOpen}
        onOpenChange={handleEnrollDialogOpenChange}
      >
        <DialogTrigger render={<Button />}>
          <PlusCircle className="h-4 w-4" />
          ลงทะเบียนให้นักศึกษา
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ลงทะเบียนให้นักศึกษา</DialogTitle>
            <DialogDescription>
              เลือกวิชาก่อน แล้วเลือกนักศึกษาที่ยังไม่ได้ลงทะเบียนวิชานั้น
              (เลือกได้มากกว่า 1 คน)
            </DialogDescription>
          </DialogHeader>
          {/* --------------------------------------------------------------------------- */}
          <div className="grid gap-1.5">
            <Label htmlFor="formCourse">วิชา</Label>
            <OptionSelect
              id="formCourse"
              options={courseOptions}
              value={formCourse}
              placeholder="เลือกวิชา"
              onChange={(v) => {
                setFormCourse(v);
                setFormStudents([]); // รีเซ็ตรายชื่อ นศ เมื่อเปลี่ยนวิชา
                setStudentSearchQuery("");
                setIsStudentOpen(false); // ปิด dropdown นศเมื่อเปลี่ยนวิชา
              }}
            />
          </div>
          {/* --------------------------------------------------------------------------- */}
          <div className="grid gap-4 relative">
            <div className="grid gap-1.5">
              <Label htmlFor="formStudent">นักศึกษา</Label>

              <Combobox
                multiple
                value={formStudents}
                onValueChange={(value) => {
                  setFormStudents(value as string[]);
                  setStudentSearchQuery("");
                }}
                inputValue={studentSearchQuery}
                onInputValueChange={setStudentSearchQuery}
                open={isStudentOpen}
                onOpenChange={setIsStudentOpen}
                items={availableStudents.map((student) => student.studentId)}
                disabled={!formCourse}
              >
                <ComboboxChips ref={studentAnchor} className="w-full">
                  {formStudents.map((id) => {
                    const s = students.find((item) => item.studentId === id);
                    if (!s) return null;
                    return (
                      <ComboboxChip key={id}>
                        {s.firstName} {s.lastName}
                      </ComboboxChip>
                    );
                  })}
                  <ComboboxChipsInput
                    id="formStudent"
                    placeholder={
                      !formCourse
                        ? "เลือกวิชาก่อน"
                        : availableStudents.length === 0
                          ? "นักศึกษาลงทะเบียนวิชานี้ครบทุกคนแล้ว"
                          : formStudents.length === 0
                            ? "ค้นหา/เลือกนักศึกษา"
                            : ""
                    }
                  />
                </ComboboxChips>
                <ComboboxContent anchor={studentAnchor}>
                  <ComboboxList>
                    {availableStudents.map((s) => (
                      <ComboboxItem key={s.studentId} value={s.studentId}>
                        {s.studentId} — {s.firstName} {s.lastName}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                  <ComboboxEmpty>ไม่พบนักศึกษา</ComboboxEmpty>
                </ComboboxContent>
              </Combobox>
            </div>
          </div>
          {/* --------------------------------------------------------------------------- */}
          <DialogFooter>
            <Button
              disabled={formStudents.length === 0 || !formCourse}
              onClick={handleEnroll}
            >
              <PlusCircle className="h-4 w-4" />
              ลงทะเบียน ({formStudents.length} คน)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs
        value={mode}
        onValueChange={(v) => setMode(v as "course" | "student")}
      >
        <TabsList>
          <TabsTrigger value="course">ค้นหาตามวิชา</TabsTrigger>
          <TabsTrigger value="student">ค้นหาตามนักศึกษา</TabsTrigger>
        </TabsList>
        <TabsContent value="course" className="pt-2">
          <OptionSelect
            id="filterCourse"
            options={[{ value: "all", label: "ทุกวิชา" }, ...courseOptions]}
            value={filterCourse}
            onChange={setFilterCourse}
          />
        </TabsContent>
        <TabsContent value="student" className="pt-2">
          <OptionSelect
            id="filterStudent"
            options={[{ value: "all", label: "ทุกคน" }, ...studentOptions]}
            value={filterStudent}
            onChange={setFilterStudent}
          />
        </TabsContent>
      </Tabs>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>จำนวน นศ.</TableHead>
              <TableHead>นักศึกษาที่ลงทะเบียน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-20 text-center text-muted-foreground"
                >
                  ไม่พบข้อมูลการลงทะเบียน
                </TableCell>
              </TableRow>
            )}
            {rows.map((e) => (
              <TableRow key={e.courseCode}>
                <TableCell>{e.courseCode}</TableCell>
                <TableCell>{titleOf(e.courseCode)}</TableCell>

                {/* จำนวน นศ */}
                <TableCell>
                  {
                    students.filter((s) =>
                      s.enrolledCourses.includes(e.courseCode),
                    ).length
                  }
                </TableCell>
                {/* นศที่ลงทะเบียน */}
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {/*เช็คว่าถ้าไม่มี นศ ให้แสดงข้อความสำรอง */}
                    {students.filter((s) =>
                      s.enrolledCourses.includes(e.courseCode),
                    ).length === 0 ? (
                      <span className="text-s text-slate-400">
                        ยังไม่มีนักศึกษาลงทะเบียน
                      </span>
                    ) : (
                      /*ถ้ามี แสดงรายชื่อ Badge ตามปกติ */
                      students
                        .filter((s) => s.enrolledCourses.includes(e.courseCode))
                        .map((student) => (
                          <span
                            key={student.studentId}
                            className="inline-flex items-center gap-1 px-2 py-auto text-xs border-blue-200 bg-blue-50 text-blue-700 rounded-lg border dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
                          >
                            {nameOf(student.studentId)}
                            {/* ปุ่มกากบาทสำหรับกดลบ นศ ออกจากวิชานี้ */}
                            <button
                              type="button"
                              onClick={() =>
                                drop(student.studentId, e.courseCode)
                              }
                              className="ml-1 text-slate-400 hover:text-red-600 font-bold focus:outline-none"
                              title="Remove student from course"
                            >
                              ×
                            </button>
                          </span>
                        ))
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
