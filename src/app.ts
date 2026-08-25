import {
  Store,
  generateSchoolCode,
  generateVerificationCode,
  calculateGrade,
} from './store';
import {
  User,
  School,
  StudentClass,
  SubjectName,
  SubjectScore,
  ReportCard,
  Assignment,
  AttendanceRecord,
  TimetableSlot,
  SubjectScoreEntry,
  Department,
  RegistrySubject,
  TeacherType,
} from './types';
import { renderLandingPage } from './views/landing';
import {
  renderRegisterSchool,
  renderRegisterUser,
  renderEmailVerification,
  renderLogin,
  renderJoinSchool,
  renderInvalidInvite,
  renderJoinSuccess,
} from './views/auth';
import {
  renderSuperAdminLogin,
  renderSuperAdminDashboard,
} from './views/superadmin';
import { renderSchoolAdminDashboard } from './views/schooladmin';
import { renderTeacherDashboard } from './views/teacher';
import { renderStudentDashboard } from './views/student';
import {
  renderModalsContainer,
  buildReportCardModalHtml,
  buildShareCodeModalHtml,
  buildEditTimetableModalHtml,
  buildSubmissionsModalHtml,
  buildSubmitAssignmentModalHtml,
  buildUserDetailsModalHtml,
  buildSchoolDetailsModalHtml,
  buildConfirmModalHtml,
  buildAdminRegisterTeacherModalHtml,
  buildEnrolStudentModalHtml,
  buildSubjectScoresLedgerModalHtml,
  buildCustomReportGeneratorModalHtml,
  buildSubjectRegistryModalHtml,
  buildRecordFeePaymentModalHtml,
  buildFeeReceiptModalHtml,
  buildFeeScheduleModalHtml,
  buildSchoolInvitesModalHtml,
  buildPendingApprovalsModalHtml,
  buildEmailTesterModalHtml,
} from './views/modals';
import { sendEmail, sendTestEmail, checkEmailConfigStatus } from './services/email';
import { SUBJECT_LIST, SENIOR_CLASSES } from './seed';

export class SchoolHubApp {
  private store: Store;
  private currentSuperAdminLoggedIn = false;
  private pendingUserRegistration: { user: User; code: string } | null = null;
  private confirmActionCallback: (() => void) | null = null;

  // View Sub-States: School Admin
  private schoolAdminTab = 'overview';
  private schoolAdminClassFilter = 'all';
  private schoolAdminResultClass = 'SS2';
  private schoolAdminResultTerm = '1st Term';
  private schoolAdminResultSession = '2024/2025';

  // Fee Management Filters
  private adminFeeClassFilter = 'all';
  private adminFeeStatusFilter = 'all';
  private adminFeeSearch = '';

  // View Sub-States: Teacher
  private teacherTab = 'home';
  private teacherClass = 'SS2';
  private teacherAttendanceDate = new Date().toISOString().split('T')[0];
  private teacherScoreSubject = 'Mathematics';
  private teacherScoreTerm = '1st Term';
  private teacherScoreSession = '2024/2025';

  // View Sub-States: Student
  private studentTab = 'home';
  private studentNewsFilter = 'all';
  private studentAssignmentFilter = 'all';

  // View Sub-States: Super Admin
  private superAdminTab = 'overview';
  private superAdminSearch = '';
  private superAdminRoleFilter = 'all';
  private superAdminSchoolFilter = 'all';

  constructor() {
    this.store = Store.getInstance();
    // Check and clear demo legacy accounts if present
    const users = this.store.getUsers();
    const hasDemoAccounts = users.some(
      (u) =>
        u.email === 'admin@harmonyschool.com' ||
        u.email === 'teacher1@schoolhub.com' ||
        u.email === 'student1@schoolhub.com'
    );
    if (hasDemoAccounts) {
      this.store.clearAllData();
    }
    this.setupEventListeners();
    this.render();
  }

  private setupEventListeners(): void {
    window.addEventListener('hashchange', () => {
      this.render();
    });

    // Start live clock for student schedule
    setInterval(() => {
      const clockEl = document.getElementById('student-live-clock');
      if (clockEl) {
        clockEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    }, 10000);
  }

  public render(): void {
    const root = document.getElementById('app-root');
    if (!root) return;

    const hash = window.location.hash.toLowerCase();
    const currentUser = this.store.getCurrentUser();

    // Body role class management
    document.body.className = '';

    let contentHtml = '';

    // Route logic
    if (hash.startsWith('#join')) {
      const pathPart = hash.replace(/^#\/?join\/?/, '');
      const parts = pathPart.split('/').filter(Boolean);
      const token = parts.length > 1 ? parts[1] : parts[0] || '';
      const schoolId = parts.length > 1 ? parts[0] : undefined;

      const validation = this.store.validateInvite(token, schoolId);
      if (validation.valid && validation.school && validation.invite) {
        document.body.classList.add(validation.invite.role === 'teacher' ? 'role-teacher' : 'role-student');
        contentHtml = renderJoinSchool(validation.invite, validation.school, this.store);
      } else {
        document.body.classList.add('role-admin');
        contentHtml = renderInvalidInvite(validation.reason);
      }
    } else if (hash === '#register-school') {
      document.body.classList.add('role-admin');
      contentHtml = renderRegisterSchool();
    } else if (hash === '#superadmin') {
      document.body.classList.add('role-super');
      if (!this.currentSuperAdminLoggedIn) {
        contentHtml = renderSuperAdminLogin();
      } else {
        contentHtml = renderSuperAdminDashboard(
          this.superAdminTab,
          this.superAdminSearch,
          this.superAdminRoleFilter,
          this.superAdminSchoolFilter
        );
      }
    } else if (currentUser) {
      // User logged in -> route to their dashboard
      if (currentUser.role === 'admin') {
        document.body.classList.add('role-admin');
        contentHtml = renderSchoolAdminDashboard(
          currentUser,
          this.schoolAdminTab,
          this.schoolAdminClassFilter,
          this.schoolAdminResultClass,
          this.schoolAdminResultTerm,
          this.schoolAdminResultSession,
          this.adminFeeClassFilter,
          this.adminFeeStatusFilter,
          this.adminFeeSearch
        );
      } else if (currentUser.role === 'teacher') {
        document.body.classList.add('role-teacher');
        contentHtml = renderTeacherDashboard(
          currentUser,
          this.teacherTab,
          this.teacherClass,
          this.teacherAttendanceDate,
          this.teacherScoreSubject,
          this.teacherScoreTerm,
          this.teacherScoreSession
        );
      } else if (currentUser.role === 'student') {
        document.body.classList.add('role-student');
        contentHtml = renderStudentDashboard(
          currentUser,
          this.studentTab,
          this.studentNewsFilter,
          this.studentAssignmentFilter
        );
      }
    } else {
      // Public / Auth routes
      if (hash === '#register-user') {
        document.body.classList.add('role-teacher');
        contentHtml = renderRegisterUser();
      } else if (hash === '#verify-email') {
        if (!this.pendingUserRegistration) {
          window.location.hash = '#login';
          return;
        }
        contentHtml = renderEmailVerification(
          this.pendingUserRegistration.user.email,
          this.pendingUserRegistration.code
        );
      } else if (hash === '#login') {
        document.body.classList.add('role-admin');
        contentHtml = renderLogin(this.store.getLastEmail());
      } else {
        // Default: Landing page
        document.body.classList.add('role-admin');
        contentHtml = renderLandingPage();
      }
    }

    root.innerHTML = contentHtml + renderModalsContainer();

    // Trigger stat counters
    this.animateStatCounters();
  }

  // --- Animation Helpers ---
  private animateStatCounters(): void {
    const counterElements = document.querySelectorAll<HTMLElement>('.stat-value[data-count]');
    counterElements.forEach((el) => {
      const target = parseInt(el.getAttribute('data-count') || '0', 10);
      if (isNaN(target) || target === 0) return;

      const duration = 800;
      const startTime = performance.now();

      const updateCount = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(easeOut * target);
        el.textContent = current.toString();

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          el.textContent = target.toString();
        }
      };

      requestAnimationFrame(updateCount);
    });
  }

