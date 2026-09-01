import {
  School,
  User,
  Announcement,
  ReportCard,
  Assignment,
  Submission,
  AttendanceRecord,
  TimetableSlot,
  RegistrySubject,
  FeeSchedule,
  FeePayment,
  StudentClass,
  Department,
} from './types';

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT (Abuja)', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

export const JUNIOR_CLASSES: StudentClass[] = ['JSS1', 'JSS2', 'JSS3'];
export const SENIOR_CLASSES: StudentClass[] = ['SS1', 'SS2', 'SS3'];
export const ALL_CLASSES: StudentClass[] = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'];

export const DEPARTMENTS: Department[] = ['Science', 'Arts', 'Commercial'];

export const SUBJECT_LIST = [
  'English Language',
  'Mathematics',
  'Civic Education',
  'Agricultural Science',
  'Biology',
  'Chemistry',
  'Physics',
  'Economics',
  'Government',
  'Computer Studies / ICT',
  'Literature in English',
  'Further Mathematics',
];

// Central Standard Subject Registry
export const STANDARD_SUBJECT_REGISTRY: RegistrySubject[] = [
  // --- JUNIOR SECONDARY CORE (Compulsory for JSS 1 - JSS 3) ---
  { id: 'sub_ENG', code: 'ENG', name: 'English Language', level: 'both', category: 'core', activeClasses: ALL_CLASSES, status: 'active' },
  { id: 'sub_MTH', code: 'MTH', name: 'Mathematics', level: 'both', category: 'core', activeClasses: ALL_CLASSES, status: 'active' },
  { id: 'sub_CVE', code: 'CVE', name: 'Civic Education', level: 'both', category: 'core', activeClasses: ALL_CLASSES, status: 'active' },
  { id: 'sub_AGR', code: 'AGR', name: 'Agricultural Science', level: 'both', category: 'core', departments: ['Science'], activeClasses: ALL_CLASSES, status: 'active' },
  { id: 'sub_CRS', code: 'CRS', name: 'Christian Religious Studies', level: 'both', category: 'core', departments: ['Arts'], activeClasses: ALL_CLASSES, status: 'active' },
  { id: 'sub_ICT', code: 'ICT', name: 'Computer Studies / ICT', level: 'both', category: 'core', activeClasses: ALL_CLASSES, status: 'active' },
  { id: 'sub_LIT', code: 'LIT', name: 'Literature in English', level: 'both', category: 'core', departments: ['Arts'], activeClasses: ALL_CLASSES, status: 'active' },
  { id: 'sub_SSTD', code: 'SSTD', name: 'Social Studies', level: 'junior', category: 'core', activeClasses: JUNIOR_CLASSES, status: 'active' },
  { id: 'sub_BSTD', code: 'BSTD', name: 'Business Studies', level: 'junior', category: 'core', activeClasses: JUNIOR_CLASSES, status: 'active' },
  { id: 'sub_BSC', code: 'BSC', name: 'Basic Science', level: 'junior', category: 'core', activeClasses: JUNIOR_CLASSES, status: 'active' },
  { id: 'sub_BTECH', code: 'BTECH', name: 'Basic Technology', level: 'junior', category: 'core', activeClasses: JUNIOR_CLASSES, status: 'active' },
  { id: 'sub_MUS', code: 'MUS', name: 'Music', level: 'junior', category: 'core', activeClasses: JUNIOR_CLASSES, status: 'active' },
  { id: 'sub_HOMEC', code: 'HOMEC', name: 'Home Economics', level: 'junior', category: 'core', activeClasses: JUNIOR_CLASSES, status: 'active' },
  { id: 'sub_CCA', code: 'CCA', name: 'Creative & Cultural Arts', level: 'junior', category: 'core', activeClasses: JUNIOR_CLASSES, status: 'active' },
  { id: 'sub_PHO', code: 'PHO', name: 'Phonics', level: 'both', category: 'core', activeClasses: ALL_CLASSES, status: 'active' },
  { id: 'sub_HIS', code: 'HIS', name: 'History', level: 'both', category: 'core', departments: ['Arts'], activeClasses: ALL_CLASSES, status: 'active' },
  { id: 'sub_PHE', code: 'PHE', name: 'Physical & Health Education', level: 'junior', category: 'core', activeClasses: JUNIOR_CLASSES, status: 'active' },
  { id: 'sub_SEDU', code: 'S/EDU', name: 'Security Education', level: 'junior', category: 'core', activeClasses: JUNIOR_CLASSES, status: 'active' },
  { id: 'sub_FRE', code: 'FRE', name: 'French Language', level: 'both', category: 'core', departments: ['Arts'], activeClasses: ALL_CLASSES, status: 'active' },
  { id: 'sub_YOR', code: 'YOR', name: 'Yoruba Language', level: 'both', category: 'core', activeClasses: ALL_CLASSES, status: 'active' },

  // --- SENIOR SECONDARY DEPARTMENTAL (SS 1 - SS 3) ---
  // Science Department
  { id: 'sub_PHY', code: 'PHY', name: 'Physics', level: 'senior', category: 'departmental', departments: ['Science'], activeClasses: SENIOR_CLASSES, status: 'active' },
  { id: 'sub_CHM', code: 'CHM', name: 'Chemistry', level: 'senior', category: 'departmental', departments: ['Science'], activeClasses: SENIOR_CLASSES, status: 'active' },
  { id: 'sub_BIO', code: 'BIO', name: 'Biology', level: 'senior', category: 'departmental', departments: ['Science'], activeClasses: SENIOR_CLASSES, status: 'active' },
  { id: 'sub_FMA', code: 'FMA', name: 'Further Mathematics', level: 'senior', category: 'departmental', departments: ['Science'], activeClasses: SENIOR_CLASSES, status: 'active' },
  { id: 'sub_GEO', code: 'GEO', name: 'Geography', level: 'senior', category: 'departmental', departments: ['Science', 'Arts'], activeClasses: SENIOR_CLASSES, status: 'active' },
  { id: 'sub_TD', code: 'TD', name: 'Technical Drawing', level: 'senior', category: 'departmental', departments: ['Science'], activeClasses: SENIOR_CLASSES, status: 'active' },

  // Arts Department
  { id: 'sub_GOV', code: 'GOV', name: 'Government', level: 'senior', category: 'departmental', departments: ['Arts', 'Commercial'], activeClasses: SENIOR_CLASSES, status: 'active' },

  // Commercial Department
  { id: 'sub_COM', code: 'COM', name: 'Commerce', level: 'senior', category: 'departmental', departments: ['Commercial'], activeClasses: SENIOR_CLASSES, status: 'active' },
  { id: 'sub_ACC', code: 'ACC', name: 'Financial Accounting', level: 'senior', category: 'departmental', departments: ['Commercial'], activeClasses: SENIOR_CLASSES, status: 'active' },
  { id: 'sub_ECO', code: 'ECO', name: 'Economics', level: 'senior', category: 'departmental', departments: ['Commercial', 'Science', 'Arts'], activeClasses: SENIOR_CLASSES, status: 'active' },
  { id: 'sub_BKP', code: 'BKP', name: 'Book Keeping', level: 'senior', category: 'departmental', departments: ['Commercial'], activeClasses: SENIOR_CLASSES, status: 'active' },
  { id: 'sub_DT', code: 'DT', name: 'Digital Technology', level: 'senior', category: 'departmental', departments: ['Commercial', 'Science'], activeClasses: SENIOR_CLASSES, status: 'active' },
];

