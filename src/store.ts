import {
  School,
  User,
  Announcement,
  ReportCard,
  Assignment,
  Submission,
  AttendanceRecord,
  TimetableSlot,
  SubjectScore,
  SubjectScoreEntry,
  StudentClass,
  Department,
  RegistrySubject,
  FeeSchedule,
  FeePayment,
  StudentFeeSummary,
  ReportGrade,
  ReportRemark,
  ResultStatus,
  TeacherClassAssignment,
  SchoolInvite,
  InviteRole,
  InviteStatus,
  ApprovalStatus,
} from './types';
import {
  SEED_SCHOOLS,
  SEED_USERS,
  SEED_ANNOUNCEMENTS,
  SEED_ASSIGNMENTS,
  SEED_SUBMISSIONS,
  SEED_REPORTS,
  SEED_FEE_SCHEDULES,
  SEED_FEE_PAYMENTS,
  STANDARD_SUBJECT_REGISTRY,
  generateSeedAttendance,
  generateSeedTimetable,
} from './seed';

const STORAGE_KEYS = {
  SEEDED: 'schoolhub_seeded',
  SCHOOLS: 'schoolhub_schools',
  USERS: 'schoolhub_users',
  CURRENT_USER: 'schoolhub_current_user',
  ANNOUNCEMENTS: 'schoolhub_announcements',
  REPORTS: 'schoolhub_reports',
  SUBJECT_SCORES: 'schoolhub_subject_scores',
  SUBJECT_REGISTRY: 'schoolhub_subject_registry',
  FEE_SCHEDULES: 'schoolhub_fee_schedules',
  FEE_PAYMENTS: 'schoolhub_fee_payments',
  ASSIGNMENTS: 'schoolhub_assignments',
  SUBMISSIONS: 'schoolhub_submissions',
  ATTENDANCE: 'schoolhub_attendance',
  TIMETABLE: 'schoolhub_timetable',
  INVITES: 'schoolhub_invites',
  LAST_EMAIL: 'schoolhub_last_email',
  PLATFORM_NAME: 'schoolhub_platform_name',
  MAINTENANCE_MODE: 'schoolhub_maintenance_mode',
};

export class Store {
  private static instance: Store;

  private constructor() {
    this.initStore();
  }

  public static getInstance(): Store {
    if (!Store.instance) {
      Store.instance = new Store();
    }
    return Store.instance;
  }

  public initStore(): void {
    let schools = this.getItem<School[]>(STORAGE_KEYS.SCHOOLS, []);
    let users = this.getItem<User[]>(STORAGE_KEYS.USERS, []);

    if (schools.length === 0) {
      this.setItem(STORAGE_KEYS.SCHOOLS, SEED_SCHOOLS);
      schools = SEED_SCHOOLS;
    }

    if (users.length === 0) {
      this.setItem(STORAGE_KEYS.USERS, SEED_USERS);
      users = SEED_USERS;
    } else {
      // Ensure superadmin user is always present and updated
      const superAdminIndex = users.findIndex((u) => u.email.toLowerCase() === 'elcrest9@gmail.com');
      if (superAdminIndex === -1) {
        users.unshift({
          id: 'usr_super_root',
          name: 'Super Administrator',
          email: 'elcrest9@gmail.com',
          password: 'bloody7',
          role: 'superadmin',
          schoolId: 'SH-HMS001',
          verified: true,
          joinedAt: '2025-01-01T00:00:00.000Z',
          status: 'active',
        });
        this.setItem(STORAGE_KEYS.USERS, users);
      } else {
        // Ensure credentials match
        users[superAdminIndex].password = 'bloody7';
        users[superAdminIndex].role = 'superadmin';
        users[superAdminIndex].status = 'active';
        this.setItem(STORAGE_KEYS.USERS, users);
      }
    }

    const announcements = this.getItem<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, []);
    if (announcements.length === 0) {
      this.setItem(STORAGE_KEYS.ANNOUNCEMENTS, SEED_ANNOUNCEMENTS);
    }

