export type Role = 'admin' | 'teacher' | 'student' | 'superadmin' | 'Class Teacher' | 'Subject Teacher';
export type TeacherType = 'class_teacher' | 'subject_teacher' | 'Class Teacher' | 'Subject Teacher';

export type SchoolType = 'Public' | 'Private' | 'Federal Government' | 'State Government' | 'Mission School' | 'Missionary / Faith-Based' | 'Federal / Unity';
export type SchoolLevel = 'JSS Only' | 'SSS Only' | 'JSS & SSS' | 'Primary & Secondary';
export type StudentClass = 'JSS1' | 'JSS2' | 'JSS3' | 'SS1' | 'SS2' | 'SS3';
export type Department = 'Science' | 'Arts' | 'Commercial';

export type SubjectLevel = 'junior' | 'senior' | 'both' | 'Junior' | 'Senior';
export type SubjectCategory = 'core' | 'departmental' | 'elective' | 'Core' | 'Departmental' | 'Elective';

export type SubjectName = string;

export interface RegistrySubject {
  id: string; // e.g. "sub_ENG"
  code: string; // e.g. "ENG"
  name: string; // e.g. "English Language"
  level: SubjectLevel; // 'junior' | 'senior' | 'both'
  category: SubjectCategory; // 'core' | 'departmental' | 'elective'
  departments?: Department[]; // e.g. ['Science', 'Arts'] for senior departmental
  department?: Department;
  activeClasses?: StudentClass[]; // e.g. ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3']
  applicableClasses?: StudentClass[];
  status: 'active' | 'inactive';
  isDefault?: boolean;
  schoolId?: string; // empty for system standard
}

export interface TeacherClassAssignment {
  subjectCode: string;
  subjectName: string;
  studentClass: StudentClass;
}

export interface School {
  id: string; // e.g. SH-HMS001
  code: string;
  name: string;
  type: SchoolType;
  level: SchoolLevel;
  state: string;
  address?: string;
  govRegNumber?: string; // Government approval or registration number
  logoUrl?: string; // Base64 data URL or external URL
  email: string;
  phone?: string;
  motto?: string;
  nextTermBegins?: string;
  enforceFeeClearanceForResults?: boolean;
  createdAt: string;
  status: 'active' | 'suspended';
}

export type ApprovalStatus = 'approved' | 'pending' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: Role;
  teacherType?: TeacherType; // 'class_teacher' or 'subject_teacher'
  schoolId: string;
  verified: boolean;
  approvalStatus?: ApprovalStatus; // For pending teacher/student signups
  approvedBy?: string;
  approvedAt?: string;
  specialty?: string; // primary subject
  assignedSubjects?: string[]; // array of assigned subject names or codes
  assignedClasses?: StudentClass[]; // array of classes taught
  teacherAssignments?: TeacherClassAssignment[]; // fine-grained (e.g. MTH in JSS1, JSS2)
  assignedClass?: StudentClass; // for class teacher e.g. 'SS2'
  studentClass?: StudentClass; // for students
  department?: Department; // for senior students SS1-SS3
  admissionNumber?: string; // e.g. "SH/SS2/2024/0014"
  enrolledSubjects?: string[]; // auto-populated core + departmental, or custom
  joinedAt: string;
  status: 'active' | 'suspended';
}

export type InviteRole = 'teacher' | 'student';
export type InviteStatus = 'active' | 'revoked' | 'expired';

export interface SchoolInvite {
  id: string; // e.g. "inv_xxxx"
  token: string; // Cryptographically random secure token
  schoolId: string;
  role: InviteRole;
  label?: string; // e.g. "Term 1 Faculty Recruitment"
  maxUses?: number; // 0 or undefined for unlimited
  usedCount: number;
  expiresAt?: string; // ISO timestamp string or undefined for never
  status: InviteStatus; // 'active' | 'revoked' | 'expired'
  createdBy: string; // User ID
  createdAt: string;
  revokedAt?: string;
}

export type NewsCategory = 'General' | 'Academic' | 'Sports' | 'Event' | 'Urgent';

export interface Announcement {
  id: string;
  schoolId: string;
  authorId: string;
  authorName: string;
  authorRole: 'admin' | 'teacher';
  title: string;
  category: NewsCategory;
  body: string;
  isPinned: boolean;
  createdAt: string;
}