export const PERIOD_TIMES = [
  '7:30 - 8:20 AM',
  '8:20 - 9:10 AM',
  '9:10 - 10:00 AM',
  '10:10 - 11:00 AM (Break 10:00)',
  '11:00 - 11:50 AM',
  '11:50 - 12:40 PM',
  '12:40 - 1:30 PM',
  '1:30 - 2:20 PM',
];

export const SEED_SCHOOLS: School[] = [
  {
    id: 'SH-HMS001',
    code: 'SH-HMS001',
    name: 'Harmony Secondary School',
    type: 'Private',
    level: 'JSS & SSS',
    state: 'Lagos',
    address: 'Plot 14, Admiralty Way, Lekki Phase 1, Lagos State',
    email: 'admin@harmonyschool.edu.ng',
    phone: '+234 802 345 6789',
    motto: 'Excellence, Character & Service',
    nextTermBegins: '2025-04-28',
    enforceFeeClearanceForResults: false,
    createdAt: '2025-01-10T08:00:00.000Z',
    status: 'active',
  },
  {
    id: 'SH-FGC002',
    code: 'SH-FGC002',
    name: 'Federal Government College Abuja',
    type: 'Federal Government',
    level: 'JSS & SSS',
    state: 'FCT (Abuja)',
    address: 'Ahmadu Bello Way, Area 11, Garki, Abuja FCT',
    email: 'admin@fgcabuja.edu.ng',
    phone: '+234 803 112 3344',
    motto: 'Pro Unitate (For Unity)',
    nextTermBegins: '2025-04-28',
    enforceFeeClearanceForResults: true,
    createdAt: '2025-01-15T09:30:00.000Z',
    status: 'active',
  },
];