  // --- Auth Handlers ---
  public handleLogoUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const previewImg = document.getElementById('reg-logo-preview') as HTMLImageElement;
        const previewPlaceholder = document.getElementById('reg-logo-placeholder');
        const hiddenInput = document.getElementById('reg-sch-logo-data') as HTMLInputElement;
        if (previewImg) {
          previewImg.src = dataUrl;
          previewImg.style.display = 'block';
        }
        if (previewPlaceholder) {
          previewPlaceholder.style.display = 'none';
        }
        if (hiddenInput) {
          hiddenInput.value = dataUrl;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  public handleRegisterSchool(event: Event): void {
    event.preventDefault();
    const name = (document.getElementById('reg-sch-name') as HTMLInputElement)?.value?.trim() || '';
    const address = (document.getElementById('reg-sch-address') as HTMLInputElement)?.value?.trim() || '';
    const govRegNumber = (document.getElementById('reg-sch-gov') as HTMLInputElement)?.value?.trim() || '';
    const type = ((document.getElementById('reg-sch-type') as HTMLSelectElement)?.value || 'Private') as any;
    const level = ((document.getElementById('reg-sch-level') as HTMLSelectElement)?.value || 'JSS & SSS') as any;
    const state = (document.getElementById('reg-sch-state') as HTMLSelectElement)?.value || 'Lagos';
    const email = (document.getElementById('reg-sch-email') as HTMLInputElement)?.value?.trim() || '';
    const logoUrl = (document.getElementById('reg-sch-logo-data') as HTMLInputElement)?.value || '';

    const adminName = (document.getElementById('reg-adm-name') as HTMLInputElement)?.value?.trim() || '';
    const adminEmail = (document.getElementById('reg-adm-email') as HTMLInputElement)?.value?.trim() || '';
    const adminPhone = (document.getElementById('reg-adm-phone') as HTMLInputElement)?.value?.trim() || '';
    const password = (document.getElementById('reg-adm-password') as HTMLInputElement)?.value || '';
    const confirm = (document.getElementById('reg-adm-confirm') as HTMLInputElement)?.value || '';

    // a. Validate all required fields (email format, unique email, password strength, required names)
    if (!name) {
      this.showToast('Please enter your official School Name.', 'error');
      return;
    }
    if (!address) {
      this.showToast('Please provide your School Physical Address.', 'error');
      return;
    }
    if (!adminName) {
      this.showToast('Please enter the Administrator Full Name.', 'error');
      return;
    }
    if (!adminEmail) {
      this.showToast('Please enter an Administrator Email address.', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
      this.showToast('Please provide a valid Administrator Email format.', 'error');
      return;
    }

    if (!password || password.length < 6) {
      this.showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    if (password !== confirm) {
      this.showToast('Passwords do not match!', 'error');
      const form = document.getElementById('form-register-school');
      if (form) form.classList.add('form-shake');
      setTimeout(() => form?.classList.remove('form-shake'), 400);
      return;
    }

    // f. Show clear error message if email already exists
    if (this.store.getUserByEmail(adminEmail)) {
      this.showToast('An account with this email address already exists. Please login or use another email.', 'error');
      return;
    }

    // b. Create a new School record in the database with unique school_id
    const schoolCode = generateSchoolCode();
    const newSchool: School = {
      id: schoolCode,
      code: schoolCode,
      name,
      address,
      govRegNumber: govRegNumber || undefined,
      logoUrl: logoUrl || undefined,
      type,
      level,
      state,
      email: email || adminEmail,
      enforceFeeClearanceForResults: false,
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    // c. Create the Admin account tied to that school_id, with role = Admin and approved status
    const adminUser: User = {
      id: 'usr_' + Date.now(),
      name: adminName,
      email: adminEmail,
      phone: adminPhone || undefined,
      password,
      role: 'admin',
      schoolId: schoolCode,
      verified: true,
      approvalStatus: 'approved',
      joinedAt: new Date().toISOString(),
      status: 'active',
    };

    this.store.addSchool(newSchool);
    this.store.addUser(adminUser);

    // Generate initial active invite links for faculty and students
    const facultyInvite = this.store.addInvite({
      schoolId: schoolCode,
      role: 'teacher',
      label: 'Initial Faculty Onboarding Link',
      createdBy: adminUser.id,
    });

    const studentInvite = this.store.addInvite({
      schoolId: schoolCode,
      role: 'student',
      label: 'Initial Student Admission Link',
      createdBy: adminUser.id,
    });

    // Auto-login newly registered admin
    this.store.setCurrentUser(adminUser);

    // Confirmation modal with direct invite URLs and actions
    const facultyUrl = `${window.location.origin}${window.location.pathname}#join/${schoolCode}/${facultyInvite.token}`;

    this.showModal(`
      <div style="text-align: center;">
        <div style="font-size: 48px; margin-bottom: 8px;">🎉</div>
        <h2 class="text-heading" style="font-size: 24px; margin-bottom: 8px;">School Registered Successfully!</h2>
        <p class="text-body" style="color: var(--c-text-2); margin-bottom: 20px;">
          Welcome, <strong>${adminName}</strong>! <strong>${name}</strong> is now live and active on SchoolHub.
        </p>

        <div style="background: #F0F9FF; border: 2px dashed #0369A1; border-radius: var(--radius-lg); padding: 18px; margin-bottom: 20px; text-align: left;">
          <div style="font-size: 11px; color: #0369A1; font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">Institutional Code & Login</div>
          <div style="font-size: 24px; font-weight: 800; color: #0369A1; font-family: monospace;">
            ${schoolCode}
          </div>
          <div style="font-size: 12px; color: #475569; margin-top: 4px;">
            Gov. Reg No: <strong>${govRegNumber || 'N/A'}</strong> &bull; State: <strong>${state}</strong>
          </div>
        </div>

        <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: var(--radius-md); padding: 14px; margin-bottom: 20px; text-align: left;">
          <div style="font-size: 11px; font-weight: 700; color: #166534; text-transform: uppercase; margin-bottom: 2px;">Faculty Onboarding Invite Link</div>
          <div style="font-size: 12px; color: #15803D; word-break: break-all; margin-bottom: 8px;">
            <code>${facultyUrl}</code>
          </div>
          <button class="btn btn-primary btn-sm" style="background: #16A34A; font-size: 11px;" onclick="window.SchoolHubApp.copyToClipboard('${facultyUrl}', 'Faculty Invite Link copied to clipboard!')">
            📋 Copy Faculty Invite Link
          </button>
        </div>

        <div style="display: flex; gap: 12px;">
          <button class="btn btn-primary" onclick="window.SchoolHubApp.closeModal(); window.location.hash = ''; window.SchoolHubApp.render();" style="flex: 1; background: #0369A1;">
            Enter Admin Dashboard →
          </button>
        </div>
      </div>
    `);

    this.showToast(`School registration complete! Welcome to ${name}.`, 'success');
  }

  // --- Invite Link Sign-up Submission Handler ---
  public handleJoinSchoolSubmit(event: Event, schoolId: string, token: string): void {
    event.preventDefault();
    const name = (document.getElementById('join-usr-name') as HTMLInputElement)?.value?.trim() || '';
    const email = (document.getElementById('join-usr-email') as HTMLInputElement)?.value?.trim() || '';
    const phone = (document.getElementById('join-usr-phone') as HTMLInputElement)?.value?.trim() || '';
    const password = (document.getElementById('join-usr-password') as HTMLInputElement)?.value || '';
    const confirm = (document.getElementById('join-usr-confirm') as HTMLInputElement)?.value || '';

    // Validate basic fields
    if (!name || !email || !password) {
      this.showToast('Please fill in all required fields.', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.showToast('Please enter a valid email address.', 'error');
      return;
    }

    if (password.length < 6) {
      this.showToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    if (password !== confirm) {
      this.showToast('Passwords do not match!', 'error');
      const form = document.getElementById('form-join-school');
      if (form) form.classList.add('form-shake');
      setTimeout(() => form?.classList.remove('form-shake'), 400);
      return;
    }

    if (this.store.getUserByEmail(email)) {
      this.showToast('An account with this email address already exists. Please log in.', 'error');
      return;
    }

    // Validate invite token and school status
    const validation = this.store.validateInvite(token, schoolId);
    if (!validation.valid || !validation.school || !validation.invite) {
      this.showToast(validation.reason || 'This invite link is invalid or has expired.', 'error');
      this.render();
      return;
    }

    const school = validation.school;
    const invite = validation.invite;

    // Enforce: school record must exist and be active
    if (school.status !== 'active') {
      this.showToast('This institution is currently inactive. Contact your school administrator.', 'error');
      return;
    }

    // Gather role-specific fields
    let specialty: string | undefined;
    let assignedSubjects: SubjectName[] = [];
    let studentClass: StudentClass | undefined;
    let department: Department | undefined;
    let admissionNumber: string | undefined;

    if (invite.role === 'teacher') {
      specialty = (document.getElementById('join-teacher-specialty') as HTMLInputElement)?.value?.trim() || 'General';
      const checkedBoxes = document.querySelectorAll<HTMLInputElement>('input[name="join-subjects"]:checked');
      assignedSubjects = Array.from(checkedBoxes).map((cb) => cb.value as SubjectName);
    } else {
      studentClass = ((document.getElementById('join-student-class') as HTMLSelectElement)?.value || 'SS1') as StudentClass;
      department = ((document.getElementById('join-student-dept') as HTMLSelectElement)?.value || 'Science') as Department;
      admissionNumber = (document.getElementById('join-student-admission') as HTMLInputElement)?.value?.trim() || `ADM/${school.code}/${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const newUser: User = {
      id: 'usr_' + Date.now(),
      name,
      email,
      phone: phone || undefined,
      password,
      role: invite.role,
      schoolId: school.id,
      approvalStatus: 'pending',
      status: 'active',
      verified: true,
      joinedAt: new Date().toISOString(),
      specialty,
      assignedSubjects,
      teacherType: invite.role === 'teacher' ? 'subject_teacher' : undefined,
      studentClass,
      department: invite.role === 'student' && SENIOR_CLASSES.includes(studentClass as any) ? department : undefined,
      admissionNumber,
    };

    this.store.addUser(newUser);
    this.store.incrementInviteUsage(invite.id);

    // Render join confirmation
    const root = document.getElementById('app');
    if (root) {
      root.innerHTML = renderJoinSuccess(school, invite.role, name) + renderModalsContainer();
    }
    this.showToast('Registration submitted for approval! The school administrator will activate your account.', 'success');
  }

  // --- Invite & Approval Management Modal Handlers ---
  public openSchoolInvitesModal(): void {
    const currentUser = this.store.getCurrentUser();
    if (!currentUser) return;
    const school = this.store.getSchoolById(currentUser.schoolId);
    if (!school) return;
    const invites = this.store.getInvites(school.id);
    this.showModal(buildSchoolInvitesModalHtml(school, invites, this.store));
  }

  public openPendingApprovalsModal(): void {
    const currentUser = this.store.getCurrentUser();
    if (!currentUser) return;
    const school = this.store.getSchoolById(currentUser.schoolId);
    if (!school) return;
    const pendingUsers = this.store.getPendingUsers(school.id);
    this.showModal(buildPendingApprovalsModalHtml(school, pendingUsers, this.store));
  }

  public handleGenerateInviteSubmit(event: Event, schoolId: string): void {
    event.preventDefault();
    const role = ((document.getElementById('new-inv-role') as HTMLSelectElement)?.value || 'teacher') as 'teacher' | 'student';
    const label = (document.getElementById('new-inv-label') as HTMLInputElement)?.value?.trim() || '';
    const expiryDays = parseInt((document.getElementById('new-inv-expiry') as HTMLSelectElement)?.value || '7', 10);
    const maxUses = parseInt((document.getElementById('new-inv-max') as HTMLSelectElement)?.value || '0', 10);

    let expiresAt: string | undefined = undefined;
    if (expiryDays > 0) {
      const d = new Date();
      d.setDate(d.getDate() + expiryDays);
      expiresAt = d.toISOString();
    }

    const currentUser = this.store.getCurrentUser();
    this.store.addInvite({
      schoolId,
      role,
      label: label || `${role === 'teacher' ? 'Faculty' : 'Student'} Onboarding Link`,
      expiresAt,
      maxUses: maxUses > 0 ? maxUses : undefined,
      createdBy: currentUser?.id,
    });

    this.showToast('Secure invite link generated successfully!', 'success');
    const school = this.store.getSchoolById(schoolId);
    if (school) {
      const invites = this.store.getInvites(schoolId);
      this.showModal(buildSchoolInvitesModalHtml(school, invites, this.store));
    }
    this.render();
  }

  public handleRevokeInvite(inviteId: string): void {
    this.store.revokeInvite(inviteId);
    this.showToast('Invite link has been revoked.', 'info');
    const currentUser = this.store.getCurrentUser();
    if (currentUser) {
      const school = this.store.getSchoolById(currentUser.schoolId);
      if (school) {
        const invites = this.store.getInvites(school.id);
        this.showModal(buildSchoolInvitesModalHtml(school, invites, this.store));
      }
    }
    this.render();
  }

  public handleApproveUser(userId: string): void {
    const currentUser = this.store.getCurrentUser();
    const approved = this.store.approveUser(userId, currentUser?.id);
    if (approved) {
      this.showToast(`Account approved for ${approved.name}. Full access granted.`, 'success');
    }
    if (currentUser) {
      const school = this.store.getSchoolById(currentUser.schoolId);
      if (school) {
        const pendingUsers = this.store.getPendingUsers(school.id);
        if (pendingUsers.length > 0) {
          this.showModal(buildPendingApprovalsModalHtml(school, pendingUsers, this.store));
        } else {
          this.closeModal();
        }
      }
    }
    this.render();
  }

  public handleRejectUser(userId: string): void {
    this.store.rejectUser(userId);
    this.showToast('Applicant request rejected.', 'info');
    const currentUser = this.store.getCurrentUser();
    if (currentUser) {
      const school = this.store.getSchoolById(currentUser.schoolId);
      if (school) {
        const pendingUsers = this.store.getPendingUsers(school.id);
        if (pendingUsers.length > 0) {
          this.showModal(buildPendingApprovalsModalHtml(school, pendingUsers, this.store));
        } else {
          this.closeModal();
        }
      }
    }
    this.render();
  }

  // --- Real Email Diagnostics & Testing ---
  public async openEmailTesterModal(userEmail?: string): Promise<void> {
    const currentUser = this.store.getCurrentUser();
    const defaultEmail = userEmail || currentUser?.email || 'elcrest9@gmail.com';
    this.showModal(buildEmailTesterModalHtml(defaultEmail));

    // Poll current server email status
    try {
      const status = await checkEmailConfigStatus();
      const badge = document.getElementById('email-config-badge');
      const hint = document.getElementById('email-status-hint');
      const senderDisplay = document.getElementById('email-sender-display');

      if (senderDisplay && status.sender) {
        senderDisplay.textContent = status.sender;
      }

      if (badge && hint) {
        if (status.configured) {
          badge.className = 'badge badge-success';
          badge.style.background = '#059669';
          badge.style.color = '#FFFFFF';
          badge.textContent = '● Provider Active';
          hint.innerHTML = '<span style="color: #059669; font-weight: 600;">✓ RESEND_API_KEY detected.</span> Live emails will be dispatched.';
        } else {
          badge.className = 'badge badge-warning';
          badge.style.background = '#FEF3C7';
          badge.style.color = '#92400E';
          badge.textContent = '⚠ Missing API Key';
          hint.innerHTML = '<span style="color: #B45309;">RESEND_API_KEY not found in environment.</span> Please set <code>RESEND_API_KEY</code> in Settings &gt; Secrets.';
        }
      }
    } catch (e) {
      console.warn('Could not check email status:', e);
    }
  }

  public async handleSendTestEmailSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const targetInput = document.getElementById('test-email-target') as HTMLInputElement;
    const btn = document.getElementById('btn-dispatch-test-email') as HTMLButtonElement;
    const resultBox = document.getElementById('test-email-result');

    const toEmail = targetInput?.value?.trim() || '';
    if (!toEmail) {
      this.showToast('Please enter a destination email address.', 'error');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '⏳ Dispatching...';
    }

    if (resultBox) {
      resultBox.style.display = 'block';
      resultBox.style.background = '#EFF6FF';
      resultBox.style.border = '1px solid #BFDBFE';
      resultBox.style.color = '#1E40AF';
      resultBox.innerHTML = `Sending test email to <strong>${toEmail}</strong> via Resend API...`;
    }

    try {
      const response = await sendTestEmail(toEmail);
      if (response.success) {
        this.showToast(`Test email successfully sent to ${toEmail}! Check your inbox.`, 'success');
        if (resultBox) {
          resultBox.style.background = '#F0FDF4';
          resultBox.style.border = '1px solid #86EFAC';
          resultBox.style.color = '#15803D';
          resultBox.innerHTML = `
            <div style="font-weight: 700; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
              <span>✓</span> Test Email Dispatched Successfully!
            </div>
            <div><strong>Recipient:</strong> ${toEmail}</div>
            ${response.messageId ? `<div><strong>Message ID:</strong> <code>${response.messageId}</code></div>` : ''}
            <div style="margin-top: 8px; font-size: 12px; color: #166534;">
              Check your inbox (and spam/promotions folder). Next, we can proceed to connect verification codes!
            </div>
          `;
        }
      } else {
        const errorMsg = response.error || 'Failed to dispatch email.';
        this.showToast(errorMsg, 'error');
        if (resultBox) {
          resultBox.style.background = '#FEF2F2';
          resultBox.style.border = '1px solid #FECACA';
          resultBox.style.color = '#991B1B';
          resultBox.innerHTML = `
            <div style="font-weight: 700; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
              <span>⚠</span> Email Dispatch Error
            </div>
            <div style="font-family: monospace; font-size: 12px; word-break: break-all; margin-top: 4px; background: rgba(0,0,0,0.04); padding: 8px; border-radius: 4px;">
              ${errorMsg}
            </div>
            <div style="margin-top: 8px; font-size: 12px; color: #7F1D1D;">
              <strong>Troubleshooting Guide:</strong><br>
              1. If using Resend sandbox mode without verified domain, ensure recipient is the same email used on your Resend account.<br>
              2. Verify that <code>RESEND_API_KEY</code> starts with <code>re_</code> and is set in your environment.
            </div>
          `;
        }
      }
    } catch (err: any) {
      this.showToast('Unexpected network error.', 'error');
      if (resultBox) {
        resultBox.style.display = 'block';
        resultBox.style.background = '#FEF2F2';
        resultBox.style.color = '#991B1B';
        resultBox.innerHTML = `Error: ${err?.message || 'Unknown network error'}`;
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '🚀 Dispatch Test Email';
      }
    }
  }

  public closeModalAndLogin(email: string): void {
    this.closeModal();
    window.location.hash = '#login';
    setTimeout(() => {
      const emailInput = document.getElementById('login-email') as HTMLInputElement;
      if (emailInput) {
        emailInput.value = email;
        const passInput = document.getElementById('login-password') as HTMLInputElement;
        passInput?.focus();
      }
    }, 100);
  }

  public toggleRoleFields(role: string): void {
    const classDiv = document.getElementById('field-student-class');
    const specialtyDiv = document.getElementById('field-teacher-specialty');
    const btn = document.getElementById('btn-submit-register-usr');

    if (role === 'teacher') {
      if (classDiv) classDiv.style.display = 'none';
      if (specialtyDiv) specialtyDiv.style.display = 'block';
      if (btn) btn.style.background = '#0F766E';
    } else {
      if (classDiv) classDiv.style.display = 'block';
      if (specialtyDiv) specialtyDiv.style.display = 'none';
      if (btn) btn.style.background = '#6C63FF';
    }
  }

  public handleRegisterUser(event: Event): void {
    event.preventDefault();
    const name = (document.getElementById('reg-usr-name') as HTMLInputElement)?.value?.trim() || '';
    const email = (document.getElementById('reg-usr-email') as HTMLInputElement)?.value?.trim() || '';
    const password = (document.getElementById('reg-usr-password') as HTMLInputElement)?.value || '';
    const confirm = (document.getElementById('reg-usr-confirm') as HTMLInputElement)?.value || '';
    const role = ((document.getElementById('reg-usr-role') as HTMLSelectElement)?.value || 'student') as 'teacher' | 'student';
    const schoolCode = (document.getElementById('reg-usr-code') as HTMLInputElement)?.value?.trim()?.toUpperCase() || '';

    if (!name || !email || !password || !schoolCode) {
      this.showToast('Please fill in all required fields.', 'error');
      return;
    }

    if (password !== confirm) {
      this.showToast('Passwords do not match!', 'error');
      const form = document.getElementById('form-register-user');
      form?.classList.add('form-shake');
      setTimeout(() => form?.classList.remove('form-shake'), 400);
      return;
    }

    if (this.store.getUserByEmail(email)) {
      this.showToast('An account with this email already exists.', 'error');
      return;
    }

    const school = this.store.getSchoolById(schoolCode);
    if (!school) {
      this.showToast(`Invalid school code "${schoolCode}". The institution must be registered first by the School Admin.`, 'error');
      const codeInput = document.getElementById('reg-usr-code');
      codeInput?.classList.add('form-shake');
      setTimeout(() => codeInput?.classList.remove('form-shake'), 400);
      return;
    }

    let studentClass: StudentClass | undefined;
    let specialty: SubjectName | undefined;

    if (role === 'student') {
      studentClass = ((document.getElementById('reg-usr-class') as HTMLSelectElement)?.value || 'SS2') as StudentClass;
    } else {
      specialty = ((document.getElementById('reg-usr-specialty') as HTMLSelectElement)?.value || 'Mathematics') as SubjectName;
    }

    const newUser: User = {
      id: 'usr_' + Date.now(),
      name,
      email,
      password,
      role,
      teacherType: role === 'teacher' ? 'subject_teacher' : undefined,
      assignedSubjects: specialty ? [specialty] : undefined,
      schoolId: school.id,
      studentClass,
      specialty,
      verified: false,
      joinedAt: new Date().toISOString(),
      status: 'active',
    };

    const demoCode = generateVerificationCode();
    this.pendingUserRegistration = { user: newUser, code: demoCode };

    this.showToast(`School verified: ${school.name}!`, 'info');
    window.location.hash = '#verify-email';
  }

  public handleCodeDigit(input: HTMLInputElement, index: number): void {
    if (input.value.length >= 1) {
      input.value = input.value.slice(0, 1);
      const next = document.getElementById(`code-${index + 1}`);
      if (next) (next as HTMLInputElement).focus();
    }
  }

  public handleCodeKey(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace') {
      const input = document.getElementById(`code-${index}`) as HTMLInputElement;
      if (input && input.value === '' && index > 0) {
        const prev = document.getElementById(`code-${index - 1}`) as HTMLInputElement;
        if (prev) {
          prev.focus();
          prev.value = '';
        }
      }
    }
  }

  public handleVerifyEmail(event: Event): void {
    event.preventDefault();
    if (!this.pendingUserRegistration) return;

    let enteredCode = '';
    for (let i = 0; i < 6; i++) {
      const digit = (document.getElementById(`code-${i}`) as HTMLInputElement)?.value || '';
      enteredCode += digit;
    }

    if (enteredCode === this.pendingUserRegistration.code) {
      const verifiedUser = { ...this.pendingUserRegistration.user, verified: true };
      this.store.addUser(verifiedUser);
      this.pendingUserRegistration = null;
      this.showToast('Email verified successfully! You can now log in.', 'success');
      window.location.hash = '#login';
    } else {
      this.showToast('Incorrect verification code. Please check demo code.', 'error');
      const form = document.getElementById('form-verify-email');
      form?.classList.add('form-shake');
      setTimeout(() => form?.classList.remove('form-shake'), 400);
    }
  }

  public resendVerificationCode(): void {
    if (!this.pendingUserRegistration) return;
    const newCode = generateVerificationCode();
    this.pendingUserRegistration.code = newCode;
    this.showToast(`New verification code sent! Demo: ${newCode}`, 'info');
    this.render();
  }

  public handleLogin(event: Event): void {
    event.preventDefault();
    const email = (document.getElementById('login-email') as HTMLInputElement)?.value?.trim() || '';
    const password = (document.getElementById('login-password') as HTMLInputElement)?.value || '';

    if (!email || !password) {
      this.showToast('Please enter both email and password.', 'error');
      return;
    }

    const user = this.store.getUserByEmail(email);
    if (!user || user.password !== password) {
      this.showToast('Invalid email or password.', 'error');
      const form = document.getElementById('form-login');
      form?.classList.add('form-shake');
      setTimeout(() => form?.classList.remove('form-shake'), 400);
      return;
    }

    if (user.status === 'suspended') {
      this.showToast('Your account is currently suspended. Contact your administrator.', 'error');
      return;
    }

    this.store.setCurrentUser(user);
    this.showToast(`Welcome back, ${user.name}!`, 'success');
    window.location.hash = '#dashboard';
    this.render();
  }

  public logout(): void {
    this.store.setCurrentUser(null);
    this.showToast('Signed out successfully.', 'info');
    window.location.hash = '';
    this.render();
  }

  // --- Super Admin Handlers ---
  public handleSuperAdminLogin(event: Event): void {
    event.preventDefault();
    const email = (document.getElementById('super-email') as HTMLInputElement)?.value?.trim() || '';
    const password = (document.getElementById('super-password') as HTMLInputElement)?.value || '';

    if (email === 'superadmin@schoolhub.com' && password === 'SuperAdmin@2025') {
      this.currentSuperAdminLoggedIn = true;
      this.showToast('Root access granted.', 'success');
      this.render();
    } else {
      this.showToast('Access denied: Invalid root credentials.', 'error');
      const form = document.getElementById('form-super-login');
      form?.classList.add('form-shake');
      setTimeout(() => form?.classList.remove('form-shake'), 400);
    }
  }

  public logoutSuperAdmin(): void {
    this.currentSuperAdminLoggedIn = false;
    this.showToast('System session terminated.', 'info');
    window.location.hash = '';
    this.render();
  }

  public setSuperAdminTab(tab: string): void {
    this.superAdminTab = tab;
    this.render();
  }

  public filterSuperAdminSchools(query: string): void {
    this.superAdminSearch = query;
    this.render();
  }

  public filterSuperAdminUsersSearch(query: string): void {
    this.superAdminSearch = query;
    this.render();
  }

  public filterSuperAdminUsersRole(role: string): void {
    this.superAdminRoleFilter = role;
    this.render();
  }

  public filterSuperAdminUsersSchool(schoolId: string): void {
    this.superAdminSchoolFilter = schoolId;
    this.render();
  }

  public viewSchoolDetails(schoolId: string): void {
    const school = this.store.getSchoolById(schoolId);
    if (!school) return;
    const users = this.store.getUsers().filter((u) => u.schoolId === school.id);
    this.showModal(buildSchoolDetailsModalHtml(school, users));
  }

  public toggleSchoolStatus(schoolId: string): void {
    const school = this.store.getSchoolById(schoolId);
    if (!school) return;
    const newStatus = school.status === 'active' ? 'suspended' : 'active';
    this.store.updateSchool(schoolId, { status: newStatus });
    this.showToast(`School ${newStatus === 'active' ? 'activated' : 'suspended'}.`, 'info');
    this.render();
  }

  public confirmDeleteSchool(schoolId: string): void {
    const school = this.store.getSchoolById(schoolId);
    if (!school) return;
    this.confirmActionCallback = () => {
      this.store.deleteSchool(schoolId);
      this.showToast(`School ${school.name} deleted.`, 'info');
      this.closeModal();
      this.render();
    };
    this.showModal(buildConfirmModalHtml('Delete School', `Are you sure you want to delete ${school.name}? All associated users and records will be removed.`, 'executeConfirmedAction'));
  }

  public toggleUserStatus(userId: string): void {
    const user = this.store.getUserById(userId);
    if (!user) return;
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    this.store.updateUser(userId, { status: newStatus });
    this.showToast(`User ${newStatus === 'active' ? 'activated' : 'suspended'}.`, 'info');
    this.render();
  }

  public confirmDeleteUser(userId: string): void {
    const user = this.store.getUserById(userId);
    if (!user) return;
    this.confirmActionCallback = () => {
      this.store.deleteUser(userId);
      this.showToast(`User ${user.name} removed.`, 'info');
      this.closeModal();
      this.render();
    };
    this.showModal(buildConfirmModalHtml('Delete User', `Are you sure you want to delete ${user.name}?`, 'executeConfirmedAction'));
  }

  public handleSuperAdminSaveSettings(event: Event): void {
    event.preventDefault();
    const name = (document.getElementById('setting-platform-name') as HTMLInputElement)?.value?.trim() || 'SchoolHub';
    const maintenance = !!(document.getElementById('setting-maintenance') as HTMLInputElement)?.checked;
    this.store.setPlatformName(name);
    this.store.setMaintenanceMode(maintenance);
    this.showToast('System configuration saved.', 'success');
  }

  public exportDataJSON(): void {
    const jsonStr = this.store.exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schoolhub-platform-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Platform data backup downloaded.', 'success');
  }

  // --- School Admin Actions ---
  public setSchoolAdminTab(tab: string): void {
    this.schoolAdminTab = tab;
    this.render();
  }

  public setSchoolAdminClassFilter(cls: string): void {
    this.schoolAdminClassFilter = cls;
    this.render();
  }

  public setAdminResultFilters(cls?: string, term?: string, session?: string): void {
    if (cls !== undefined) this.schoolAdminResultClass = cls;
    if (term !== undefined) this.schoolAdminResultTerm = term;
    if (session !== undefined) this.schoolAdminResultSession = session;
    this.render();
  }

  public filterAdminFeeClass(cls: string): void {
    this.adminFeeClassFilter = cls;
    this.render();
  }

  public filterAdminFeeStatus(status: string): void {
    this.adminFeeStatusFilter = status;
    this.render();
  }

  public filterAdminFeeSearch(q: string): void {
    this.adminFeeSearch = q;
    this.render();
  }

  public toggleFeeEnforcementSetting(enforce: boolean): void {
    const currentUser = this.store.getCurrentUser();
    if (!currentUser) return;
    this.store.updateSchool(currentUser.schoolId, { enforceFeeClearanceForResults: enforce });
    this.showToast(`Fee clearance enforcement for terminal results ${enforce ? 'ENABLED' : 'DISABLED'}.`, 'info');
    this.render();
  }

  // --- Subject Registry Handlers ---
  public openSubjectRegistryModal(subjectId?: string): void {
    const currentUser = this.store.getCurrentUser();
    if (!currentUser) return;
    const subject = subjectId ? this.store.getRegistrySubjects(currentUser.schoolId).find((s) => s.id === subjectId) : undefined;
    this.showModal(buildSubjectRegistryModalHtml(subject, currentUser.schoolId));
  }

  public toggleSubjectRegistryLevel(level: string): void {
    const deptDiv = document.getElementById('reg-sub-depts-wrapper');
    if (deptDiv) {
      deptDiv.style.display = level === 'junior' ? 'none' : 'block';
    }
  }

  public handleSaveRegistrySubject(event: Event, subjectId?: string): void {
    event.preventDefault();
    const currentUser = this.store.getCurrentUser();
    if (!currentUser) return;

    const code = (document.getElementById('reg-sub-code') as HTMLInputElement)?.value?.trim()?.toUpperCase() || '';
    const name = (document.getElementById('reg-sub-name') as HTMLInputElement)?.value?.trim() || '';
    const level = ((document.getElementById('reg-sub-level') as HTMLSelectElement)?.value || 'both') as any;
    const category = ((document.getElementById('reg-sub-cat') as HTMLSelectElement)?.value || 'core') as any;
    const status = ((document.getElementById('reg-sub-status') as HTMLSelectElement)?.value || 'active') as 'active' | 'inactive';

    if (!code || !name) {
      this.showToast('Subject name and code are required.', 'error');
      return;
    }

    const checkedDepts: Department[] = [];
    const deptCheckboxes = document.querySelectorAll<HTMLInputElement>('input[name="reg_sub_depts"]:checked');
    deptCheckboxes.forEach((cb) => checkedDepts.push(cb.value as Department));

    const checkedClasses: StudentClass[] = [];
    const checkboxes = document.querySelectorAll<HTMLInputElement>('input[name="reg_sub_classes"]:checked');
    checkboxes.forEach((cb) => checkedClasses.push(cb.value as StudentClass));

    if (subjectId) {
      this.store.updateRegistrySubject(subjectId, {
        code,
        name,
        level,
        category,
        departments: checkedDepts,
        activeClasses: checkedClasses,
        status,
      });
      this.showToast(`Subject ${name} updated in registry.`, 'success');
    } else {
      const newSubject: RegistrySubject = {
        id: 'rsub_' + Date.now(),
        schoolId: currentUser.schoolId,
        code,
        name,
        level,
        category,
        departments: checkedDepts,
        activeClasses: checkedClasses,
        status,
        isDefault: false,
      };
      this.store.addRegistrySubject(newSubject);
      this.showToast(`Subject ${name} (${code}) added to registry!`, 'success');
    }

    this.closeModal();
    this.render();
  }

  public toggleRegistrySubjectStatus(subjectId: string): void {
    const sub = this.store.getRegistrySubjects().find((s) => s.id === subjectId);
    if (!sub) return;
    const newStatus = sub.status === 'active' ? 'inactive' : 'active';
    this.store.updateRegistrySubject(subjectId, { status: newStatus });
    this.showToast(`Subject ${sub.name} is now ${newStatus}.`, 'info');
    this.render();
  }

  public deleteRegistrySubject(subjectId: string): void {
    const sub = this.store.getRegistrySubjects().find((s) => s.id === subjectId);
    if (!sub) return;
    this.confirmActionCallback = () => {
      this.store.deleteRegistrySubject(subjectId);
      this.showToast(`Subject ${sub.name} removed from registry.`, 'info');
      this.closeModal();
      this.render();
    };
    this.showModal(buildConfirmModalHtml('Delete Subject', `Are you sure you want to delete ${sub.name} from the subject registry?`, 'executeConfirmedAction'));
  }

  public resetSubjectRegistryToDefault(schoolId: string): void {
    this.confirmActionCallback = () => {
      this.store.resetSchoolSubjectRegistry(schoolId);
      this.showToast('Subject registry reset to national standard curriculum.', 'success');
      this.closeModal();
      this.render();
    };
    this.showModal(buildConfirmModalHtml('Reset Subject Registry', 'This will restore all default Junior and Senior curriculum subjects. Continue?', 'executeConfirmedAction'));
  }

  // --- Fee Management Handlers ---
  public openRecordFeePaymentModal(studentId?: string, defaultClass?: string): void {
    const currentUser = this.store.getCurrentUser();
    if (!currentUser) return;
    this.showModal(buildRecordFeePaymentModalHtml(currentUser.schoolId, studentId, defaultClass));
  }

  public handleFeeStudentChange(studentId: string, schoolId: string): void {
    const student = this.store.getUserById(studentId);
    if (!student) return;

    const term = (document.getElementById('fee-pay-term') as HTMLSelectElement)?.value || '1st Term';
    const session = (document.getElementById('fee-pay-session') as HTMLInputElement)?.value || '2024/2025';
    const summary = this.store.getStudentFeeSummary(schoolId, studentId, term, session);

    const classInput = document.getElementById('fee-pay-class') as HTMLInputElement;
    const billedInput = document.getElementById('fee-pay-billed') as HTMLInputElement;
    const paidInput = document.getElementById('fee-pay-paid') as HTMLInputElement;
    const balInput = document.getElementById('fee-pay-bal') as HTMLInputElement;
    const amountInput = document.getElementById('fee-pay-amount') as HTMLInputElement;

    if (classInput) classInput.value = student.studentClass || 'SS2';
    if (billedInput) billedInput.value = `₦${summary.totalBilled.toLocaleString()}`;
    if (paidInput) paidInput.value = `₦${summary.totalPaid.toLocaleString()}`;
    if (balInput) balInput.value = `₦${summary.balance.toLocaleString()}`;
    if (amountInput && summary.balance > 0) amountInput.value = summary.balance.toString();
  }

  public handleRecordFeePayment(event: Event, schoolId: string): void {
    event.preventDefault();
    const currentUser = this.store.getCurrentUser();
    if (!currentUser) return;

    const studentSelect = document.getElementById('fee-pay-student') as HTMLSelectElement | null;
    const studentId = studentSelect?.value;
    if (!studentId) {
      this.showToast('Please select a student.', 'error');
      return;
    }
    const student = this.store.getUserById(studentId);
    if (!student) {
      this.showToast('Please select a valid student.', 'error');
      return;
    }

    const term = ((document.getElementById('fee-pay-term') as HTMLSelectElement)?.value || '1st Term') as any;
    const session = (document.getElementById('fee-pay-session') as HTMLInputElement)?.value?.trim() || '2024/2025';
    const amountPaid = parseFloat((document.getElementById('fee-pay-amount') as HTMLInputElement)?.value || '0');
    const paymentMethod = ((document.getElementById('fee-pay-method') as HTMLSelectElement)?.value || 'Cash') as any;
    const notes = (document.getElementById('fee-pay-notes') as HTMLInputElement)?.value?.trim() || '';

    if (isNaN(amountPaid) || amountPaid <= 0) {
      this.showToast('Please enter a valid payment amount.', 'error');
      return;
    }

    const summary = this.store.getStudentFeeSummary(schoolId, studentId, term, session);
    const balanceAfter = Math.max(0, summary.balance - amountPaid);
    const receiptNumber = `REC-${Date.now().toString().slice(-6)}`;

    const payment = this.store.recordFeePayment({
      schoolId,
      studentId,
      studentName: student.name,
      studentClass: student.studentClass || 'SS2',
      term,
      session,
      amountPaid,
      balanceAfter,
      receiptNumber,
      paymentMethod,
      recordedBy: currentUser.id,
      notes: notes || undefined,
    });

    this.showToast(`Payment of ₦${amountPaid.toLocaleString()} recorded for ${student.name}! Receipt: ${receiptNumber}`, 'success');
    this.closeModal();
    this.viewFeeReceiptModal(payment.id);
  }

  public viewFeeReceiptModal(paymentId: string): void {
    const payment = this.store.getFeePayments().find((p) => p.id === paymentId);
    if (!payment) return;
    const school = this.store.getSchoolById(payment.schoolId) || ({ name: 'Institution', code: payment.schoolId, state: 'Lagos' } as School);
    this.showModal(buildFeeReceiptModalHtml(payment, school));
  }

  public openFeeScheduleModal(defaultClass: StudentClass = 'SS2'): void {
    const currentUser = this.store.getCurrentUser();
    if (!currentUser) return;
    this.showModal(buildFeeScheduleModalHtml(currentUser.schoolId, defaultClass));
  }

  public handleFeeScheduleClassChange(className: string, schoolId: string): void {
    const term = (document.getElementById('sch-fee-term') as HTMLSelectElement)?.value || '1st Term';
    const session = (document.getElementById('sch-fee-session') as HTMLInputElement)?.value || '2024/2025';
    const schedule = this.store.getFeeSchedule(schoolId, className as StudentClass, term, session);

    const tuitionInput = document.getElementById('sch-fee-tuition') as HTMLInputElement;
    const devInput = document.getElementById('sch-fee-dev') as HTMLInputElement;
    const examInput = document.getElementById('sch-fee-exam') as HTMLInputElement;
    const ictInput = document.getElementById('sch-fee-ict') as HTMLInputElement;
    const otherInput = document.getElementById('sch-fee-other') as HTMLInputElement;
    const totalInput = document.getElementById('sch-fee-total') as HTMLInputElement;

    if (tuitionInput) tuitionInput.value = (schedule?.tuitionFee || 60000).toString();
    if (devInput) devInput.value = (schedule?.developmentLevy || 20000).toString();
    if (examInput) examInput.value = (schedule?.examFee || 10000).toString();
    if (ictInput) ictInput.value = (schedule?.ictFee || 10000).toString();
    if (otherInput) otherInput.value = (schedule?.otherCharges || 10000).toString();
    if (totalInput) totalInput.value = (schedule?.totalAmount || 110000).toString();
  }

  public recalcFeeScheduleTotal(): void {
    const tuition = parseFloat((document.getElementById('sch-fee-tuition') as HTMLInputElement)?.value || '0') || 0;
    const dev = parseFloat((document.getElementById('sch-fee-dev') as HTMLInputElement)?.value || '0') || 0;
    const exam = parseFloat((document.getElementById('sch-fee-exam') as HTMLInputElement)?.value || '0') || 0;
    const ict = parseFloat((document.getElementById('sch-fee-ict') as HTMLInputElement)?.value || '0') || 0;
    const other = parseFloat((document.getElementById('sch-fee-other') as HTMLInputElement)?.value || '0') || 0;
    const total = tuition + dev + exam + ict + other;

    const totalInput = document.getElementById('sch-fee-total') as HTMLInputElement;
    if (totalInput) totalInput.value = total.toString();
  }

  public handleSaveFeeSchedule(event: Event, schoolId: string): void {
    event.preventDefault();
    const studentClass = ((document.getElementById('sch-fee-class') as HTMLSelectElement)?.value || 'SS2') as StudentClass;
    const term = ((document.getElementById('sch-fee-term') as HTMLSelectElement)?.value || '1st Term') as any;
    const session = (document.getElementById('sch-fee-session') as HTMLInputElement)?.value?.trim() || '2024/2025';

    const tuitionFee = parseFloat((document.getElementById('sch-fee-tuition') as HTMLInputElement)?.value || '0');
    const developmentLevy = parseFloat((document.getElementById('sch-fee-dev') as HTMLInputElement)?.value || '0');
    const examFee = parseFloat((document.getElementById('sch-fee-exam') as HTMLInputElement)?.value || '0');
    const ictFee = parseFloat((document.getElementById('sch-fee-ict') as HTMLInputElement)?.value || '0');
    const otherCharges = parseFloat((document.getElementById('sch-fee-other') as HTMLInputElement)?.value || '0');
    const totalAmount = tuitionFee + developmentLevy + examFee + ictFee + otherCharges;

    this.store.setFeeSchedule({
      id: `fs_${studentClass}_${term}_${session}`,
      schoolId,
      studentClass,
      term,
      session,
      tuitionFee,
      developmentLevy,
      examFee,
      ictFee,
      otherCharges,
      totalAmount,
      updatedAt: new Date().toISOString(),
    });

    this.showToast(`Fee schedule for ${studentClass} (${term}) saved successfully!`, 'success');
    this.closeModal();
    this.render();
  }

  // --- Teacher Management Handlers ---
  public openAdminRegisterTeacherModal(teacherId?: string): void {
    const currentUser = this.store.getCurrentUser();
    if (!currentUser) return;
    const school = this.store.getSchoolById(currentUser.schoolId);
    if (!school) {
      this.showToast('Error: School record not found.', 'error');
      return;
    }
    const teacher = teacherId ? this.store.getUserById(teacherId) : undefined;
    this.showModal(buildAdminRegisterTeacherModalHtml(school.id, school.name, teacher));
  }

  public toggleAdminTeacherRoleType(type: string): void {
    console.log('[SchoolHub Trigger] toggleAdminTeacherRoleType called with value:', type);
    const formClassWrapper = document.getElementById('adm-teach-class-wrapper');
    const isClassTeacher = type === 'class_teacher' || type === 'Class Teacher';
    if (formClassWrapper) {
      formClassWrapper.style.display = isClassTeacher ? 'block' : 'none';
      console.log('[SchoolHub UI] adm-teach-class-wrapper display set to:', formClassWrapper.style.display);
    }
  }

  public handleTeacherTypeChange(type: string): void {
    this.toggleAdminTeacherRoleType(type);
  }

  public handleAdminRegisterTeacher(event: Event, schoolId?: string, teacherId?: string): void {
    event.preventDefault();
    console.log('[SchoolHub Step 1: Trigger] handleAdminRegisterTeacher fired', { schoolId, teacherId });
    
    try {
      const currentUser = this.store.getCurrentUser();
      if (!currentUser) {
        this.showToast('Authentication error: No active session found.', 'error');
        return;
      }

      const nameInput = document.getElementById('adm-teach-name') as HTMLInputElement;
      const emailInput = document.getElementById('adm-teach-email') as HTMLInputElement;
      const passInput = document.getElementById('adm-teach-pass') as HTMLInputElement | null;
      const roleSelect = document.getElementById('adm-teach-role') as HTMLSelectElement;
      const classSelect = document.getElementById('adm-teach-class') as HTMLSelectElement | null;

      if (!nameInput || !emailInput || !roleSelect) {
        console.error('[SchoolHub Error] Missing expected form elements in DOM.');
        this.showToast('Error: Teacher form inputs could not be found.', 'error');
        return;
      }

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passInput?.value;
      const rawRoleValue = roleSelect.value;

      // Normalize role / teacherType
      const isClassTeacher = rawRoleValue === 'class_teacher' || rawRoleValue === 'Class Teacher';
      const teacherType: TeacherType = isClassTeacher ? 'class_teacher' : 'subject_teacher';

      let assignedClass: StudentClass | undefined = undefined;
      if (isClassTeacher) {
        assignedClass = (classSelect?.value as StudentClass) || 'SS2';
      }

      const checkedClasses: StudentClass[] = [];
      const classCbs = document.querySelectorAll<HTMLInputElement>('input[name="adm_teach_classes"]:checked');
      classCbs.forEach((cb) => checkedClasses.push(cb.value as StudentClass));
      if (isClassTeacher && assignedClass && !checkedClasses.includes(assignedClass)) {
        checkedClasses.push(assignedClass);
      }

      const checkedSubs: SubjectName[] = [];
      const subCbs = document.querySelectorAll<HTMLInputElement>('input[name="adm_teach_subjects"]:checked');
      subCbs.forEach((cb) => checkedSubs.push(cb.value as SubjectName));

      console.log('[SchoolHub Step 2: Data Flow] Payload prepared for submission:', {
        teacherId,
        name,
        email,
        rawRoleValue,
        teacherType,
        assignedClass,
        assignedClasses: checkedClasses,
        assignedSubjects: checkedSubs,
      });

      if (!teacherId && this.store.getUserByEmail(email)) {
        this.showToast('A user with this email already exists.', 'error');
        return;
      }

      if (teacherId) {
        const existingTeacher = this.store.getUserById(teacherId);
        if (!existingTeacher) {
          console.error('[SchoolHub Error] Teacher not found with ID:', teacherId);
          this.showToast(`Error: Teacher with ID "${teacherId}" was not found in storage.`, 'error');
          return;
        }

        const updates: Partial<User> = {
          name,
          email,
          role: 'teacher',
          teacherType,
          assignedClass,
          assignedClasses: checkedClasses.length > 0 ? checkedClasses : (assignedClass ? [assignedClass] : undefined),
          assignedSubjects: checkedSubs.length > 0 ? checkedSubs : existingTeacher.assignedSubjects,
          specialty: checkedSubs[0] || existingTeacher.specialty || 'General',
        };
        if (password) updates.password = password;

        console.log('[SchoolHub Step 5: Update Execution] Updating teacher in store:', updates);
        this.store.updateUser(teacherId, updates);
        
        const verified = this.store.getUserById(teacherId);
        console.log('[SchoolHub Step 5: Update Result] Verified user in store after write:', verified);

        const successMsg = isClassTeacher
          ? `Role updated successfully! ${name} is now assigned as Class Teacher for ${assignedClass}.`
          : `Role updated successfully! ${name} is now assigned as Subject Teacher.`;
        
        this.showToast(successMsg, 'success');
      } else {
        const newTeacher: User = {
          id: 'usr_' + Date.now(),
          name,
          email,
          password: password || 'Teacher@123',
          role: 'teacher',
          teacherType,
          assignedClass,
          assignedClasses: checkedClasses.length > 0 ? checkedClasses : (assignedClass ? [assignedClass] : ['SS2']),
          assignedSubjects: checkedSubs.length > 0 ? checkedSubs : ['Mathematics'],
          specialty: checkedSubs[0] || 'Mathematics',
          schoolId: schoolId || currentUser.schoolId,
          verified: true,
          joinedAt: new Date().toISOString(),
          status: 'active',
        };

        console.log('[SchoolHub Step 5: New Teacher Registration] Adding teacher to store:', newTeacher);
        this.store.addUser(newTeacher);
        this.showToast(`Teacher ${name} registered successfully!`, 'success');
      }

      console.log('[SchoolHub Step 6: UI Refresh] Closing modal and triggering re-render.');
      this.closeModal();
      this.render();
    } catch (err: any) {
      console.error('[SchoolHub Error] Failed to save/update teacher profile:', err);
      this.showToast(`Failed to update teacher role: ${err?.message || 'Unexpected error'}`, 'error');
    }
  }

  public handleSaveTeacher(event: Event, teacherId?: string, schoolId?: string): void {
    this.handleAdminRegisterTeacher(event, schoolId, teacherId);
  }

  // --- Student Enrolment Handlers ---
  public openEnrolStudentModal(defaultClass?: StudentClass): void {
    const currentUser = this.store.getCurrentUser();
    if (!currentUser) return;
    if (!this.store.canUserEnrolStudents(currentUser)) {
      this.showToast('Permission Denied: Only School Administrators and Class Teachers can enrol students.', 'error');
      return;
    }
    const initialClass = currentUser.role === 'teacher' && currentUser.teacherType === 'class_teacher' && currentUser.assignedClass
      ? currentUser.assignedClass
      : (defaultClass || this.teacherClass || 'SS2');
    this.showModal(buildEnrolStudentModalHtml(currentUser.schoolId, initialClass));
  }

  public openEditStudentModal(studentId: string): void {
    const currentUser = this.store.getCurrentUser();
    if (!currentUser) return;
    if (!this.store.canUserEnrolStudents(currentUser)) {
      this.showToast('Permission Denied: Only School Administrators and Class Teachers can edit student records.', 'error');
      return;
    }
    const student = studentId ? this.store.getUserById(studentId) : undefined;
    this.showModal(buildEnrolStudentModalHtml(currentUser.schoolId, undefined, student));
  }

  public handleStudentClassChange(className: string): void {
    const isSenior = SENIOR_CLASSES.includes(className as StudentClass);
    const deptWrapper = document.getElementById('enrol-stud-dept-wrapper');
    if (deptWrapper) {
      deptWrapper.style.display = isSenior ? 'block' : 'none';
    }
    const deptSelect = document.getElementById('enrol-stud-dept') as HTMLSelectElement;
    const department = isSenior ? (deptSelect?.value || 'Science') : undefined;
    this.updateStudentSubjectsPreview(className, department);
  }

  public handleStudentDeptChange(department: string): void {
    const classSelect = document.getElementById('enrol-stud-class') as HTMLSelectElement;
    const className = classSelect ? classSelect.value : 'SS2';
    this.updateStudentSubjectsPreview(className, department);
  }

  public updateStudentSubjectsPreview(className: string, department?: string): void {
    const currentUser = this.store.getCurrentUser();
    if (!currentUser) return;

    const subjects = this.store.getApplicableSubjectsForStudent(
      currentUser.schoolId,
      className as StudentClass,
      department as Department
    );

    const container = document.getElementById('enrol-stud-subjects-preview');
    if (container) {
      container.innerHTML = subjects.map((s) => `
        <span class="badge ${s.department ? 'badge-urgent' : 'badge-academic'}" style="font-size: 11px;">
          ${s.name} (${s.code}) ${s.department ? `&bull; ${s.department}` : ''}
        </span>
      `).join('');
    }
  }

  public handleEnrolStudent(event: Event, studentId?: string): void {
    event.preventDefault();
    const currentUser = this.store.getCurrentUser();
    if (!currentUser) return;

    if (!this.store.canUserEnrolStudents(currentUser)) {
      this.showToast('Permission Denied: Only School Administrators and Class Teachers can enrol or edit students.', 'error');
      return;
    }

    const name = (document.getElementById('enrol-stud-name') as HTMLInputElement)?.value?.trim() || '';
    const email = (document.getElementById('enrol-stud-email') as HTMLInputElement)?.value?.trim() || '';
    const admissionNumber = (document.getElementById('enrol-stud-adm') as HTMLInputElement)?.value?.trim() || '';
    const studentClass = ((document.getElementById('enrol-stud-class') as HTMLSelectElement)?.value || 'SS2') as StudentClass;
    const isSenior = SENIOR_CLASSES.includes(studentClass);
    const department = isSenior ? ((document.getElementById('enrol-stud-dept') as HTMLSelectElement)?.value as Department || 'Science') : undefined;
    const password = (document.getElementById('enrol-stud-pass') as HTMLInputElement)?.value;

    if (currentUser.role === 'teacher' && currentUser.teacherType === 'class_teacher' && currentUser.assignedClass && studentClass !== currentUser.assignedClass) {
      this.showToast(`Permission Denied: As a Class Teacher, you can only enrol students into your assigned class (${currentUser.assignedClass}).`, 'error');
      return;
    }

    if (!name || !email) {
      this.showToast('Please fill in student name and email.', 'error');
      return;
    }

    if (!studentId && this.store.getUserByEmail(email)) {
      this.showToast('A user with this email already exists.', 'error');
      return;
    }

    if (studentId) {
      const updates: Partial<User> = {
        name,
        email,
        admissionNumber,
        studentClass,
        department,
      };
      if (password) updates.password = password;
      this.store.updateUser(studentId, updates);
      this.showToast(`Student profile for ${name} updated!`, 'success');
    } else {
      const newStudent: User = {
        id: 'usr_' + Date.now(),
        name,
        email,
        password: password || 'Student@123',
        role: 'student',
        admissionNumber: admissionNumber || `ADM/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
        schoolId: currentUser.schoolId,
        studentClass,
        department,
        verified: true,
        joinedAt: new Date().toISOString(),
        status: 'active',
      };
      this.store.addUser(newStudent);
      this.showToast(`Student ${name} enrolled into ${studentClass} ${department ? `(${department})` : ''}!`, 'success');
    }

    this.closeModal();
    this.render();
  }

  // --- Results & Terminal Scoring Handlers ---
  public handleLiveScoreBreakdownChange(idx: number): void {
    const ca1Input = document.getElementById(`ca1_${idx}`) as HTMLInputElement;
    const ca2Input = document.getElementById(`ca2_${idx}`) as HTMLInputElement;
    const examInput = document.getElementById(`exam_${idx}`) as HTMLInputElement;
    const caTotEl = document.getElementById(`catot_${idx}`);
    const totEl = document.getElementById(`tot_${idx}`);
    const grdEl = document.getElementById(`grd_${idx}`);
    const remEl = document.getElementById(`rem_${idx}`);

    let ca1 = parseInt(ca1Input?.value || '0', 10);
    let ca2 = parseInt(ca2Input?.value || '0', 10);
    let exam = parseInt(examInput?.value || '0', 10);

    if (isNaN(ca1) || ca1 < 0) ca1 = 0;
    if (ca1 > 20) { ca1 = 20; if (ca1Input) ca1Input.value = '20'; }

    if (isNaN(ca2) || ca2 < 0) ca2 = 0;
    if (ca2 > 20) { ca2 = 20; if (ca2Input) ca2Input.value = '20'; }

    if (isNaN(exam) || exam < 0) exam = 0;
    if (exam > 60) { exam = 60; if (examInput) examInput.value = '60'; }

    const caTotal = ca1 + ca2;
    const total = caTotal + exam;
    const { grade, remark } = calculateGrade(total);

    if (caTotEl) caTotEl.textContent = caTotal.toString();
    if (totEl) totEl.textContent = total.toString();
    if (grdEl) {
      grdEl.textContent = grade;
      grdEl.className = `badge ${grade === 'A1' || grade === 'B2' ? 'badge-academic' : grade === 'F9' ? 'badge-urgent' : 'badge-sports'}`;
    }
    if (remEl) remEl.textContent = remark;
  }

  public handleSaveSubjectScoresBreakdown(
    event: Event,
    studentClass: string,
    subject: string,
    term: string,
    session: string
  ): void {
    event.preventDefault();
    const currentUser = this.store.getCurrentUser();
    if (!currentUser) return;

    if (!this.store.canUserRecordScores(currentUser, subject, studentClass)) {
      this.showToast(`Permission Denied: You are not authorized to record marks for "${subject}" in class ${studentClass}.`, 'error');
      return;
    }

    const classStudents = this.store.getUsers().filter(
      (u) => u.schoolId === currentUser.schoolId && u.role === 'student' && u.studentClass === studentClass
    );

    const entries: SubjectScoreEntry[] = [];

    classStudents.forEach((student, idx) => {
      const ca1Input = document.getElementById(`ca1_${idx}`) as HTMLInputElement;
      const ca2Input = document.getElementById(`ca2_${idx}`) as HTMLInputElement;
      const examInput = document.getElementById(`exam_${idx}`) as HTMLInputElement;
      const commentInput = document.getElementById(`comment_${idx}`) as HTMLInputElement;

      const ca1Score = parseInt(ca1Input?.value || '0', 10);
      const ca2Score = parseInt(ca2Input?.value || '0', 10);
      const examScore = parseInt(examInput?.value || '0', 10);
      const caScore = ca1Score + ca2Score;
      const totalScore = caScore + examScore;
      const { grade, remark } = calculateGrade(totalScore);

      entries.push({
        id: `sc_${student.id}_${subject}_${term}_${session}`,
        schoolId: currentUser.schoolId,
        studentId: student.id,
        studentName: student.name,
        studentClass: studentClass as StudentClass,
        recordedByTeacherId: currentUser.id,
        recordedByTeacherName: currentUser.name,
        subject,
        term: term as any,
        session,
        ca1Score,
        ca2Score,
        caScore,
        examScore,
        score: totalScore,
        grade,
        remark: commentInput?.value.trim() || remark,
        updatedAt: new Date().toISOString(),
      });
    });

    this.store.saveSubjectScoresBatch(entries);
    this.showToast(`Saved scores for ${entries.length} student(s) in ${subject} (${studentClass}) with CA1, CA2 & Exam breakdown!`, 'success');
  }

  public handleCompileTerminalResults(resultClass: string, resultTerm: string, resultSession: string): void {
    const currentUser = this.store.getCurrentUser();
    if (!currentUser) return;

    if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin' && !(currentUser.role === 'teacher' && currentUser.teacherType === 'class_teacher')) {
      this.showToast('Permission Denied: Only Administrators and Class Teachers can compile terminal results.', 'error');
      return;
    }

    const compiledReports = this.store.compileClassTerminalResults(
      currentUser.schoolId,
      resultClass,
      resultTerm,
      resultSession,
      currentUser.id
    );

    if (compiledReports.length === 0) {
      this.showToast(`No students enrolled in class ${resultClass} to compile.`, 'error');
      return;
    }

    this.showToast(`Successfully compiled ${compiledReports.length} terminal report card(s) on 9-point WAEC scale!`, 'success');
    this.render();
  }

  public handleApproveAllReports(resultClass: string, resultTerm: string, resultSession: string): void {
    const currentUser = this.store.getCurrentUser();
    if (!currentUser) return;

    if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
      this.showToast('Permission Denied: Only School Administrators can approve terminal results.', 'error');
      return;
    }

    const reports = this.store.getReports(currentUser.schoolId).filter(
      (r) => r.studentClass === resultClass && r.term === resultTerm && r.session === resultSession
    );

    reports.forEach((r) => {
      if (r.status === 'draft' || !r.status) {
        this.store.approveReport(r.id, currentUser.id);
      }
    });

    this.showToast(`All ${reports.length} report cards for ${resultClass} approved!`, 'success');
    this.render();
  }

  public handlePublishAllReports(resultClass: string, resultTerm: string, resultSession: string): void {
    const currentUser = this.store.getCurrentUser();
    if (!currentUser) return;

    if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
      this.showToast('Permission Denied: Only School Administrators can publish terminal results to student portals.', 'error');
      return;
    }

    const count = this.store.publishClassReports(
      currentUser.schoolId,
      resultClass,
      resultTerm,
      resultSession,
      currentUser.id
    );

    this.showToast(`🚀 Official Terminal Results Issued: ${count} report cards now published to Student Portals!`, 'success');
    this.render();
  }

  public handlePublishReport(reportId: string): void {
    const currentUser = this.store.getCurrentUser();
    if (!currentUser) return;

    if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
      this.showToast('Permission Denied: Only School Administrators can publish terminal results.', 'error');
      return;
    }

    this.store.publishReport(reportId, currentUser.id);
    this.showToast('Terminal report card published to student portal!', 'success');
    this.render();
  }

  public handleUnpublishReport(reportId: string): void {
    const currentUser = this.store.getCurrentUser();
    if (!currentUser) return;

    if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
      this.showToast('Permission Denied: Only School Administrators can revert published results to draft.', 'error');
      return;
    }

    this.store.updateReport(reportId, { status: 'draft' });
    this.showToast('Report card reverted to draft.', 'info');
    this.render();
  }

