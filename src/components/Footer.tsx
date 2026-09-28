import { type FooterProps } from "@/lib/Footer";
export default function Footer({ fullName, studentId }: FooterProps) {
  return (
    <footer className="w-full align-self-end  text-center border-t p-4">
      <p className=" text-center text-xs text-muted-foreground p-4 m-0">
        จัดทำโดย {fullName} — รหัสนักศึกษา {studentId}
      </p>
    </footer>
  );
}