export const SEED_USERS: User[] = [
  {
    id: 'usr_super_root',
    name: 'Super Administrator',
    email: 'elcrest9@gmail.com',
    password: 'bloody7',
    role: 'superadmin',
    schoolId: 'SH-HMS001',
    verified: true,
    joinedAt: '2025-01-01T00:00:00.000Z',
    status: 'active',
  },
  {
    id: 'usr_admin_1',
    name: 'Mrs. Chioma Okafor',
    email: 'admin@harmonyschool.com',
    password: 'Admin123',
    role: 'admin',
    schoolId: 'SH-HMS001',
    verified: true,
    joinedAt: '2025-01-10T08:00:00.000Z',
    status: 'active',
  },
  {
    id: 'usr_teacher_1',
    name: 'Mr. Adeyemi Kolawole',
    email: 'teacher1@schoolhub.com',
    password: 'Teacher123',
    role: 'teacher',
    teacherType: 'subject_teacher',
    schoolId: 'SH-HMS001',
    verified: true,
    specialty: 'Mathematics',
    assignedSubjects: ['Mathematics', 'Physics', 'Further Mathematics'],
    assignedClasses: ['SS1', 'SS2', 'SS3', 'JSS1'],
    teacherAssignments: [
      { subjectCode: 'MTH', subjectName: 'Mathematics', studentClass: 'SS2' },
      { subjectCode: 'MTH', subjectName: 'Mathematics', studentClass: 'SS1' },
      { subjectCode: 'PHY', subjectName: 'Physics', studentClass: 'SS2' },
      { subjectCode: 'FMA', subjectName: 'Further Mathematics', studentClass: 'SS2' },
    ],
    joinedAt: '2025-01-12T10:15:00.000Z',
    status: 'active',
  },
  {
    id: 'usr_teacher_2',
    name: 'Mrs. Ngozi Eze',
    email: 'teacher2@schoolhub.com',
    password: 'Teacher123',
    role: 'teacher',
    teacherType: 'class_teacher',
    assignedClass: 'SS2',
    schoolId: 'SH-HMS001',
    verified: true,
    specialty: 'English Language',
    assignedSubjects: ['English Language', 'Literature in English', 'Phonics'],
    assignedClasses: ['SS2', 'SS1', 'JSS3'],
    teacherAssignments: [
      { subjectCode: 'ENG', subjectName: 'English Language', studentClass: 'SS2' },
      { subjectCode: 'LIT', subjectName: 'Literature in English', studentClass: 'SS2' },
      { subjectCode: 'PHO', subjectName: 'Phonics', studentClass: 'SS2' },
    ],
    joinedAt: '2025-01-13T11:00:00.000Z',
    status: 'active',
  },
  {
    id: 'usr_stud_1',
    name: 'Chukwuemeka Obi',
    email: 'student1@schoolhub.com',
    password: 'Student123',
    role: 'student',
    schoolId: 'SH-HMS001',
    studentClass: 'SS2',
    department: 'Science',
    admissionNumber: 'HSS/2023/0142',
    enrolledSubjects: ['English Language', 'Mathematics', 'Civic Education', 'CRS', 'Phonics', 'Yoruba Language', 'Physics', 'Chemistry', 'Biology', 'Further Mathematics', 'Agricultural Science', 'Geography', 'Technical Drawing'],
    verified: true,
    joinedAt: '2025-01-14T09:00:00.000Z',
    status: 'active',
  },
  {
    id: 'usr_stud_2',
    name: 'Fatima Aliyu',
    email: 'student2@schoolhub.com',
    password: 'Student123',
    role: 'student',
    schoolId: 'SH-HMS001',
    studentClass: 'JSS3',
    admissionNumber: 'HSS/2024/0208',
    enrolledSubjects: ['English Language', 'Mathematics', 'Civic Education', 'Agricultural Science', 'CRS', 'Computer Studies / ICT', 'Social Studies', 'Basic Science', 'Basic Technology', 'French Language'],
    verified: true,
    joinedAt: '2025-01-14T09:20:00.000Z',
    status: 'active',
  },
  {
    id: 'usr_stud_3',
    name: 'Blessing Nwosu',
    email: 'student3@schoolhub.com',
    password: 'Student123',
    role: 'student',
    schoolId: 'SH-HMS001',
    studentClass: 'SS1',
    department: 'Arts',
    admissionNumber: 'HSS/2024/0115',
    enrolledSubjects: ['English Language', 'Mathematics', 'Civic Education', 'CRS', 'Phonics', 'Yoruba Language', 'Literature in English', 'History', 'Government', 'Geography', 'French Language'],
    verified: true,
    joinedAt: '2025-01-14T09:45:00.000Z',
    status: 'active',
  },
  {
    id: 'usr_stud_4',
    name: 'Tunde Bakare',
    email: 'student4@schoolhub.com',
    password: 'Student123',
    role: 'student',
    schoolId: 'SH-HMS001',
    studentClass: 'SS2',
    department: 'Commercial',
    admissionNumber: 'HSS/2023/0089',
    enrolledSubjects: ['English Language', 'Mathematics', 'Civic Education', 'CRS', 'Phonics', 'Yoruba Language', 'Commerce', 'Financial Accounting', 'Economics', 'Book Keeping', 'Government', 'Digital Technology'],
    verified: true,
    joinedAt: '2025-01-14T10:00:00.000Z',
    status: 'active',
  },
];