  public viewSubjectScoresLedgerModal(resultClass: string, resultTerm: string, resultSession: string): void {
    const currentUser = this.store.getCurrentUser();
    if (!currentUser) return;
    this.showModal(buildSubjectScoresLedgerModalHtml(currentUser.schoolId, resultClass, resultTerm, resultSession));
  }

  public openCustomReportGeneratorModal(defaultClass = 'SS2'): void {
    const currentUser = this.store.getCurrentUser();
    if (!currentUser) return;
    this.showModal(buildCustomReportGeneratorModalHtml(currentUser.schoolId, defaultClass));
  }

  public viewReportCardModal(reportId: string): void {
    const report = this.store.getReportById(reportId);
    if (!report) {
      this.showToast('Error: Report card not found.', 'error');
      return;
    }
    const currentUser = this.store.getCurrentUser();
    const school = this.store.getSchoolById(report.schoolId) || ({ name: 'Institution', code: report.schoolId, state: 'Lagos', type: 'Private' } as School);

    // Permission and security checks for students
    if (currentUser && currentUser.role === 'student') {
      if (report.studentId !== currentUser.id) {
        this.showToast('Permission Denied: You cannot view another student’s report card.', 'error');
        return;
      }
      if (report.status !== 'published') {
        this.showToast('🔒 Result In Verification: This report card has not been officially published by the School Admin.', 'error');
        return;
      }
      // Fee clearance enforcement check for students
      if (school.enforceFeeClearanceForResults) {
        const isFeeCleared = this.store.isStudentFeeCleared(school.id, currentUser.id, report.term, report.session);
        if (!isFeeCleared) {
          this.showToast('🔒 Report Card Locked: Outstanding school fees must be cleared with bursary first.', 'error');
          this.setStudentTab('fees');
          return;
        }
      }
    }

    this.showModal(buildReportCardModalHtml(report, school));
  }