    const assignments = this.getItem<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, []);
    if (assignments.length === 0) {
      this.setItem(STORAGE_KEYS.ASSIGNMENTS, SEED_ASSIGNMENTS);
    }

    const submissions = this.getItem<Submission[]>(STORAGE_KEYS.SUBMISSIONS, []);
    if (submissions.length === 0) {
      this.setItem(STORAGE_KEYS.SUBMISSIONS, SEED_SUBMISSIONS);
    }

    const reports = this.getItem<ReportCard[]>(STORAGE_KEYS.REPORTS, []);
    if (reports.length === 0) {
      this.setItem(STORAGE_KEYS.REPORTS, SEED_REPORTS);
    }

    const feeSchedules = this.getItem<FeeSchedule[]>(STORAGE_KEYS.FEE_SCHEDULES, []);
    if (feeSchedules.length === 0) {
      this.setItem(STORAGE_KEYS.FEE_SCHEDULES, SEED_FEE_SCHEDULES);
    }

    const feePayments = this.getItem<FeePayment[]>(STORAGE_KEYS.FEE_PAYMENTS, []);
    if (feePayments.length === 0) {
      this.setItem(STORAGE_KEYS.FEE_PAYMENTS, SEED_FEE_PAYMENTS);
    }

    const attendance = this.getItem<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, []);
    if (attendance.length === 0) {
      const students = users.filter((u) => u.role === 'student');
      this.setItem(STORAGE_KEYS.ATTENDANCE, generateSeedAttendance('SH-HMS001', students));
    }

    const timetable = this.getItem<TimetableSlot[]>(STORAGE_KEYS.TIMETABLE, []);
    if (timetable.length === 0) {
      this.setItem(STORAGE_KEYS.TIMETABLE, generateSeedTimetable('SH-HMS001'));
    }

    // Ensure subject registry is always loaded with standard subjects
    const subjects = this.getItem<RegistrySubject[]>(STORAGE_KEYS.SUBJECT_REGISTRY, []);
    if (subjects.length === 0) {
      this.setItem(STORAGE_KEYS.SUBJECT_REGISTRY, STANDARD_SUBJECT_REGISTRY);
    }

    if (!localStorage.getItem(STORAGE_KEYS.PLATFORM_NAME)) {
      localStorage.setItem(STORAGE_KEYS.PLATFORM_NAME, 'SchoolHub');
    }
    if (!localStorage.getItem(STORAGE_KEYS.MAINTENANCE_MODE)) {
      localStorage.setItem(STORAGE_KEYS.MAINTENANCE_MODE, 'false');
    }
    localStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
  }

  // --- Helpers ---
  public getItem<T>(key: string, defaultVal: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  public setItem<T>(key: string, val: T): void {
    localStorage.setItem(key, JSON.stringify(val));
  }

  // --- Auth & Current User ---
  public getCurrentUser(): User | null {
    return this.getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  public setCurrentUser(user: User | null): void {
    if (user) {
      this.setItem(STORAGE_KEYS.CURRENT_USER, user);
      localStorage.setItem(STORAGE_KEYS.LAST_EMAIL, user.email);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  public getLastEmail(): string {
    return localStorage.getItem(STORAGE_KEYS.LAST_EMAIL) || '';
  }

  // --- Schools ---
  public getSchools(): School[] {
    return this.getItem<School[]>(STORAGE_KEYS.SCHOOLS, []);
  }

  public getSchoolById(id: string): School | undefined {
    return this.getSchools().find((s) => s.id === id || s.code === id);
  }

  public addSchool(school: School): void {
    const list = this.getSchools();
    list.unshift(school);
    this.setItem(STORAGE_KEYS.SCHOOLS, list);

    // Initialize default fee schedules for JSS1-SS3
    const classes: StudentClass[] = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'];
    const currentSchedules = this.getFeeSchedules(school.id);
    if (currentSchedules.length === 0) {
      const defaultSchedules: FeeSchedule[] = classes.map((c) => ({
        id: `fee_${school.id}_${c}`,
        schoolId: school.id,
        studentClass: c,
        term: '1st Term',
        session: '2024/2025',
        tuitionFee: c.startsWith('SS') ? 75000 : 60000,
        developmentLevy: 15000,
        examFee: 10000,
        ictFee: 10000,
        otherCharges: 5000,
        totalAmount: c.startsWith('SS') ? 115000 : 95000,
        dueDate: '2024-11-30',
        createdAt: new Date().toISOString(),
      }));
      const allSchedules = this.getItem<FeeSchedule[]>(STORAGE_KEYS.FEE_SCHEDULES, []);
      allSchedules.push(...defaultSchedules);
      this.setItem(STORAGE_KEYS.FEE_SCHEDULES, allSchedules);
    }

    // Initialize timetable shell for the new school
    const currentTimetable = this.getTimetable(school.id);
    if (currentTimetable.length === 0) {
      const generatedTt = generateSeedTimetable(school.id);
      const allTt = this.getItem<TimetableSlot[]>(STORAGE_KEYS.TIMETABLE, []);
      allTt.push(...generatedTt);
      this.setItem(STORAGE_KEYS.TIMETABLE, allTt);
    }
  }

  public updateSchool(id: string, updates: Partial<School>): void {
    const list = this.getSchools().map((s) => (s.id === id ? { ...s, ...updates } : s));
    this.setItem(STORAGE_KEYS.SCHOOLS, list);
  }

  public deleteSchool(id: string): void {
    const list = this.getSchools().filter((s) => s.id !== id && s.code !== id);
    this.setItem(STORAGE_KEYS.SCHOOLS, list);
    const users = this.getUsers().filter((u) => u.schoolId !== id);
    this.setItem(STORAGE_KEYS.USERS, users);
  }

  // --- Users ---
  public getUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS, []);
  }

  public getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.getUsers().find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  public addUser(user: User): void {
    const list = this.getUsers();
    // Auto populate enrolled subjects for students if not explicitly set
    if (user.role === 'student' && user.studentClass && (!user.enrolledSubjects || user.enrolledSubjects.length === 0)) {
      user.enrolledSubjects = this.resolveStudentSubjects(user.studentClass, user.department);
    }
    // Auto generate admission number if not provided
    if (user.role === 'student' && !user.admissionNumber) {
      const year = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      user.admissionNumber = `SCH/${user.studentClass || 'STU'}/${year}/${rand}`;
    }
    list.push(user);
    this.setItem(STORAGE_KEYS.USERS, list);
  }

  public updateUser(id: string, updates: Partial<User>): void {
    const list = this.getUsers().map((u) => {
      if (u.id === id) {
        const updated = { ...u, ...updates };
        // If department or class changed, update enrolled subjects if not customized
        if (updated.role === 'student' && (updates.department !== undefined || updates.studentClass !== undefined)) {
          if (!updates.enrolledSubjects) {
            updated.enrolledSubjects = this.resolveStudentSubjects(updated.studentClass || 'SS1', updated.department);
          }
        }
        return updated;
      }
      return u;
    });
    this.setItem(STORAGE_KEYS.USERS, list);

    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === id) {
      this.setCurrentUser({ ...currentUser, ...updates });
    }
  }

  public deleteUser(id: string): void {
    const list = this.getUsers().filter((u) => u.id !== id);
    this.setItem(STORAGE_KEYS.USERS, list);
  }

  // --- Pending Approvals & User Verification ---
  public getPendingUsers(schoolId: string): User[] {
    return this.getUsers().filter(
      (u) => u.schoolId === schoolId && u.approvalStatus === 'pending'
    );
  }

  public approveUser(userId: string, approvedBy?: string): User | null {
    const user = this.getUserById(userId);
    if (!user) return null;
    this.updateUser(userId, {
      approvalStatus: 'approved',
      approvedBy,
      approvedAt: new Date().toISOString(),
      status: 'active',
      verified: true,
    });
    return this.getUserById(userId) || null;
  }

  public rejectUser(userId: string): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;
    this.updateUser(userId, {
      approvalStatus: 'rejected',
      status: 'suspended',
    });
    return true;
  }

  // --- School Invites (Teacher & Student Onboarding Links) ---
  public getInvites(schoolId?: string): SchoolInvite[] {
    const list = this.getItem<SchoolInvite[]>(STORAGE_KEYS.INVITES, []);
    if (!schoolId) return list;
    return list.filter((inv) => inv.schoolId === schoolId);
  }

  public getInviteById(id: string): SchoolInvite | undefined {
    return this.getInvites().find((inv) => inv.id === id);
  }

  public getInviteByToken(token: string): SchoolInvite | undefined {
    if (!token) return undefined;
    const cleanToken = token.trim();
    return this.getInvites().find((inv) => inv.token === cleanToken);
  }

  public addInvite(inviteData: Partial<SchoolInvite> & { schoolId: string; role: 'teacher' | 'student'; label: string }): SchoolInvite {
    const newInvite: SchoolInvite = {
      id: inviteData.id || 'inv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      token: inviteData.token || generateSecureToken(inviteData.role === 'teacher' ? 'tch' : 'stu'),
      schoolId: inviteData.schoolId,
      role: inviteData.role,
      label: inviteData.label,
      expiresAt: inviteData.expiresAt,
      maxUses: inviteData.maxUses,
      usedCount: inviteData.usedCount || 0,
      status: inviteData.status || 'active',
      createdAt: inviteData.createdAt || new Date().toISOString(),
      createdBy: inviteData.createdBy,
    };
    const list = this.getInvites();
    list.unshift(newInvite);
    this.setItem(STORAGE_KEYS.INVITES, list);
    return newInvite;
  }

  public updateInvite(id: string, updates: Partial<SchoolInvite>): void {
    const list = this.getInvites().map((inv) => (inv.id === id ? { ...inv, ...updates } : inv));
    this.setItem(STORAGE_KEYS.INVITES, list);
  }

  public revokeInvite(inviteId: string): void {
    this.updateInvite(inviteId, {
      status: 'revoked',
      revokedAt: new Date().toISOString(),
    });
  }

  public incrementInviteUsage(idOrToken: string): boolean {
    const invite = this.getInviteByToken(idOrToken) || this.getInviteById(idOrToken);
    if (!invite) return false;
    const newCount = (invite.usedCount || 0) + 1;
    const updates: Partial<SchoolInvite> = { usedCount: newCount };
    if (invite.maxUses && invite.maxUses > 0 && newCount >= invite.maxUses) {
      updates.status = 'expired';
    }
    this.updateInvite(invite.id, updates);
    return true;
  }

  public validateInvite(token: string, schoolId?: string): { valid: boolean; reason?: string; invite?: SchoolInvite; school?: School } {
    if (!token) {
      return { valid: false, reason: 'Invalid or missing invitation token.' };
    }
    const invite = this.getInviteByToken(token);
    if (!invite) {
      return { valid: false, reason: 'This invite link does not exist or has been removed.' };
    }
    if (schoolId && invite.schoolId !== schoolId) {
      return { valid: false, reason: 'This invitation token does not belong to the specified school.', invite };
    }
    if (invite.status === 'revoked') {
      return { valid: false, reason: 'This invitation link was revoked by the school administrator.', invite };
    }
    if (invite.status === 'expired') {
      return { valid: false, reason: 'This invitation link has expired or reached its maximum usage limit.', invite };
    }
    if (invite.expiresAt && new Date(invite.expiresAt).getTime() < Date.now()) {
      // Mark as expired in store
      this.updateInvite(invite.id, { status: 'expired' });
      return { valid: false, reason: 'This invitation link has expired.', invite };
    }
    if (invite.maxUses && invite.maxUses > 0 && (invite.usedCount || 0) >= invite.maxUses) {
      this.updateInvite(invite.id, { status: 'expired' });
      return { valid: false, reason: 'This invitation link has reached its maximum allowed signups.', invite };
    }
    const school = this.getSchoolById(invite.schoolId);
    if (!school) {
      return { valid: false, reason: 'The institution associated with this invite could not be found.', invite };
    }
    if (school.status === 'suspended') {
      return { valid: false, reason: 'The institution associated with this invite is currently suspended.', invite, school };
    }
    return { valid: true, invite, school };
  }

  // --- Central Subject Registry ---
  public getRegistrySubjects(schoolId?: string): RegistrySubject[] {
    const list = this.getItem<RegistrySubject[]>(STORAGE_KEYS.SUBJECT_REGISTRY, STANDARD_SUBJECT_REGISTRY);
    if (!schoolId) return list;
    return list.filter((s) => !s.schoolId || s.schoolId === schoolId);
  }

  public getRegistrySubjectByCode(code: string): RegistrySubject | undefined {
    return this.getRegistrySubjects().find((s) => s.code.toLowerCase() === code.trim().toLowerCase());
  }

  public getRegistrySubjectByName(name: string): RegistrySubject | undefined {
    return this.getRegistrySubjects().find((s) => s.name.toLowerCase() === name.trim().toLowerCase());
  }

  public addRegistrySubject(subject: RegistrySubject): void {
    const list = this.getRegistrySubjects();
    const existingIdx = list.findIndex((s) => s.code.toLowerCase() === subject.code.trim().toLowerCase());
    if (existingIdx >= 0) {
      list[existingIdx] = subject;
    } else {
      list.push(subject);
    }
    this.setItem(STORAGE_KEYS.SUBJECT_REGISTRY, list);
  }

  public updateRegistrySubject(id: string, updates: Partial<RegistrySubject>): void {
    const list = this.getRegistrySubjects().map((s) => (s.id === id ? { ...s, ...updates } : s));
    this.setItem(STORAGE_KEYS.SUBJECT_REGISTRY, list);
  }

  public deleteRegistrySubject(id: string): void {
    const list = this.getRegistrySubjects().filter((s) => s.id !== id);
    this.setItem(STORAGE_KEYS.SUBJECT_REGISTRY, list);
  }

  /**
   * Returns active registry subjects for a given class and optional department
   */
  public getSubjectsForClass(
    studentClass: StudentClass | string,
    department?: Department | string,
    schoolId?: string
  ): RegistrySubject[] {
    const all = this.getRegistrySubjects(schoolId).filter((s) => s.status === 'active');
    const isJunior = ['JSS1', 'JSS2', 'JSS3'].includes(studentClass);

    return all.filter((s) => {
      // Check activeClasses if defined
      if (s.activeClasses && s.activeClasses.length > 0) {
        if (!s.activeClasses.includes(studentClass as StudentClass)) return false;
      }

      if (isJunior) {
        return s.level === 'junior' || s.level === 'both';
      } else {
        // Senior Secondary: Core subjects OR Department-specific
        if (s.level === 'junior') return false;
        if (s.category === 'core') return true;
        if (s.category === 'departmental' && department) {
          return s.departments ? s.departments.includes(department as Department) : true;
        }
        return true;
      }
    });
  }

  /**
   * Auto-resolves standard subject names for a student based on Class and Department (Core + Departmental)
   */
  public resolveStudentSubjects(
    studentClass: StudentClass | string,
    department?: Department | string,
    customSubjects?: string[]
  ): string[] {
    if (customSubjects && customSubjects.length > 0) {
      return customSubjects;
    }

    const available = this.getSubjectsForClass(studentClass, department);
    return available.map((s) => s.name);
  }

  // --- Permissions Check ---
  public canUserEnrolStudents(user: User): boolean {
    if (user.role === 'admin' || user.role === 'superadmin') return true;
    if (user.role === 'teacher' && user.teacherType === 'class_teacher') return true;
    return false;
  }

  public canUserRecordScores(user: User, subject?: string, studentClass?: string): boolean {
    if (user.role === 'admin' || user.role === 'superadmin') return true;
    if (user.role !== 'teacher') return false;
    if (user.teacherType === 'class_teacher') return true;
    if (subject && user.assignedSubjects && user.assignedSubjects.length > 0) {
      if (!user.assignedSubjects.includes(subject)) return false;
    }
    if (studentClass && user.assignedClasses && user.assignedClasses.length > 0) {
      if (!user.assignedClasses.includes(studentClass as StudentClass)) return false;
    }
    return true;
  }

  public canUserCompileResults(user: User): boolean {
    return user.role === 'admin' || user.role === 'superadmin';
  }

  public canUserApproveResults(user: User): boolean {
    return user.role === 'admin' || user.role === 'superadmin';
  }

  // --- Subject Scores Recording ---
  public getSubjectScores(
    schoolId?: string,
    studentClass?: string,
    subject?: string,
    term?: string,
    session?: string
  ): SubjectScoreEntry[] {
    let all = this.getItem<SubjectScoreEntry[]>(STORAGE_KEYS.SUBJECT_SCORES, []);
    if (schoolId) all = all.filter((s) => s.schoolId === schoolId);
    if (studentClass) all = all.filter((s) => s.studentClass === studentClass);
    if (subject) all = all.filter((s) => s.subject === subject);
    if (term) all = all.filter((s) => s.term === term);
    if (session) all = all.filter((s) => s.session === session);
    return all;
  }

  public saveSubjectScoresBatch(entries: SubjectScoreEntry[]): void {
    let all = this.getItem<SubjectScoreEntry[]>(STORAGE_KEYS.SUBJECT_SCORES, []);
    for (const entry of entries) {
      const idx = all.findIndex(
        (s) =>
          s.schoolId === entry.schoolId &&
          s.studentId === entry.studentId &&
          s.subject === entry.subject &&
          s.term === entry.term &&
          s.session === entry.session
      );
      if (idx >= 0) {
        all[idx] = entry;
      } else {
        all.push(entry);
      }
    }
    this.setItem(STORAGE_KEYS.SUBJECT_SCORES, all);
  }

  // --- Announcements ---
  public getAnnouncements(schoolId?: string): Announcement[] {
    const all = this.getItem<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, []);
    if (!schoolId) return all;
    return all.filter((a) => a.schoolId === schoolId);
  }

  public addAnnouncement(announcement: Announcement): void {
    const list = this.getItem<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, []);
    list.unshift(announcement);
    this.setItem(STORAGE_KEYS.ANNOUNCEMENTS, list);
  }

  public updateAnnouncement(id: string, updates: Partial<Announcement>): void {
    const list = this.getItem<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, []).map((a) =>
      a.id === id ? { ...a, ...updates } : a
    );
    this.setItem(STORAGE_KEYS.ANNOUNCEMENTS, list);
  }

  public deleteAnnouncement(id: string): void {
    const list = this.getItem<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, []).filter((a) => a.id !== id);
    this.setItem(STORAGE_KEYS.ANNOUNCEMENTS, list);
  }

  // --- Reports & Results Management ---
  public getReports(schoolId?: string): ReportCard[] {
    const all = this.getItem<ReportCard[]>(STORAGE_KEYS.REPORTS, []);
    if (!schoolId) return all;
    return all.filter((r) => r.schoolId === schoolId);
  }

  public getReportById(id: string): ReportCard | undefined {
    return this.getReports().find((r) => r.id === id);
  }

  public addReport(report: ReportCard): void {
    const list = this.getItem<ReportCard[]>(STORAGE_KEYS.REPORTS, []);
    list.unshift(report);
    this.setItem(STORAGE_KEYS.REPORTS, list);
  }

  public updateReport(id: string, updates: Partial<ReportCard>): void {
    const list = this.getItem<ReportCard[]>(STORAGE_KEYS.REPORTS, []).map((r) =>
      r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
    );
    this.setItem(STORAGE_KEYS.REPORTS, list);
  }

  public deleteReport(id: string): void {
    const list = this.getItem<ReportCard[]>(STORAGE_KEYS.REPORTS, []).filter((r) => r.id !== id);
    this.setItem(STORAGE_KEYS.REPORTS, list);
  }

  public approveReport(id: string, adminUserOrName: User | string): void {
    const adminName = typeof adminUserOrName === 'string'
      ? (this.getUserById(adminUserOrName)?.name || adminUserOrName)
      : adminUserOrName.name;

    this.updateReport(id, {
      status: 'approved',
      approvedBy: adminName,
      approvedAt: new Date().toISOString(),
    });
  }

  public publishReport(id: string, adminUserOrName: User | string): void {
    const adminName = typeof adminUserOrName === 'string'
      ? (this.getUserById(adminUserOrName)?.name || adminUserOrName)
      : adminUserOrName.name;

    this.updateReport(id, {
      status: 'published',
      approvedBy: adminName,
      approvedAt: new Date().toISOString(),
    });
  }

  public unpublishReport(id: string): void {
    this.updateReport(id, {
      status: 'draft',
    });
  }

  public publishAllReportsForClass(schoolId: string, studentClass: StudentClass | string, term: string, session: string, adminUserOrName: User | string): void {
    const adminName = typeof adminUserOrName === 'string'
      ? (this.getUserById(adminUserOrName)?.name || adminUserOrName)
      : adminUserOrName.name;

    const list = this.getItem<ReportCard[]>(STORAGE_KEYS.REPORTS, []).map((r) => {
      if (r.schoolId === schoolId && r.studentClass === studentClass && r.term === term && r.session === session) {
        return {
          ...r,
          status: 'published' as ResultStatus,
          approvedBy: adminName,
          approvedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      return r;
    });
    this.setItem(STORAGE_KEYS.REPORTS, list);
  }

  public publishClassReports(schoolId: string, studentClass: string, term: string, session: string, adminUserOrName: User | string): number {
    this.publishAllReportsForClass(schoolId, studentClass as StudentClass, term, session, adminUserOrName);
    const reports = this.getReports(schoolId).filter(
      (r) => r.studentClass === studentClass && r.term === term && r.session === session && r.status === 'published'
    );
    return reports.length;
  }

  // Terminal Result Compiler (Aggregates subject scores with CA1 (20), CA2 (20), Exam (60) and ranks students)
  public compileClassTerminalResults(
    schoolId: string,
    studentClass: StudentClass | string,
    term: '1st Term' | '2nd Term' | '3rd Term' | string,
    session: string,
    adminUserOrName: User | string,
    defaultPrincipalRemark = 'A commendable academic performance. Keep working hard towards excellence.'
  ): ReportCard[] {
    const students = this.getUsers().filter((u) => u.schoolId === schoolId && u.role === 'student' && u.studentClass === studentClass);
    const subjectScores = this.getSubjectScores(schoolId, studentClass, undefined, term, session);
    const attendance = this.getAttendance(schoolId).filter((a) => a.studentClass === studentClass);
    const school = this.getSchoolById(schoolId);

    const adminName = typeof adminUserOrName === 'string'
      ? (this.getUserById(adminUserOrName)?.name || adminUserOrName)
      : adminUserOrName.name;

    // Find class teacher if any
    const classTeacher = this.getUsers().find(
      (u) => u.schoolId === schoolId && u.role === 'teacher' && u.teacherType === 'class_teacher' && u.assignedClass === studentClass
    );
    const teacherName = classTeacher ? classTeacher.name : 'Class Tutor';
    const teacherId = classTeacher ? classTeacher.id : (typeof adminUserOrName === 'string' ? adminUserOrName : adminUserOrName.id);

    // Temporary calculations for sorting
    const studentAggregates = students.map((student) => {
      const studentSubScores = subjectScores.filter((s) => s.studentId === student.id);
      
      const subjects: SubjectScore[] = studentSubScores.map((s) => {
        const ca1 = s.ca1Score !== undefined ? s.ca1Score : Math.round(s.score * 0.15);
        const ca2 = s.ca2Score !== undefined ? s.ca2Score : Math.round(s.score * 0.15);
        const caTotal = s.caScore !== undefined ? s.caScore : (ca1 + ca2);
        const exam = s.examScore !== undefined ? s.examScore : (s.score - caTotal);

        return {
          subjectCode: s.subjectCode || this.getRegistrySubjectByName(s.subject)?.code || s.subject.substring(0, 3).toUpperCase(),
          subject: s.subject,
          ca1Score: ca1,
          ca2Score: ca2,
          caScore: caTotal,
          examScore: exam,
          score: s.score,
          grade: s.grade,
          remark: s.remark,
          teacherComment: s.teacherComment,
          teacherId: s.recordedByTeacherId,
          teacherName: s.recordedByTeacherName,
          updatedAt: s.updatedAt,
        };
      });

      const totalScore = subjects.reduce((sum, s) => sum + s.score, 0);
      const averageScore = subjects.length > 0 ? totalScore / subjects.length : 0;
      const overall = calculateGrade(averageScore);

      const stuAtt = attendance.filter((a) => a.studentId === student.id);
      const attendancePresent = stuAtt.filter((a) => a.status === 'present').length;
      const attendanceAbsent = stuAtt.filter((a) => a.status === 'absent').length;
      const attendanceLate = stuAtt.filter((a) => a.status === 'late').length;

      const feeCleared = this.isStudentFeeCleared(schoolId, student.id, term, session);

      return {
        student,
        subjects,
        totalScore,
        averageScore,
        overallGrade: overall.grade,
        overallRemark: overall.remark,
        attendancePresent,
        attendanceAbsent,
        attendanceLate,
        feeCleared,
      };
    });

    // Rank students by average score descending
    studentAggregates.sort((a, b) => b.averageScore - a.averageScore);

    const existingReports = this.getReports(schoolId);
    const compiledReports: ReportCard[] = [];

    studentAggregates.forEach((agg, index) => {
      const position = index + 1;
      const existing = existingReports.find(
        (r) =>
          r.schoolId === schoolId &&
          r.studentId === agg.student.id &&
          r.term === term &&
          r.session === session
      );

      const report: ReportCard = {
        id: existing ? existing.id : `rep_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        schoolId,
        studentId: agg.student.id,
        studentName: agg.student.name,
        admissionNumber: agg.student.admissionNumber || `ADM/${session.substring(0, 4)}/${1000 + index}`,
        studentClass: studentClass as StudentClass,
        department: agg.student.department,
        teacherId,
        teacherName,
        term: term as '1st Term' | '2nd Term' | '3rd Term',
        session,
        position,
        subjects: agg.subjects,
        totalScore: agg.totalScore,
        averageScore: agg.averageScore,
        overallGrade: agg.overallGrade,
        overallRemark: agg.overallRemark,
        attendancePresent: agg.attendancePresent,
        attendanceAbsent: agg.attendanceAbsent,
        attendanceLate: agg.attendanceLate,
        teacherComment: existing ? existing.teacherComment : `Shows consistent academic progress and dedication in class activities.`,
        principalRemark: existing ? existing.principalRemark : defaultPrincipalRemark,
        nextTermBegins: school?.nextTermBegins || '2025-04-28',
        feeCleared: agg.feeCleared,
        status: existing ? existing.status : 'draft',
        createdAt: existing ? existing.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      compiledReports.push(report);
    });

    // Save/update compiled reports
    let allReports = this.getItem<ReportCard[]>(STORAGE_KEYS.REPORTS, []);
    for (const report of compiledReports) {
      const idx = allReports.findIndex((r) => r.id === report.id);
      if (idx >= 0) {
        allReports[idx] = report;
      } else {
        allReports.unshift(report);
      }
    }
    this.setItem(STORAGE_KEYS.REPORTS, allReports);

    return compiledReports;
  }

  // --- School Fees Management ---
  public getFeeSchedules(schoolId?: string): FeeSchedule[] {
    const list = this.getItem<FeeSchedule[]>(STORAGE_KEYS.FEE_SCHEDULES, []);
    if (!schoolId) return list;
    return list.filter((f) => f.schoolId === schoolId);
  }

  public getFeeScheduleForClass(
    schoolId: string,
    studentClass: StudentClass | string,
    term = '1st Term',
    session = '2024/2025'
  ): FeeSchedule | undefined {
    return this.getFeeSchedules(schoolId).find(
      (f) => f.studentClass === studentClass && f.term === term && f.session === session
    );
  }

  public saveFeeSchedule(schedule: FeeSchedule): void {
    const list = this.getItem<FeeSchedule[]>(STORAGE_KEYS.FEE_SCHEDULES, []);
    const idx = list.findIndex(
      (f) =>
        f.schoolId === schedule.schoolId &&
        f.studentClass === schedule.studentClass &&
        f.term === schedule.term &&
        f.session === schedule.session
    );
    if (idx >= 0) {
      list[idx] = schedule;
    } else {
      list.push(schedule);
    }
    this.setItem(STORAGE_KEYS.FEE_SCHEDULES, list);
  }

  public deleteFeeSchedule(id: string): void {
    const list = this.getItem<FeeSchedule[]>(STORAGE_KEYS.FEE_SCHEDULES, []).filter((f) => f.id !== id);
    this.setItem(STORAGE_KEYS.FEE_SCHEDULES, list);
  }

  public getFeePayments(schoolId?: string): FeePayment[] {
    const list = this.getItem<FeePayment[]>(STORAGE_KEYS.FEE_PAYMENTS, []);
    if (!schoolId) return list;
    return list.filter((p) => p.schoolId === schoolId);
  }

  public getStudentFeePayments(studentId: string, term?: string, session?: string): FeePayment[] {
    let list = this.getItem<FeePayment[]>(STORAGE_KEYS.FEE_PAYMENTS, []).filter((p) => p.studentId === studentId);
    if (term) list = list.filter((p) => p.term === term);
    if (session) list = list.filter((p) => p.session === session);
    return list.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }

  public recordFeePayment(paymentData: Omit<FeePayment, 'id' | 'createdAt'>): FeePayment {
    const list = this.getItem<FeePayment[]>(STORAGE_KEYS.FEE_PAYMENTS, []);
    const year = new Date().getFullYear();
    const count = list.length + 1;
    const padCount = count.toString().padStart(4, '0');
    const id = `RCP-${year}-${padCount}`;

    const newPayment: FeePayment = {
      ...paymentData,
      id,
      createdAt: new Date().toISOString(),
    };

    list.unshift(newPayment);
    this.setItem(STORAGE_KEYS.FEE_PAYMENTS, list);
    return newPayment;
  }

  public deleteFeePayment(id: string): void {
    const list = this.getItem<FeePayment[]>(STORAGE_KEYS.FEE_PAYMENTS, []).filter((p) => p.id !== id);
    this.setItem(STORAGE_KEYS.FEE_PAYMENTS, list);
  }

  public getStudentFeeSummary(
    schoolId: string,
    studentId: string,
    term = '1st Term',
    session = '2024/2025'
  ): StudentFeeSummary {
    const student = this.getUserById(studentId);
    const studentClass = student?.studentClass || 'SS1';
    const schedule = this.getFeeScheduleForClass(schoolId, studentClass, term, session);
    const totalBilled = schedule ? schedule.totalAmount : 100000;

    const payments = this.getStudentFeePayments(studentId, term, session);
    const totalPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);
    const balance = Math.max(0, totalBilled - totalPaid);

    let status: 'paid' | 'partial' | 'owing' = 'owing';
    if (totalPaid >= totalBilled && totalBilled > 0) {
      status = 'paid';
    } else if (totalPaid > 0) {
      status = 'partial';
    }

    return {
      studentId,
      studentName: student?.name || 'Student',
      studentClass,
      term: term as '1st Term' | '2nd Term' | '3rd Term',
      session,
      totalBilled,
      totalPaid,
      balance,
      status,
      payments,
    };
  }

  public getClassFeeSummaries(
    schoolId: string,
    studentClass: StudentClass | string,
    term = '1st Term',
    session = '2024/2025'
  ): StudentFeeSummary[] {
    const students = this.getUsers().filter((u) => u.schoolId === schoolId && u.role === 'student' && u.studentClass === studentClass);
    return students.map((s) => this.getStudentFeeSummary(schoolId, s.id, term, session));
  }

  public getSchoolFeeMetrics(
    schoolId: string,
    term = '1st Term',
    session = '2024/2025'
  ): {
    totalExpected: number;
    totalCollected: number;
    totalOutstanding: number;
    totalStudents: number;
    fullyPaidCount: number;
    partialCount: number;
    owingCount: number;
  } {
    const students = this.getUsers().filter((u) => u.schoolId === schoolId && u.role === 'student');
    let totalExpected = 0;
    let totalCollected = 0;
    let fullyPaidCount = 0;
    let partialCount = 0;
    let owingCount = 0;

    students.forEach((student) => {
      const summary = this.getStudentFeeSummary(schoolId, student.id, term, session);
      totalExpected += summary.totalBilled;
      totalCollected += summary.totalPaid;
      if (summary.status === 'paid') fullyPaidCount++;
      else if (summary.status === 'partial') partialCount++;
      else owingCount++;
    });

    return {
      totalExpected,
      totalCollected,
      totalOutstanding: Math.max(0, totalExpected - totalCollected),
      totalStudents: students.length,
      fullyPaidCount,
      partialCount,
      owingCount,
    };
  }

  public isStudentFeeCleared(
    schoolId: string,
    studentId: string,
    term = '1st Term',
    session = '2024/2025'
  ): boolean {
    const school = this.getSchoolById(schoolId);
    if (!school?.enforceFeeClearanceForResults) return true;
    const summary = this.getStudentFeeSummary(schoolId, studentId, term, session);
    return summary.balance <= 0;
  }

  // --- Assignments & Submissions ---
  public getAssignments(schoolId?: string): Assignment[] {
    const all = this.getItem<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, []);
    if (!schoolId) return all;
    return all.filter((a) => a.schoolId === schoolId);
  }

  public getAssignmentById(id: string): Assignment | undefined {
    return this.getAssignments().find((a) => a.id === id);
  }

  public addAssignment(assignment: Assignment): void {
    const list = this.getItem<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, []);
    list.unshift(assignment);
    this.setItem(STORAGE_KEYS.ASSIGNMENTS, list);
  }

  public updateAssignment(id: string, updates: Partial<Assignment>): void {
    const list = this.getItem<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, []).map((a) =>
      a.id === id ? { ...a, ...updates } : a
    );
    this.setItem(STORAGE_KEYS.ASSIGNMENTS, list);
  }

  public getSubmissions(assignmentId?: string): Submission[] {
    const all = this.getItem<Submission[]>(STORAGE_KEYS.SUBMISSIONS, []);
    if (!assignmentId) return all;
    return all.filter((s) => s.assignmentId === assignmentId);
  }

  public addSubmission(submission: Submission): void {
    const list = this.getItem<Submission[]>(STORAGE_KEYS.SUBMISSIONS, []);
    list.push(submission);
    this.setItem(STORAGE_KEYS.SUBMISSIONS, list);
  }

  public updateSubmission(id: string, updates: Partial<Submission>): void {
    const list = this.getItem<Submission[]>(STORAGE_KEYS.SUBMISSIONS, []).map((s) =>
      s.id === id ? { ...s, ...updates } : s
    );
    this.setItem(STORAGE_KEYS.SUBMISSIONS, list);
  }

  public getTeacherAssignedSubjects(teacherOrId: User | string, schoolId?: string): string[] {
    const teacher = typeof teacherOrId === 'string' ? this.getUserById(teacherOrId) : teacherOrId;
    if (!teacher) return [];
    if (teacher.assignedSubjects && teacher.assignedSubjects.length > 0) {
      return teacher.assignedSubjects;
    }
    if (teacher.specialty) {
      return [teacher.specialty];
    }
    const subjects = this.getRegistrySubjects(schoolId || teacher.schoolId);
    return subjects.map((s) => s.name);
  }

  public getApplicableSubjectsForStudent(
    schoolId: string,
    studentClass: StudentClass | string,
    department?: Department | string
  ): RegistrySubject[] {
    return this.getSubjectsForClass(studentClass, department, schoolId);
  }

  public resetSchoolSubjectRegistry(schoolId: string): void {
    const defaultSubjects = STANDARD_SUBJECT_REGISTRY.map((s) => ({
      ...s,
      schoolId,
    }));
    const list = this.getItem<RegistrySubject[]>(STORAGE_KEYS.SUBJECT_REGISTRY, []).filter((s) => s.schoolId !== schoolId);
    list.push(...defaultSubjects);
    this.setItem(STORAGE_KEYS.SUBJECT_REGISTRY, list);
  }

  public getFeeSchedule(
    schoolId: string,
    studentClass: StudentClass | string,
    term = '1st Term',
    session = '2024/2025'
  ): FeeSchedule | undefined {
    return this.getFeeScheduleForClass(schoolId, studentClass, term, session);
  }

  public setFeeSchedule(schedule: FeeSchedule): void {
    this.saveFeeSchedule(schedule);
  }

  // --- Attendance ---
  public getAttendance(schoolId?: string, studentClass?: string, date?: string): AttendanceRecord[] {
    let all = this.getItem<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, []);
    if (schoolId) all = all.filter((a) => a.schoolId === schoolId);
    if (studentClass) all = all.filter((a) => a.studentClass === studentClass);
    if (date) all = all.filter((a) => a.date === date);
    return all;
  }

  public saveAttendanceBatch(records: AttendanceRecord[]): void {
    let all = this.getItem<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, []);
    const keysMap = new Set(records.map((r) => `${r.studentId}_${r.date}`));
    all = all.filter((r) => !keysMap.has(`${r.studentId}_${r.date}`));
    all.push(...records);
    this.setItem(STORAGE_KEYS.ATTENDANCE, all);
  }

  // --- Timetable ---
  public getTimetable(schoolId?: string, studentClass?: string): TimetableSlot[] {
    const all = this.getItem<TimetableSlot[]>(STORAGE_KEYS.TIMETABLE, []);
    return all.filter((t) => (!schoolId || t.schoolId === schoolId) && (!studentClass || t.studentClass === studentClass));
  }

  public setTimetableSlot(slot: TimetableSlot): void {
    const all = this.getItem<TimetableSlot[]>(STORAGE_KEYS.TIMETABLE, []);
    const idx = all.findIndex(
      (s) =>
        s.schoolId === slot.schoolId &&
        s.studentClass === slot.studentClass &&
        s.day === slot.day &&
        s.period === slot.period
    );
    if (idx >= 0) {
      all[idx] = slot;
    } else {
      all.push(slot);
    }
    this.setItem(STORAGE_KEYS.TIMETABLE, all);
  }

  public clearTimetableSlot(schoolId: string, studentClass: string, day: string, period: number): void {
    const all = this.getItem<TimetableSlot[]>(STORAGE_KEYS.TIMETABLE, []);
    const filtered = all.filter(
      (s) => !(s.schoolId === schoolId && s.studentClass === studentClass && s.day === day && s.period === period)
    );
    this.setItem(STORAGE_KEYS.TIMETABLE, filtered);
  }

  // --- Settings & Maintenance ---
  public getPlatformName(): string {
    return localStorage.getItem(STORAGE_KEYS.PLATFORM_NAME) || 'SchoolHub';
  }

  public setPlatformName(name: string): void {
    localStorage.setItem(STORAGE_KEYS.PLATFORM_NAME, name);
  }

  public isMaintenanceMode(): boolean {
    return localStorage.getItem(STORAGE_KEYS.MAINTENANCE_MODE) === 'true';
  }

  public setMaintenanceMode(val: boolean): void {
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE_MODE, val ? 'true' : 'false');
  }

  public seedInitialData(): void {
    this.setItem(STORAGE_KEYS.SCHOOLS, SEED_SCHOOLS);
    this.setItem(STORAGE_KEYS.USERS, SEED_USERS);
    this.setItem(STORAGE_KEYS.ANNOUNCEMENTS, SEED_ANNOUNCEMENTS);
    this.setItem(STORAGE_KEYS.ASSIGNMENTS, SEED_ASSIGNMENTS);
    this.setItem(STORAGE_KEYS.SUBMISSIONS, SEED_SUBMISSIONS);
    this.setItem(STORAGE_KEYS.REPORTS, SEED_REPORTS);
    this.setItem(STORAGE_KEYS.SUBJECT_REGISTRY, STANDARD_SUBJECT_REGISTRY);
    this.setItem(STORAGE_KEYS.FEE_SCHEDULES, SEED_FEE_SCHEDULES);
    this.setItem(STORAGE_KEYS.FEE_PAYMENTS, SEED_FEE_PAYMENTS);

    const students = SEED_USERS.filter((u) => u.role === 'student');
    this.setItem(STORAGE_KEYS.ATTENDANCE, generateSeedAttendance('SH-HMS001', students));
    this.setItem(STORAGE_KEYS.TIMETABLE, generateSeedTimetable('SH-HMS001'));
  }

  public exportAllDataJSON(): string {
    const data = {
      schools: this.getSchools(),
      users: this.getUsers(),
      subjectRegistry: this.getRegistrySubjects(),
      feeSchedules: this.getFeeSchedules(),
      feePayments: this.getFeePayments(),
      announcements: this.getAnnouncements(),
      assignments: this.getAssignments(),
      submissions: this.getSubmissions(),
      reports: this.getReports(),
      subjectScores: this.getSubjectScores(),
      attendance: this.getAttendance(),
      timetable: this.getItem(STORAGE_KEYS.TIMETABLE, []),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  public clearSchoolStudentData(schoolId: string): void {
    const users = this.getUsers().filter((u) => !(u.schoolId === schoolId && u.role === 'student'));
    this.setItem(STORAGE_KEYS.USERS, users);

    const reports = this.getReports().filter((r) => r.schoolId !== schoolId);
    this.setItem(STORAGE_KEYS.REPORTS, reports);

    const scores = this.getSubjectScores().filter((s) => s.schoolId !== schoolId);
    this.setItem(STORAGE_KEYS.SUBJECT_SCORES, scores);

    const attendance = this.getAttendance().filter((a) => a.schoolId !== schoolId);
    this.setItem(STORAGE_KEYS.ATTENDANCE, attendance);

    const assignments = this.getAssignments().filter((a) => a.schoolId !== schoolId);
    this.setItem(STORAGE_KEYS.ASSIGNMENTS, assignments);

    const feePayments = this.getFeePayments().filter((p) => p.schoolId !== schoolId);
    this.setItem(STORAGE_KEYS.FEE_PAYMENTS, feePayments);
  }

  public clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.LAST_EMAIL);
    localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SUBJECT_SCORES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SUBJECT_REGISTRY, JSON.stringify(STANDARD_SUBJECT_REGISTRY));
    localStorage.setItem(STORAGE_KEYS.FEE_SCHEDULES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.FEE_PAYMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
  }
}

// Utility Functions
export function generateSchoolCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = 'SH-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function generateSecureToken(prefix = 'inv'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID().replace(/-/g, '')}`;
  }
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const randomBytes = new Uint8Array(16);
    crypto.getRandomValues(randomBytes);
    return `${prefix}_${Array.from(randomBytes).map((b) => b.toString(16).padStart(2, '0')).join('')}`;
  }
  return `${prefix}_${Math.random().toString(36).substring(2, 12)}${Date.now().toString(36)}${Math.random().toString(36).substring(2, 8)}`;
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Official 9-point WAEC / NECO grading scale with auto-generated remarks
 * 75–100 -> A1 (Excellent)
 * 70–74  -> B2 (Very Good)
 * 65–69  -> B3 (Good)
 * 60–64  -> C4 (Credit)
 * 55–59  -> C5 (Credit)
 * 50–54  -> C6 (Credit)
 * 45–49  -> D7 (Pass)
 * 40–44  -> E8 (Pass)
 * 0–39   -> F9 (Fail)
 */
export function calculateGrade(score: number): { grade: ReportGrade; remark: ReportRemark } {
  const rounded = Math.min(100, Math.max(0, Math.round(score)));
  if (rounded >= 75) return { grade: 'A1', remark: 'Excellent' };
  if (rounded >= 70) return { grade: 'B2', remark: 'Very Good' };
  if (rounded >= 65) return { grade: 'B3', remark: 'Good' };
  if (rounded >= 60) return { grade: 'C4', remark: 'Credit' };
  if (rounded >= 55) return { grade: 'C5', remark: 'Credit' };
  if (rounded >= 50) return { grade: 'C6', remark: 'Credit' };
  if (rounded >= 45) return { grade: 'D7', remark: 'Pass' };
  if (rounded >= 40) return { grade: 'E8', remark: 'Pass' };
  return { grade: 'F9', remark: 'Fail' };
}

export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function formatNaira(amount: number): string {
  return '₦' + (amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