export const SEED_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann_1',
    schoolId: 'SH-HMS001',
    authorId: 'usr_admin_1',
    authorName: 'Mrs. Chioma Okafor',
    authorRole: 'admin',
    title: 'Mid-Term Examinations & Continuous Assessment Schedule',
    category: 'Academic',
    body: 'Continuous Assessment Tests (CA 1 & CA 2) and Terminal Examinations for the 2024/2025 First Term are underway. All students should ensure continuous assessment portfolios and practicals are submitted to their subject tutors before the portal closing date.',
    isPinned: true,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'ann_2',
    schoolId: 'SH-HMS001',
    authorId: 'usr_teacher_1',
    authorName: 'Mr. Adeyemi Kolawole',
    authorRole: 'teacher',
    title: 'Inter-House Sports Festival Trials This Friday',
    category: 'Sports',
    body: 'Track and field qualifiers for Red, Blue, Green, and Yellow houses will take place on the main sports ground by 2:30 PM this Friday. House captains must submit rosters to the P.E. department by Thursday.',
    isPinned: false,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
];

export const SEED_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg_1',
    schoolId: 'SH-HMS001',
    teacherId: 'usr_teacher_1',
    teacherName: 'Mr. Adeyemi Kolawole',
    subject: 'Mathematics',
    studentClass: 'SS2',
    title: 'Quadratic Equations & Parabolic Modeling Project',
    instructions: 'Complete exercises 4A through 4D on page 78 of Essential Mathematics. Show all working steps clearly, including discriminant analysis and vertex coordinates for all 5 word problems.',
    dueDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    maxScore: 30,
    status: 'open',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'asg_2',
    schoolId: 'SH-HMS001',
    teacherId: 'usr_teacher_2',
    teacherName: 'Mrs. Ngozi Eze',
    subject: 'English Language',
    studentClass: 'SS1',
    title: 'Literary Critique: Themes of Resilience in African Poetry',
    instructions: 'Write a structured 500-word essay comparing the imagery of hardship and triumph in David Diop\'s "Africa" and Gabriel Okara\'s "Piano and Drums".',
    dueDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    maxScore: 20,
    status: 'closed',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