  public deleteReport(reportId: string): void {
    this.store.deleteReport(reportId);
    this.showToast('Report card removed.', 'info');
    this.render();
  }

  public showShareCodeModal(code: string, name: string): void {
    this.showModal(buildShareCodeModalHtml(code, name));
  }

  public viewUserProfile(userId: string): void {
    const user = this.store.getUserById(userId);
    if (!user) return;
    this.showModal(buildUserDetailsModalHtml(user));
  }

  public removeUserFromSchool(userId: string): void {
    this.confirmDeleteUser(userId);
  }

  public handlePostAnnouncement(event: Event, role: 'admin' | 'teacher'): void {
    event.preventDefault();
    const currentUser = this.store.getCurrentUser();
    if (!currentUser) return;

    const titlePrefix = role === 'admin' ? 'ann' : 'teach-ann';
    const title = (document.getElementById(`${titlePrefix}-title`) as HTMLInputElement)?.value?.trim() || '';
    const category = ((document.getElementById(`${titlePrefix}-cat`) as HTMLSelectElement)?.value || 'General') as any;
    const body = (document.getElementById(`${titlePrefix}-body`) as HTMLTextAreaElement)?.value?.trim() || '';
    const isPinned = !!(document.getElementById(`${titlePrefix}-pin`) as HTMLInputElement)?.checked;

    if (!title || !body) {
      this.showToast('Please provide an announcement title and message.', 'error');
      return;
    }

    this.store.addAnnouncement({
      id: 'ann_' + Date.now(),
      schoolId: currentUser.schoolId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: role,
      title,
      category,
      body,
      isPinned,
      createdAt: new Date().toISOString(),
    });

    this.showToast('Announcement posted to school board!', 'success');
    this.render();
  }

