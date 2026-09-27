import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  students as initialStudents,
  courses as initialCourses,
} from "@/lib/mock-data";
import type { Course, Student } from "@/lib/types";

type EnrollmentStore = {
  students: Student[];
  courses: Course[];

  /** เพิ่มรายวิชาใหม่ */
  addCourse: (course: Course) => void;
  /** ลบผู้สอนออกจากรายวิชา */
  removeInstructor: (courseCode: string, instructor: string) => void;
  /** Admin ลงทะเบียนวิชาให้นักศึกษาคนใดก็ได้ (ไม่ซ้ำกับที่มีอยู่แล้ว) */
  enroll: (studentId: string, courseCode: string) => void;
  /** Admin ยกเลิกการลงทะเบียนของนักศึกษาคนใดก็ได้ */
  drop: (studentId: string, courseCode: string) => void;
  /** ลบนักศึกษา พร้อมการลงทะเบียนทั้งหมดของคนนั้น */
  removeStudent: (studentId: string) => void;
  /** ลบวิชาออกจากรายวิชาที่เปิดสอน พร้อม cascade ลบ enrollment ที่อ้างถึงวิชานั้นทั้งหมด */
  removeCourse: (courseCode: string) => void;
};

export const useEnrollmentStore = create<EnrollmentStore>()(
  persist(
    (set) => ({
      students: initialStudents,
      courses: initialCourses,

      addCourse: (course) =>
        set((state) => ({
          courses: [...state.courses, course],
        })),

      removeInstructor: (courseCode, instructor) =>
        set((state) => ({
          courses: state.courses.map((course) =>
            course.courseCode === courseCode
              ? {
                  ...course,
                  instructors: course.instructors?.filter(
                    (name) => name !== instructor,
                  ),
                }
              : course,
          ),
        })),

      enroll: (studentId, courseCode) =>
        set((state) => ({
          students: state.students.map((student) => {
            if (
              student.studentId === studentId &&
              !student.enrolledCourses.includes(courseCode)
            ) {
              return {
                ...student,
                enrolledCourses: [...student.enrolledCourses, courseCode],
              };
            }
            return student;
          }),
        })),

      drop: (studentId, courseCode) =>
        set((state) => ({
          students: state.students.map((student) => {
            if (student.studentId === studentId) {
              return {
                ...student,
                enrolledCourses: student.enrolledCourses.filter(
                  (code) => code !== courseCode,
                ),
              };
            }
            return student;
          }),
        })),

      removeStudent: (studentId) =>
        set((state) => ({
          students: state.students.filter((s) => s.studentId !== studentId),
        })),

      removeCourse: (courseCode) =>
        set((state) => ({
          courses: state.courses.filter((c) => c.courseCode !== courseCode),
          students: state.students.map((student) => ({
            ...student,
            enrolledCourses: student.enrolledCourses.filter(
              (code) => code !== courseCode,
            ),
          })),
        })),
    }),
    {
      name: "lab16-2569-680610717",
      partialize: (state) => ({
        students: state.students,
        courses: state.courses,
      }),
    },
  ),
);