export const SEED_SUBMISSIONS: Submission[] = [
  {
    id: 'sub_1',
    assignmentId: 'asg_1',
    studentId: 'usr_stud_1',
    studentName: 'Chukwuemeka Obi',
    content: 'All 5 quadratic exercises completed. 1. Roots: x=3, -2. Vertex at (0.5, -6.25). 2. Discriminant D=49 > 0 (two real roots). 3. Maximum projectile height reached at t=2.4s (H=28.8m). Detailed derivation attached in draft notes.',
    submittedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    score: 28,
    feedback: 'Excellent work and neat presentation of the discriminant steps!',
  },
];

// Sample Initial Fee Schedules for School
export const SEED_FEE_SCHEDULES: FeeSchedule[] = [
  {
    id: 'fee_sch_jss1',
    schoolId: 'SH-HMS001',
    studentClass: 'JSS1',
    term: '1st Term',
    session: '2024/2025',
    tuitionFee: 65000,
    developmentLevy: 15000,
    examFee: 8000,
    ictFee: 7000,
    otherCharges: 5000,
    totalAmount: 100000,
    dueDate: '2024-11-30',
    createdAt: '2024-09-01T08:00:00.000Z',
  },
  {
    id: 'fee_sch_jss2',
    schoolId: 'SH-HMS001',
    studentClass: 'JSS2',
    term: '1st Term',
    session: '2024/2025',
    tuitionFee: 60000,
    developmentLevy: 10000,
    examFee: 8000,
    ictFee: 7000,
    otherCharges: 5000,
    totalAmount: 90000,
    dueDate: '2024-11-30',
    createdAt: '2024-09-01T08:00:00.000Z',
  },
  {
    id: 'fee_sch_jss3',
    schoolId: 'SH-HMS001',
    studentClass: 'JSS3',
    term: '1st Term',
    session: '2024/2025',
    tuitionFee: 65000,
    developmentLevy: 10000,
    examFee: 12000, // BECE registration
    ictFee: 8000,
    otherCharges: 5000,
    totalAmount: 100000,
    dueDate: '2024-11-30',
    createdAt: '2024-09-01T08:00:00.000Z',
  },
  {
    id: 'fee_sch_ss1',
    schoolId: 'SH-HMS001',
    studentClass: 'SS1',
    term: '1st Term',
    session: '2024/2025',
    tuitionFee: 75000,
    developmentLevy: 15000,
    examFee: 10000,
    ictFee: 10000,
    otherCharges: 10000,
    totalAmount: 120000,
    dueDate: '2024-11-30',
    createdAt: '2024-09-01T08:00:00.000Z',
  },
  {
    id: 'fee_sch_ss2',
    schoolId: 'SH-HMS001',
    studentClass: 'SS2',
    term: '1st Term',
    session: '2024/2025',
    tuitionFee: 75000,
    developmentLevy: 15000,
    examFee: 10000,
    ictFee: 10000,
    otherCharges: 10000,
    totalAmount: 120000,
    dueDate: '2024-11-30',
    createdAt: '2024-09-01T08:00:00.000Z',
  },
  {
    id: 'fee_sch_ss3',
    schoolId: 'SH-HMS001',
    studentClass: 'SS3',
    term: '1st Term',
    session: '2024/2025',
    tuitionFee: 85000,
    developmentLevy: 15000,
    examFee: 30000, // WAEC & NECO
    ictFee: 10000,
    otherCharges: 10000,
    totalAmount: 150000,
    dueDate: '2024-11-30',
    createdAt: '2024-09-01T08:00:00.000Z',
  },
];