  public deleteAnnouncement(annId: string): void {
    this.store.deleteAnnouncement(annId);
    this.showToast('Announcement removed.', 'info');
    this.render();
  }

  public handleUpdateSchoolProfile(event: Event): void {
    event.preventDefault();
    const currentUser = this.store.getCurrentUser();
    if (!currentUser) return;

    const name = (document.getElementById('edit-sch-name') as HTMLInputElement)?.value?.trim() || '';
    const type = ((document.getElementById('edit-sch-type') as HTMLSelectElement)?.value || 'Private') as any;
    const level = ((document.getElementById('edit-sch-level') as HTMLSelectElement)?.value || 'JSS & SSS') as any;
    const state = (document.getElementById('edit-sch-state') as HTMLSelectElement)?.value || 'Lagos';
    const email = (document.getElementById('edit-sch-email') as HTMLInputElement)?.value?.trim() || '';

    if (!name || !email) {
      this.showToast('Please provide institution name and email.', 'error');
      return;
    }

    this.store.updateSchool(currentUser.schoolId, { name, type, level, state, email });
    this.showToast('School profile information updated.', 'success');
    this.render();
  }

  public confirmClearStudentData(schoolId: string): void {
    this.confirmActionCallback = () => {
      this.store.clearSchoolStudentData(schoolId);
      this.showToast('All student records cleared.', 'info');
      this.closeModal();
      this.render();
    };
    this.showModal(buildConfirmModalHtml('Clear Student Data', 'This will delete all students, submissions, reports, and attendance records for this school. Are you sure?', 'executeConfirmedAction'));
  }