export type ReportGrade = 'A1' | 'B2' | 'B3' | 'C4' | 'C5' | 'C6' | 'D7' | 'E8' | 'F9';
export type ReportRemark = 'Excellent' | 'Very Good' | 'Good' | 'Credit' | 'Pass' | 'Fail';

export interface SubjectScore {
  subjectCode?: string;
  subject: string;
  ca1Score?: number; // Continuous Assessment 1 (Max 20)
  ca2Score?: number; // Continuous Assessment 2 (Max 20)
  caScore?: number; // Total CA (ca1 + ca2, max 40)
  examScore?: number; // Terminal Exam (Max 60)
  score: number; // Overall Total (0-100)
  grade: ReportGrade;
  remark: ReportRemark | string;
  teacherComment?: string;
  teacherId?: string;
  teacherName?: string;
  updatedAt?: string;
}

export type ResultStatus = 'draft' | 'pending_approval' | 'approved' | 'published';

export interface ReportCard {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  admissionNumber?: string;
  studentClass: StudentClass;
  department?: Department;
  teacherId: string;
  teacherName: string;
  term: '1st Term' | '2nd Term' | '3rd Term';
  session: string; // e.g. "2024/2025"
  position: number;
  subjects: SubjectScore[];
  totalScore: number;
  averageScore: number;
  overallGrade: ReportGrade | string;
  overallRemark: ReportRemark | string;
  attendancePresent: number;
  attendanceAbsent: number;
  attendanceLate: number;
  teacherComment: string;
  principalRemark: string;
  nextTermBegins?: string;
  feeCleared?: boolean;
  status: ResultStatus; // 'draft' | 'pending_approval' | 'approved' | 'published'
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SubjectScoreEntry {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  studentClass: StudentClass;
  subjectCode?: string;
  subject: string;
  term: '1st Term' | '2nd Term' | '3rd Term';
  session: string;
  ca1Score?: number; // 0-20
  ca2Score?: number; // 0-20
  caScore?: number; // 0-40
  examScore?: number; // 0-60
  score: number; // 0-100
  grade: ReportGrade;
  remark: ReportRemark | string;
  teacherComment?: string;
  recordedByTeacherId: string;
  recordedByTeacherName: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  schoolId: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  studentClass: StudentClass;
  title: string;
  instructions: string;
  dueDate: string;
  maxScore: number;
  status: 'open' | 'closed';
  createdAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  content: string;
  submittedAt: string;
  score?: number;
  feedback?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface AttendanceRecord {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  studentClass: StudentClass;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  markedBy: string;
}

export interface TimetableSlot {
  id: string;
  schoolId: string;
  studentClass: StudentClass;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';
  period: number; // 0 to 7 (8 periods)
  time: string;
  subject: string;
  teacherName?: string;
  room?: string;
}

// --- School Fees Types ---
export type PaymentStatus = 'paid' | 'partial' | 'owing';
export type PaymentMethod = 'Bank Transfer' | 'Cash' | 'POS' | 'Online / Card' | 'Bank Draft';

export interface FeeSchedule {
  id: string;
  schoolId: string;
  studentClass: StudentClass;
  term: '1st Term' | '2nd Term' | '3rd Term';
  session: string; // "2024/2025"
  tuitionFee: number;
  developmentLevy?: number;
  examFee?: number;
  ictFee?: number;
  otherCharges?: number;
  totalAmount: number;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeePayment {
  id: string; // Receipt number e.g. "RCP-2025-0012"
  receiptNumber?: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  studentClass: StudentClass;
  term: '1st Term' | '2nd Term' | '3rd Term';
  session: string;
  amountPaid: number;
  balanceAfter?: number;
  paymentDate?: string; // YYYY-MM-DD
  paidAt?: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string; // e.g. "TXN-8392193"
  receivedBy?: string; // Admin or Bursar name
  recordedBy?: string;
  notes?: string;
  createdAt?: string;
}

export interface StudentFeeSummary {
  studentId: string;
  studentName: string;
  studentClass: StudentClass;
  term: '1st Term' | '2nd Term' | '3rd Term';
  session: string;
  totalBilled: number;
  totalPaid: number;
  balance: number;
  status: PaymentStatus;
  payments: FeePayment[];
}