export const SEED_FEE_PAYMENTS: FeePayment[] = [
  {
    id: 'RCP-2024-0012',
    schoolId: 'SH-HMS001',
    studentId: 'usr_stud_1',
    studentName: 'Chukwuemeka Obi',
    studentClass: 'SS2',
    term: '1st Term',
    session: '2024/2025',
    amountPaid: 120000,
    paymentDate: '2024-09-18',
    paymentMethod: 'Bank Transfer',
    referenceNumber: 'ZEN/TXN/84920194',
    receivedBy: 'Mrs. Chioma Okafor (Admin)',
    notes: 'Full payment cleared for 1st Term 2024/2025 session.',
    createdAt: '2024-09-18T10:30:00.000Z',
  },
  {
    id: 'RCP-2024-0045',
    schoolId: 'SH-HMS001',
    studentId: 'usr_stud_2',
    studentName: 'Fatima Aliyu',
    studentClass: 'JSS3',
    term: '1st Term',
    session: '2024/2025',
    amountPaid: 60000,
    paymentDate: '2024-09-25',
    paymentMethod: 'POS',
    referenceNumber: 'POS-GTB-492018',
    receivedBy: 'Mrs. Chioma Okafor (Admin)',
    notes: 'First installment payment (Part Payment). Outstanding balance: N40,000.',
    createdAt: '2024-09-25T14:15:00.000Z',
  },
  {
    id: 'RCP-2024-0078',
    schoolId: 'SH-HMS001',
    studentId: 'usr_stud_3',
    studentName: 'Blessing Nwosu',
    studentClass: 'SS1',
    term: '1st Term',
    session: '2024/2025',
    amountPaid: 120000,
    paymentDate: '2024-10-02',
    paymentMethod: 'Online / Card',
    referenceNumber: 'FLW-PAY-983021',
    receivedBy: 'Online Automated Gateway',
    notes: 'School portal online direct debit transaction.',
    createdAt: '2024-10-02T11:00:00.000Z',
  },
  {
    id: 'RCP-2024-0091',
    schoolId: 'SH-HMS001',
    studentId: 'usr_stud_4',
    studentName: 'Tunde Bakare',
    studentClass: 'SS2',
    term: '1st Term',
    session: '2024/2025',
    amountPaid: 50000,
    paymentDate: '2024-10-05',
    paymentMethod: 'Cash',
    referenceNumber: 'CSH-REC-0091',
    receivedBy: 'Mrs. Chioma Okafor (Admin)',
    notes: 'Cash payment deposited at Bursary counter. Balance: N70,000.',
    createdAt: '2024-10-05T09:40:00.000Z',
  },
];