  // --- Teacher Actions ---
  public setTeacherTab(tab: string): void {
    this.teacherTab = tab;
    this.render();
  }

  public setTeacherClass(cls: string): void {
    this.teacherClass = cls;
    this.render();
  }

  public setTeacherAttendanceClass(cls: string): void {
    this.teacherClass = cls;
    this.render();
  }

  public setTeacherAttendanceDate(dateStr: string): void {
    this.teacherAttendanceDate = dateStr;
    this.render();
  }

  public setTeacherTimetableClass(cls: string): void {
    this.teacherClass = cls;
    this.render();
  }

  public setTeacherScoreFilters(cls?: string, sub?: string, term?: string, session?: string): void {
    if (cls !== undefined) this.teacherClass = cls;
    if (sub !== undefined) this.teacherScoreSubject = sub;
    if (term !== undefined) this.teacherScoreTerm = term;
    if (session !== undefined) this.teacherScoreSession = session;
    this.render();
  }

  public handleReportStudentChange(studentId: string): void {
    const student = this.store.getUserById(studentId);
    if (!student) return;
    this.teacherClass = student.studentClass || 'SS2';
  }

  public calculateReportRowScore(idx: number): void {
    const input = document.getElementById(`score_${idx}`) as HTMLInputElement | null;
    if (!input) return;
    const score = parseInt(input.value || '0', 10);
    const { grade, remark } = calculateGrade(score);

    const gradeEl = document.getElementById(`grade_${idx}`);
    const remarkEl = document.getElementById(`remark_${idx}`);

    if (gradeEl) {
      gradeEl.textContent = grade;
      gradeEl.className = `badge ${grade === 'A1' || grade === 'B2' ? 'badge-academic' : grade === 'F9' ? 'badge-urgent' : 'badge-sports'}`;
    }
    if (remarkEl) {
      remarkEl.textContent = remark;
    }

    // Recompute totals
    let sum = 0;
    for (let i = 0; i < SUBJECT_LIST.length; i++) {
      const rowVal = parseInt((document.getElementById(`score_${i}`) as HTMLInputElement)?.value || '0', 10);
      sum += isNaN(rowVal) ? 0 : rowVal;
    }

    const avg = sum / (SUBJECT_LIST.length || 1);
    const { grade: overallG, remark: overallR } = calculateGrade(avg);

    const totalEl = document.getElementById('rep-live-total');
    const avgEl = document.getElementById('rep-live-avg');
    const overallGEl = document.getElementById('rep-live-grade');

    if (totalEl) totalEl.textContent = `${sum} / ${SUBJECT_LIST.length * 100}`;
    if (avgEl) avgEl.textContent = `${avg.toFixed(1)}%`;
    if (overallGEl) overallGEl.textContent = `${overallG} (${overallR})`;
  }

  public handleGenerateReport(event: Event): void {
    event.preventDefault();
    const currentUser = this.store.getCurrentUser();
    if (!currentUser) return;

    const studentSelect = document.getElementById('rep-student') as HTMLSelectElement | null;
    const studentId = studentSelect?.value;
    const student = studentId ? this.store.getUserById(studentId) : null;
    if (!student) {
      this.showToast('Please select a student.', 'error');
      return;
    }

    const term = ((document.getElementById('rep-term') as HTMLSelectElement)?.value || '1st Term') as any;
    const session = (document.getElementById('rep-session') as HTMLInputElement)?.value?.trim() || '2024/2025';
    const position = parseInt((document.getElementById('rep-position') as HTMLInputElement)?.value || '1', 10);
    const teacherComment = (document.getElementById('rep-teacher-comment') as HTMLTextAreaElement)?.value?.trim() || 'Satisfactory academic progress.';
    const principalRemark = (document.getElementById('rep-principal-comment') as HTMLTextAreaElement)?.value?.trim() || 'Approved.';

    const subjects: SubjectScore[] = [];
    let totalScore = 0;

    for (let i = 0; i < SUBJECT_LIST.length; i++) {
      const subName = SUBJECT_LIST[i];
      const scoreInput = document.getElementById(`score_${i}`) as HTMLInputElement | null;
      const score = parseInt(scoreInput?.value || '70', 10);
      const { grade, remark } = calculateGrade(score);
      const ca1 = Math.round(score * 0.15);
      const ca2 = Math.round(score * 0.15);
      const caTotal = ca1 + ca2;
      const exam = score - caTotal;

      subjects.push({
        subject: subName,
        score,
        ca1Score: ca1,
        ca2Score: ca2,
        caScore: caTotal,
        examScore: exam,
        grade,
        remark,
      });
      totalScore += score;
    }

    const averageScore = totalScore / subjects.length;
    const { grade: overallGrade, remark: overallRemark } = calculateGrade(averageScore);

    const newReport: ReportCard = {
      id: 'rep_' + Date.now(),
      schoolId: currentUser.schoolId,
      studentId: student.id,
      studentName: student.name,
      studentClass: student.studentClass || 'SS2',
      department: student.department,
      admissionNumber: student.admissionNumber,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      term,
      session,
      position,
      subjects,
      totalScore,
      averageScore,
      overallGrade,
      overallRemark,
      attendancePresent: 55,
      attendanceAbsent: 3,
      attendanceLate: 2,
      teacherComment,
      principalRemark,
      status: currentUser.role === 'admin' ? 'published' : 'draft',
      createdAt: new Date().toISOString(),
    };

    this.store.addReport(newReport);
    this.showToast(`Report card generated for ${student.name}!`, 'success');
    this.viewReportCardModal(newReport.id);
  }