export const SEED_REPORTS: ReportCard[] = [
  {
    id: 'rep_1',
    schoolId: 'SH-HMS001',
    studentId: 'usr_stud_1',
    studentName: 'Chukwuemeka Obi',
    admissionNumber: 'HSS/2023/0142',
    studentClass: 'SS2',
    department: 'Science',
    teacherId: 'usr_teacher_2',
    teacherName: 'Mrs. Ngozi Eze',
    term: '1st Term',
    session: '2024/2025',
    position: 1,
    subjects: [
      { subjectCode: 'MTH', subject: 'Mathematics', ca1Score: 19, ca2Score: 18, caScore: 37, examScore: 54, score: 91, grade: 'A1', remark: 'Excellent', teacherComment: 'Outstanding problem solving skills and analytical acumen.' },
      { subjectCode: 'ENG', subject: 'English Language', ca1Score: 17, ca2Score: 16, caScore: 33, examScore: 51, score: 84, grade: 'A1', remark: 'Excellent', teacherComment: 'Articulate essay writing and strong vocabulary.' },
      { subjectCode: 'PHY', subject: 'Physics', ca1Score: 18, ca2Score: 17, caScore: 35, examScore: 53, score: 88, grade: 'A1', remark: 'Excellent', teacherComment: 'High aptitude in optics, mechanics, and laboratory practicals.' },
      { subjectCode: 'CHM', subject: 'Chemistry', ca1Score: 17, ca2Score: 18, caScore: 35, examScore: 47, score: 82, grade: 'A1', remark: 'Excellent', teacherComment: 'Sound understanding of stoichiometry and organic compounds.' },
      { subjectCode: 'BIO', subject: 'Biology', ca1Score: 16, ca2Score: 15, caScore: 31, examScore: 48, score: 79, grade: 'A1', remark: 'Excellent', teacherComment: 'Very good diagrammatic illustrations and scientific terminology.' },
      { subjectCode: 'FMA', subject: 'Further Mathematics', ca1Score: 18, ca2Score: 16, caScore: 34, examScore: 45, score: 79, grade: 'A1', remark: 'Excellent', teacherComment: 'Mastery in vectors, matrices, and coordinate geometry.' },
      { subjectCode: 'CVE', subject: 'Civic Education', ca1Score: 16, ca2Score: 17, caScore: 33, examScore: 44, score: 77, grade: 'A1', remark: 'Excellent', teacherComment: 'Well grounded in constitutional obligations and civic values.' },
      { subjectCode: 'CRS', subject: 'Christian Religious Studies', ca1Score: 17, ca2Score: 15, caScore: 32, examScore: 44, score: 76, grade: 'A1', remark: 'Excellent', teacherComment: 'Thoughtful engagement with scriptural teachings.' },
    ],
    totalScore: 656,
    averageScore: 82.0,
    overallGrade: 'A1',
    overallRemark: 'Excellent',
    attendancePresent: 58,
    attendanceAbsent: 2,
    attendanceLate: 1,
    teacherComment: 'Chukwuemeka is a brilliant, highly disciplined science scholar who consistently sets a high academic standard for his peers.',
    principalRemark: 'An exemplary and distinguished academic performance. Commendable diligence and character throughout the term.',
    nextTermBegins: '2025-04-28',
    feeCleared: true,
    status: 'published',
    approvedAt: '2025-01-20T10:00:00.000Z',
    approvedBy: 'Mrs. Chioma Okafor',
    createdAt: '2025-01-18T14:00:00.000Z',
  },
  {
    id: 'rep_2',
    schoolId: 'SH-HMS001',
    studentId: 'usr_stud_4',
    studentName: 'Tunde Bakare',
    admissionNumber: 'HSS/2023/0089',
    studentClass: 'SS2',
    department: 'Commercial',
    teacherId: 'usr_teacher_2',
    teacherName: 'Mrs. Ngozi Eze',
    term: '1st Term',
    session: '2024/2025',
    position: 2,
    subjects: [
      { subjectCode: 'MTH', subject: 'Mathematics', ca1Score: 15, ca2Score: 14, caScore: 29, examScore: 42, score: 71, grade: 'B2', remark: 'Very Good' },
      { subjectCode: 'ENG', subject: 'English Language', ca1Score: 16, ca2Score: 15, caScore: 31, examScore: 43, score: 74, grade: 'B2', remark: 'Very Good' },
      { subjectCode: 'COM', subject: 'Commerce', ca1Score: 17, ca2Score: 16, caScore: 33, examScore: 45, score: 78, grade: 'A1', remark: 'Excellent' },
      { subjectCode: 'ACC', subject: 'Financial Accounting', ca1Score: 18, ca2Score: 17, caScore: 35, examScore: 46, score: 81, grade: 'A1', remark: 'Excellent' },
      { subjectCode: 'ECO', subject: 'Economics', ca1Score: 16, ca2Score: 15, caScore: 31, examScore: 42, score: 73, grade: 'B2', remark: 'Very Good' },
      { subjectCode: 'GOV', subject: 'Government', ca1Score: 14, ca2Score: 15, caScore: 29, examScore: 40, score: 69, grade: 'B3', remark: 'Good' },
      { subjectCode: 'CVE', subject: 'Civic Education', ca1Score: 15, ca2Score: 16, caScore: 31, examScore: 39, score: 70, grade: 'B2', remark: 'Very Good' },
    ],
    totalScore: 516,
    averageScore: 73.7,
    overallGrade: 'B2',
    overallRemark: 'Very Good',
    attendancePresent: 55,
    attendanceAbsent: 5,
    attendanceLate: 3,
    teacherComment: 'Tunde demonstrates remarkable acumen in commercial disciplines and double-entry bookkeeping.',
    principalRemark: 'A commendable academic record. Keep up the dedication and strive for the top spot next term.',
    nextTermBegins: '2025-04-28',
    feeCleared: false,
    status: 'published',
    approvedAt: '2025-01-20T10:05:00.000Z',
    approvedBy: 'Mrs. Chioma Okafor',
    createdAt: '2025-01-18T14:10:00.000Z',
  },
];