  public handleCreateAssignment(event: Event): void {
    event.preventDefault();
    const currentUser = this.store.getCurrentUser();
    if (!currentUser) return;

    const title = (document.getElementById('asg-title') as HTMLInputElement)?.value?.trim() || '';
    const subject = (document.getElementById('asg-subject') as HTMLSelectElement)?.value || 'Mathematics';
    const studentClass = ((document.getElementById('asg-class') as HTMLSelectElement)?.value || 'SS2') as StudentClass;
    const dueDate = (document.getElementById('asg-due') as HTMLInputElement)?.value || '';
    const instructions = (document.getElementById('asg-instructions') as HTMLTextAreaElement)?.value?.trim() || '';
    const maxScore = parseInt((document.getElementById('asg-max') as HTMLInputElement)?.value || '20', 10);

    if (!title || !instructions) {
      this.showToast('Please provide an assignment title and instructions.', 'error');
      return;
    }

    const newAsg: Assignment = {
      id: 'asg_' + Date.now(),
      schoolId: currentUser.schoolId,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      subject,
      studentClass,
      title,
      instructions,
      dueDate,
      maxScore,
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    this.store.addAssignment(newAsg);
    this.showToast('Assignment published to class!', 'success');
    this.render();
  }

  public viewSubmissionsModal(assignmentId: string): void {
    const asg = this.store.getAssignmentById(assignmentId);
    if (!asg) return;
    const submissions = this.store.getSubmissions(assignmentId);
    this.showModal(buildSubmissionsModalHtml(asg, submissions));
  }

  public handleGradeSubmission(event: Event, submissionId: string, maxScore: number): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const score = parseInt((form.elements.namedItem('grade_score') as HTMLInputElement).value, 10);
    const feedback = (form.elements.namedItem('grade_feedback') as HTMLInputElement).value.trim();

    if (isNaN(score) || score < 0 || score > maxScore) {
      this.showToast(`Score must be between 0 and ${maxScore}.`, 'error');
      return;
    }

    this.store.updateSubmission(submissionId, { score, feedback });
    this.showToast('Grade recorded for student submission.', 'success');
    this.closeModal();
    this.render();
  }

  public handleSaveAttendance(event: Event, studentClass: string, dateStr: string): void {
    event.preventDefault();
    const currentUser = this.store.getCurrentUser();
    if (!currentUser) return;

    const classStudents = this.store.getUsers().filter((u) => u.schoolId === currentUser.schoolId && u.role === 'student' && u.studentClass === studentClass);
    const records: AttendanceRecord[] = [];

    classStudents.forEach((s) => {
      const radio = document.querySelector<HTMLInputElement>(`input[name="att_${s.id}"]:checked`);
      const status = (radio ? radio.value : 'present') as 'present' | 'absent' | 'late';
      records.push({
        id: `att_${s.id}_${dateStr}`,
        schoolId: currentUser.schoolId,
        studentId: s.id,
        studentName: s.name,
        studentClass: s.studentClass || 'SS2',
        date: dateStr,
        status,
        markedBy: currentUser.id,
      });
    });

    this.store.saveAttendanceBatch(records);
    this.showToast(`Attendance saved for ${dateStr}!`, 'success');
  }

  public openEditTimetableModal(schoolId: string, studentClass: string, day: string, period: number, subject: string, room: string): void {
    this.showModal(buildEditTimetableModalHtml(schoolId, studentClass, day, period, subject, room));
  }

  public handleSaveTimetableSlot(event: Event, schoolId: string, studentClass: StudentClass, day: any, period: number): void {
    event.preventDefault();
    const subject = (document.getElementById('slot-subject') as HTMLSelectElement)?.value || 'Mathematics';
    const room = (document.getElementById('slot-room') as HTMLInputElement)?.value?.trim() || 'Room 101';
    const currentUser = this.store.getCurrentUser();

    const slot: TimetableSlot = {
      id: `tt_${studentClass}_${day}_${period}`,
      schoolId,
      studentClass,
      day,
      period,
      time: '',
      subject,
      room,
      teacherName: currentUser ? currentUser.name : 'Staff Instructor',
    };

    this.store.setTimetableSlot(slot);
    this.showToast('Timetable slot updated.', 'success');
    this.closeModal();
    this.render();
  }

  public handleClearTimetableSlot(schoolId: string, studentClass: string, day: string, period: number): void {
    this.store.clearTimetableSlot(schoolId, studentClass, day, period);
    this.showToast('Timetable slot cleared.', 'info');
    this.closeModal();
    this.render();
  }

  // --- Student Actions ---
  public setStudentTab(tab: string): void {
    this.studentTab = tab;
    this.render();
  }

  public setStudentNewsFilter(cat: string): void {
    this.studentNewsFilter = cat;
    this.render();
  }

  public setStudentAssignmentFilter(st: string): void {
    this.studentAssignmentFilter = st;
    this.render();
  }

  public openSubmitAssignmentModal(assignmentId: string, title: string): void {
    this.showModal(buildSubmitAssignmentModalHtml(assignmentId, title));
  }

  public handleSubmitAssignment(event: Event, assignmentId: string): void {
    event.preventDefault();
    const currentUser = this.store.getCurrentUser();
    if (!currentUser) return;

    const content = (document.getElementById('sub-answer') as HTMLTextAreaElement)?.value?.trim() || '';
    if (!content) {
      this.showToast('Please enter your answer text.', 'error');
      return;
    }

    this.store.addSubmission({
      id: 'sub_' + Date.now(),
      assignmentId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      content,
      submittedAt: new Date().toISOString(),
    });

    this.showToast('Work submitted to instructor successfully!', 'success');
    this.closeModal();
    this.render();
  }

  public printReport(): void {
    window.print();
  }

  public quickLogin(email: string, password: string): void {
    const user = this.store.getUserByEmail(email);
    if (user && user.password === password) {
      this.store.setCurrentUser(user);
      this.showToast(`Logged in as ${user.name} (${user.role.toUpperCase()})`, 'success');
      window.location.hash = '#dashboard';
      this.render();
    } else {
      this.showToast('Login failed.', 'error');
    }
  }

  public resetPlatformData(): void {
    this.confirmActionCallback = () => {
      this.store.clearAllData();
      this.showToast('All platform data has been cleared.', 'success');
      this.closeModal();
      this.render();
    };
    this.showModal(
      buildConfirmModalHtml(
        'Clear All Platform Data',
        'This will erase all registered schools, users, grades, announcements, and submissions permanently. Continue?',
        'executeConfirmedAction'
      )
    );
  }

  // --- Modal & Toast System ---
  public showModal(html: string): void {
    const backdrop = document.getElementById('modal-container');
    const target = document.getElementById('modal-content-target');
    if (!backdrop || !target) return;

    target.innerHTML = html;
    backdrop.classList.add('show');
  }

  public closeModal(): void {
    const backdrop = document.getElementById('modal-container');
    if (backdrop) backdrop.classList.remove('show');
  }

  public handleModalBackdropClick(event: MouseEvent): void {
    if (event.target && (event.target as HTMLElement).id === 'modal-container') {
      this.closeModal();
    }
  }

  public executeConfirmedAction(): void {
    if (this.confirmActionCallback) {
      this.confirmActionCallback();
      this.confirmActionCallback = null;
    }
  }

  public showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    toast.innerHTML = `<span style="font-size: 16px;">${icon}</span> <span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('toast-show'), 10);

    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  public copyToClipboard(text: string, successMsg = 'Copied to clipboard!'): void {
    navigator.clipboard.writeText(text).then(() => {
      this.showToast(successMsg, 'success');
    }).catch(() => {
      this.showToast('Unable to auto-copy. Please select and copy manually.', 'info');
    });
  }
}

// Attach to window
declare global {
  interface Window {
    SchoolHubApp: SchoolHubApp;
  }
}