export function generateSeedAttendance(schoolId: string, students: User[]): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const dates = [
    '2025-01-15', '2025-01-16', '2025-01-17', '2025-01-20', '2025-01-21',
    '2025-01-22', '2025-01-23', '2025-01-24', '2025-01-27', '2025-01-28'
  ];

  students.forEach((student) => {
    dates.forEach((date, i) => {
      let status: 'present' | 'absent' | 'late' = 'present';
      if ((student.id === 'usr_stud_4' && i === 3) || (student.id === 'usr_stud_2' && i === 7)) {
        status = 'absent';
      } else if (i === 5) {
        status = 'late';
      }
      records.push({
        id: `att_${student.id}_${date}`,
        schoolId,
        studentId: student.id,
        studentName: student.name,
        studentClass: student.studentClass || 'SS2',
        date,
        status,
        markedBy: 'Mrs. Ngozi Eze',
      });
    });
  });

  return records;
}

export function generateSeedTimetable(schoolId: string): TimetableSlot[] {
  const days: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri')[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const subjects = ['Mathematics', 'English Language', 'Physics / Literature', 'Chemistry / Accounting', 'Civic Education', 'Biology / Commerce', 'ICT / Computer Studies', 'Physical Education'];
  const slots: TimetableSlot[] = [];

  days.forEach((day) => {
    subjects.forEach((subj, period) => {
      slots.push({
        id: `tt_${schoolId}_SS2_${day}_${period}`,
        schoolId,
        studentClass: 'SS2',
        day,
        period,
        time: PERIOD_TIMES[period],
        subject: subj,
        teacherName: period % 2 === 0 ? 'Mr. Adeyemi Kolawole' : 'Mrs. Ngozi Eze',
        room: `Room SS2-${day}`,
      });
    });
  });

  return slots;
}
