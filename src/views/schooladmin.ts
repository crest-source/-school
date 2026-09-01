import { Store, formatNaira } from '../store';
import { User, School, StudentClass, Department, RegistrySubject, FeePayment, FeeSchedule } from '../types';
import { NIGERIAN_STATES, ALL_CLASSES, JUNIOR_CLASSES, SENIOR_CLASSES, DEPARTMENTS } from '../seed';

export function renderSchoolAdminDashboard(
  user: User,
  activeTab = 'overview',
  classFilter = 'all',
  resultClass = 'SS2',
  resultTerm = '1st Term',
  resultSession = '2024/2025',
  feeClassFilter = 'all',
  feeStatusFilter = 'all',
  feeSearchQuery = ''
): string {
  const store = Store.getInstance();
  const school = store.getSchoolById(user.schoolId) || ({
    id: user.schoolId,
    code: user.schoolId,
    name: 'My Institution',
    type: 'Private',
    level: 'JSS & SSS',
    state: 'Lagos',
    email: user.email,
    enforceFeeClearanceForResults: false,
    createdAt: new Date().toISOString(),
    status: 'active',
  } as School);

  const users = store.getUsers().filter((u) => u.schoolId === school.id);
  const teachers = users.filter((u) => u.role === 'teacher' && u.approvalStatus !== 'pending');
  const students = users.filter((u) => u.role === 'student' && u.approvalStatus !== 'pending');
  const pendingUsers = store.getPendingUsers(school.id);
  const pendingTeachers = pendingUsers.filter((u) => u.role === 'teacher');
  const pendingStudents = pendingUsers.filter((u) => u.role === 'student');
  const announcements = store.getAnnouncements(school.id);
  const reports = store.getReports(school.id);
  const registrySubjects = store.getRegistrySubjects(school.id);
  const feePayments = store.getFeePayments(school.id);
  const invites = store.getInvites(school.id);

  return `
    <div class="dashboard-container">
      <aside class="sidebar" style="background-color: var(--c-admin);">
        <div>
          <div class="sidebar-brand">
            <span class="sidebar-brand-icon">🏫</span>
            <div>
              <div class="sidebar-brand-text" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px;" title="${school.name}">
                ${school.name}
              </div>
              <span class="sidebar-badge" style="cursor: pointer;" onclick="window.SchoolHubApp.showShareCodeModal('${school.code}', '${school.name}')" title="Click to copy or share code">
                Code: ${school.code} 📋
              </span>
            </div>
          </div>

          ${user.role === 'superadmin' ? `
            <div style="background: rgba(124, 58, 237, 0.35); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: var(--radius-md); padding: 10px 12px; margin: 16px 8px 0; font-size: 12px;">
              <div style="font-weight: 700; color: #FFFFFF; display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <span>⚡</span> Super Admin Mode
              </div>
              <div style="font-size: 11px; opacity: 0.9; margin-bottom: 8px;">
                Managing <strong>${school.name}</strong>
              </div>
              <button class="btn btn-sm" onclick="window.SchoolHubApp.returnToSuperAdminDashboard()" style="width: 100%; background: #7C3AED; color: #FFFFFF; font-size: 11px; font-weight: 600; padding: 5px 8px;">
                ⚡ Return to Root Control
              </button>
            </div>
          ` : ''}

          <nav class="sidebar-nav">
            <a class="nav-item ${activeTab === 'overview' ? 'active' : ''}" onclick="window.SchoolHubApp.setSchoolAdminTab('overview')">
              <span>📊</span> Overview
            </a>
            <a class="nav-item ${activeTab === 'invites' ? 'active' : ''}" onclick="window.SchoolHubApp.setSchoolAdminTab('invites')">
              <span>🔗</span> Onboarding & Invites (${invites.length})
            </a>
            <a class="nav-item ${activeTab === 'registry' ? 'active' : ''}" onclick="window.SchoolHubApp.setSchoolAdminTab('registry')">
              <span>📚</span> Subject Registry (${registrySubjects.length})
            </a>
            <a class="nav-item ${activeTab === 'fees' ? 'active' : ''}" onclick="window.SchoolHubApp.setSchoolAdminTab('fees')">
              <span>💳</span> School Fees & Bursary
            </a>
            <a class="nav-item ${activeTab === 'teachers' ? 'active' : ''}" onclick="window.SchoolHubApp.setSchoolAdminTab('teachers')">
              <span>👨‍🏫</span> Faculty (${teachers.length}${pendingTeachers.length > 0 ? ` <span style="background: #FEF08A; color: #854D0E; font-size: 10px; font-weight: 700; padding: 1px 5px; border-radius: 10px;">${pendingTeachers.length} ⏳</span>` : ''})
            </a>
            <a class="nav-item ${activeTab === 'students' ? 'active' : ''}" onclick="window.SchoolHubApp.setSchoolAdminTab('students')">
              <span>🎓</span> Students (${students.length}${pendingStudents.length > 0 ? ` <span style="background: #FEF08A; color: #854D0E; font-size: 10px; font-weight: 700; padding: 1px 5px; border-radius: 10px;">${pendingStudents.length} ⏳</span>` : ''})
            </a>
            <a class="nav-item ${activeTab === 'reports' ? 'active' : ''}" onclick="window.SchoolHubApp.setSchoolAdminTab('reports')">
              <span>📑</span> Results & Reports (${reports.length})
            </a>
            <a class="nav-item ${activeTab === 'announcements' ? 'active' : ''}" onclick="window.SchoolHubApp.setSchoolAdminTab('announcements')">
              <span>📢</span> Announcements (${announcements.length})
            </a>
            <a class="nav-item ${activeTab === 'settings' ? 'active' : ''}" onclick="window.SchoolHubApp.setSchoolAdminTab('settings')">
              <span>⚙️</span> School Settings
            </a>
          </nav>
        </div>

        <div class="sidebar-footer">
          <div class="sidebar-user-pill">
            <div style="overflow: hidden;">
              <div style="font-weight: 600; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${user.name}</div>
              <div style="font-size: 11px; opacity: 0.85;">School Administrator</div>
              <div style="font-size: 10px; opacity: 0.75;">${school.name}</div>
            </div>
          </div>
          <button class="btn btn-sm" onclick="window.SchoolHubApp.logout()" style="width: 100%; background: rgba(0,0,0,0.25); color: #FFFFFF; border: 1px solid rgba(255,255,255,0.2); margin-top: 8px;">
            Sign Out
          </button>
        </div>
      </aside>

      <main class="main-content">
        ${renderSchoolAdminTabContent(
          user,
          school,
          activeTab,
          classFilter,
          teachers,
          students,
          announcements,
          reports,
          registrySubjects,
          feePayments,
          resultClass,
          resultTerm,
          resultSession,
          feeClassFilter,
          feeStatusFilter,
          feeSearchQuery
        )}
      </main>
    </div>
  `;
}

function renderSchoolAdminTabContent(
  user: User,
  school: School,
  activeTab: string,
  classFilter: string,
  teachers: User[],
  students: User[],
  announcements: any[],
  reports: any[],
  registrySubjects: RegistrySubject[],
  feePayments: FeePayment[],
  resultClass: string,
  resultTerm: string,
  resultSession: string,
  feeClassFilter: string,
  feeStatusFilter: string,
  feeSearchQuery: string
): string {
  const store = Store.getInstance();

  // -------------------------------------------------------------
  // TAB 1: OVERVIEW
  // -------------------------------------------------------------
  if (activeTab === 'overview') {
    const publishedReportsCount = reports.filter((r) => r.status === 'published').length;
    const pendingApprovalCount = reports.filter((r) => r.status === 'draft' || !r.status).length;
    const totalPaymentsSum = feePayments.reduce((acc, p) => acc + p.amountPaid, 0);
    const pendingUsers = store.getPendingUsers(school.id);

    return `
      <div class="fade-in">
        <div class="content-header">
          <div>
            <h1 class="text-heading" style="font-size: 24px;">School Administration Dashboard</h1>
            <p class="text-body" style="color: var(--c-text-2);">${school.name} &bull; ${school.state} State &bull; Code: <strong>${school.code}</strong></p>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-primary" onclick="window.SchoolHubApp.openSchoolInvitesModal()" style="background: #4F46E5;">
              🔗 Invite Links
            </button>
            ${pendingUsers.length > 0 ? `
              <button class="btn btn-primary" onclick="window.SchoolHubApp.openPendingApprovalsModal()" style="background: #D97706;">
                ⏳ Approvals (${pendingUsers.length})
              </button>
            ` : ''}
            <button class="btn btn-primary" onclick="window.SchoolHubApp.openAdminRegisterTeacherModal()" style="background: #0369A1;">
              + Register Teacher
            </button>
            <button class="btn btn-primary" onclick="window.SchoolHubApp.openEnrolStudentModal()" style="background: #0D9488;">
              + Enrol Student
            </button>
            <button class="btn btn-primary" onclick="window.SchoolHubApp.openRecordFeePaymentModal()" style="background: #059669;">
              💳 Record Fee Payment
            </button>
            <button class="btn btn-ghost" onclick="window.SchoolHubApp.showShareCodeModal('${school.code}', '${school.name}')">
              <span>📋</span> Code Card
            </button>
            <button class="btn btn-ghost" onclick="window.SchoolHubApp.openEmailTesterModal()" style="border: 1px solid var(--c-border); background: #FFFFFF;" title="Test live email sending">
              <span>✉️</span> Test Email Service
            </button>
          </div>
        </div>

        ${pendingUsers.length > 0 ? `
          <div style="background: #FEF3C7; border: 1px solid #FCD34D; border-radius: var(--radius-md); padding: 16px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div>
              <div style="font-weight: 700; color: #92400E; font-size: 15px; display: flex; align-items: center; gap: 8px;">
                <span>⏳</span> ${pendingUsers.length} Registration(s) Awaiting Admin Approval
              </div>
              <div style="font-size: 13px; color: #78350F; margin-top: 2px;">
                Teachers or students who joined via your school's invite links require confirmation before accessing school records.
              </div>
            </div>
            <button class="btn btn-primary btn-sm" style="background: #D97706;" onclick="window.SchoolHubApp.openPendingApprovalsModal()">
              Review & Approve Now →
            </button>
          </div>
        ` : ''}

        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-label">TOTAL TEACHERS</div>
            <div class="stat-value" data-count="${teachers.length}">${teachers.length}</div>
            <div class="stat-sub">Class & Subject faculty</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">TOTAL STUDENTS</div>
            <div class="stat-value" data-count="${students.length}">${students.length}</div>
            <div class="stat-sub">Enrolled learners</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">SUBJECT REGISTRY</div>
            <div class="stat-value" data-count="${registrySubjects.length}">${registrySubjects.length}</div>
            <div class="stat-sub">Active curriculum subjects</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">FEES COLLECTED</div>
            <div class="stat-value" style="font-size: 22px; color: #059669;">${formatNaira(totalPaymentsSum)}</div>
            <div class="stat-sub">${feePayments.length} transactions recorded</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; margin-top: 16px;">
          <div class="card">
            <h2 class="text-subheading" style="margin-bottom: 16px;">Administrative Control Center</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <button class="btn btn-ghost" onclick="window.SchoolHubApp.setSchoolAdminTab('invites')" style="justify-content: flex-start; padding: 14px;">
                <span style="font-size: 20px;">🔗</span>
                <div style="text-align: left;">
                  <div style="font-weight: 600;">Onboarding & Invites</div>
                  <div style="font-size: 11px; color: var(--c-text-2);">Generate teacher & student links</div>
                </div>
              </button>

              <button class="btn btn-ghost" onclick="window.SchoolHubApp.setSchoolAdminTab('registry')" style="justify-content: flex-start; padding: 14px;">
                <span style="font-size: 20px;">📚</span>
                <div style="text-align: left;">
                  <div style="font-weight: 600;">Manage Subject Registry</div>
                  <div style="font-size: 11px; color: var(--c-text-2);">Curriculum, levels & departments</div>
                </div>
              </button>

              <button class="btn btn-ghost" onclick="window.SchoolHubApp.setSchoolAdminTab('fees')" style="justify-content: flex-start; padding: 14px;">
                <span style="font-size: 20px;">💳</span>
                <div style="text-align: left;">
                  <div style="font-weight: 600;">School Fees & Receipts</div>
                  <div style="font-size: 11px; color: var(--c-text-2);">Tuition schedules & clearance</div>
                </div>
              </button>

              <button class="btn btn-ghost" onclick="window.SchoolHubApp.setSchoolAdminTab('reports')" style="justify-content: flex-start; padding: 14px;">
                <span style="font-size: 20px;">📊</span>
                <div style="text-align: left;">
                  <div style="font-weight: 600;">Compile & Issue Results</div>
                  <div style="font-size: 11px; color: var(--c-text-2);">Aggregate teacher marks & publish</div>
                </div>
              </button>
            </div>

            <!-- Fee Clearance Enforcement Notice -->
            <div style="background: ${school.enforceFeeClearanceForResults ? '#EFF6FF' : '#F8FAFC'}; border: 1px solid ${school.enforceFeeClearanceForResults ? '#3B82F6' : '#CBD5E1'}; border-radius: var(--radius-md); padding: 14px; margin-top: 18px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: #0F172A; font-size: 13px;">Fee Clearance Enforcement for Results:</strong>
                <p style="font-size: 12px; color: var(--c-text-2); margin: 2px 0 0 0;">
                  ${school.enforceFeeClearanceForResults
                    ? '🔒 ACTIVE — Terminal result cards are hidden from students until school fees are fully paid.'
                    : '🔓 INACTIVE — All students can view published results regardless of fee clearance status.'}
                </p>
              </div>
              <button class="btn btn-sm ${school.enforceFeeClearanceForResults ? 'btn-primary' : 'btn-ghost'}" onclick="window.SchoolHubApp.toggleFeeEnforcementSetting(!${!!school.enforceFeeClearanceForResults})">
                ${school.enforceFeeClearanceForResults ? 'Disable Enforcement' : 'Enable Enforcement'}
              </button>
            </div>
          </div>

          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <h2 class="text-subheading">Latest Fee Payments</h2>
              <button class="btn btn-ghost btn-sm" onclick="window.SchoolHubApp.setSchoolAdminTab('fees')">View All</button>
            </div>

            ${feePayments.length === 0 ? `
              <div class="empty-state" style="padding: 24px 0;">
                <div class="empty-icon">💳</div>
                <p class="text-body" style="font-size: 13px; color: var(--c-text-2);">No fee payments recorded yet.</p>
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${feePayments.slice(-4).reverse().map((pay) => `
                  <div style="padding: 10px 12px; background: var(--c-surface2); border: 1px solid var(--c-border); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <div style="font-weight: 600; font-size: 13px;">${pay.studentName}</div>
                      <div style="font-size: 11px; color: var(--c-text-3);">${pay.studentClass} &bull; ${pay.paymentMethod}</div>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-weight: 700; color: #059669; font-size: 13px;">${formatNaira(pay.amountPaid)}</div>
                      <button class="btn btn-ghost btn-sm" style="font-size: 10px; padding: 2px 6px;" onclick="window.SchoolHubApp.viewFeeReceiptModal('${pay.id}')">Receipt 🖨</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------
  // TAB: ONBOARDING & INVITES
  // -------------------------------------------------------------
  if (activeTab === 'invites') {
    const publicRegUrl = `${window.location.origin}${window.location.pathname}#register-school`;
    const invites = store.getInvites(school.id);
    const pendingUsers = store.getPendingUsers(school.id);

    return `
      <div class="fade-in">
        <div class="content-header">
          <div>
            <h1 class="text-heading" style="font-size: 24px;">Onboarding & Invite Management</h1>
            <p class="text-body" style="color: var(--c-text-2);">
              Generate and manage secure onboarding links for teachers and students at ${school.name}.
            </p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-primary" onclick="window.SchoolHubApp.openSchoolInvitesModal()" style="background: #0369A1;">
              + Generate Invite
            </button>
          </div>
        </div>

        <!-- PART 1: Public "Register Your School" Link Banner -->
        <div class="card" style="background: #F0FDF4; border: 1px solid #BBF7D0; margin-bottom: 20px; padding: 18px 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
            <div>
              <div style="font-size: 11px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.8px;">
                PART 1 &bull; Public Link (Any New School)
              </div>
              <h2 style="font-size: 16px; font-weight: 700; color: #14532D; margin: 4px 0 2px 0;">
                Public "Register Your School" Link
              </h2>
              <div style="font-size: 13px; color: #166534;">
                Share this link with other schools or prospective administrators to register a new school instance.
              </div>
              <div style="margin-top: 6px;">
                <code style="background: #DCFCE7; padding: 4px 10px; border-radius: 4px; color: #15803D; font-size: 13px; word-break: break-all;">${publicRegUrl}</code>
              </div>
            </div>
            <button class="btn btn-primary" style="background: #16A34A;" onclick="window.SchoolHubApp.copyToClipboard('${publicRegUrl}', 'Public School Registration Link copied to clipboard!')">
              📋 Copy Public Link
            </button>
          </div>
        </div>

        <!-- Pending Approvals Section if any -->
        ${pendingUsers.length > 0 ? `
          <div class="card" style="border: 1px solid #FCD34D; background: #FFFBEB; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <h2 class="text-subheading" style="color: #92400E; margin: 0; font-size: 16px;">
                ⏳ Pending Account Approvals (${pendingUsers.length})
              </h2>
              <span style="font-size: 12px; color: #B45309;">Review and grant access to applicants</span>
            </div>

            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Applicant Name</th>
                    <th>Role</th>
                    <th>Email / Phone</th>
                    <th>Assigned Specialty / Class</th>
                    <th>Registered Date</th>
                    <th style="text-align: right;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${pendingUsers.map((u) => `
                    <tr>
                      <td style="font-weight: 600; color: #0F172A;">${u.name}</td>
                      <td>
                        <span class="badge ${u.role === 'teacher' ? 'badge-academic' : 'badge-event'}">
                          ${u.role === 'teacher' ? 'Faculty Teacher' : 'Student'}
                        </span>
                      </td>
                      <td style="font-size: 12px;">
                        <div>${u.email}</div>
                        <div style="color: var(--c-text-3);">${u.phone || 'No phone'}</div>
                      </td>
                      <td style="font-size: 12px;">
                        ${u.role === 'teacher'
                          ? `<div>${u.specialty || 'General'}</div><div style="font-size: 11px; color: var(--c-text-3);">${(u.assignedSubjects || []).join(', ') || 'None'}</div>`
                          : `<div>Class: <strong>${u.studentClass || '—'}</strong> ${u.department ? `(${u.department})` : ''}</div>`
                        }
                      </td>
                      <td style="font-size: 11px; color: var(--c-text-3);">${new Date(u.joinedAt).toLocaleDateString()}</td>
                      <td style="text-align: right;">
                        <div style="display: flex; gap: 6px; justify-content: flex-end;">
                          <button class="btn btn-primary btn-sm" style="background: #059669; font-size: 11px; padding: 4px 10px;" onclick="window.SchoolHubApp.handleApproveUser('${u.id}')">
                            ✓ Approve
                          </button>
                          <button class="btn btn-ghost btn-sm" style="color: #DC2626; font-size: 11px; padding: 4px 8px;" onclick="window.SchoolHubApp.handleRejectUser('${u.id}')">
                            ✕ Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

        <!-- PART 2: Generated Invite Links Table -->
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
            <div>
              <h2 class="text-subheading" style="margin: 0;">Active & Past Invite Links (${invites.length})</h2>
              <p style="font-size: 12px; color: var(--c-text-2); margin-top: 2px;">
                Unique token links for ${school.name} &bull; Auto-associates signups with this school
              </p>
            </div>
            <button class="btn btn-primary btn-sm" onclick="window.SchoolHubApp.openSchoolInvitesModal()" style="background: #0369A1;">
              + Create New Invite Link
            </button>
          </div>

          ${invites.length === 0 ? `
            <div class="empty-state" style="padding: 32px 0;">
              <div style="font-size: 36px; margin-bottom: 8px;">✉️</div>
              <p class="text-body" style="color: var(--c-text-2);">No school invite links generated yet.</p>
              <button class="btn btn-primary btn-sm" style="margin-top: 10px; background: #0369A1;" onclick="window.SchoolHubApp.openSchoolInvitesModal()">
                Generate Your First Invite Link
              </button>
            </div>
          ` : `
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Role Target</th>
                    <th>Label & Token</th>
                    <th>Usage / Limit</th>
                    <th>Expires</th>
                    <th>Status</th>
                    <th style="text-align: right;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${invites.map((inv) => {
                    const inviteUrl = `${window.location.origin}${window.location.pathname}#join/${school.id}/${inv.token}`;
                    const isExpired = inv.status === 'expired' || (inv.expiresAt && new Date(inv.expiresAt).getTime() < Date.now()) || (inv.maxUses && inv.maxUses > 0 && inv.usedCount >= inv.maxUses);
                    const isRevoked = inv.status === 'revoked';
                    const isActive = !isRevoked && !isExpired;

                    const statusLabel = isRevoked ? 'Revoked' : isExpired ? 'Expired' : 'Active';
                    const statusBadgeClass = isRevoked ? 'badge-suspended' : isExpired ? 'badge-urgent' : 'badge-active';

                    return `
                      <tr>
                        <td>
                          <span class="badge ${inv.role === 'teacher' ? 'badge-academic' : 'badge-event'}" style="text-transform: capitalize;">
                            ${inv.role}
                          </span>
                        </td>
                        <td>
                          <div style="font-weight: 600; font-size: 13px;">${inv.label || `${inv.role === 'teacher' ? 'Faculty' : 'Student'} Invite`}</div>
                          <div style="font-family: monospace; font-size: 11px; color: var(--c-text-3);">${inv.token}</div>
                        </td>
                        <td style="font-size: 12px;">
                          <strong>${inv.usedCount || 0}</strong> / ${inv.maxUses && inv.maxUses > 0 ? inv.maxUses : '∞'} used
                        </td>
                        <td style="font-size: 12px; color: var(--c-text-2);">
                          ${inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never'}
                        </td>
                        <td>
                          <span class="badge ${statusBadgeClass}">${statusLabel}</span>
                        </td>
                        <td style="text-align: right;">
                          <div style="display: flex; gap: 6px; justify-content: flex-end;">
                            <button class="btn btn-primary btn-sm" style="font-size: 11px; padding: 4px 10px; background: #0369A1;" onclick="window.SchoolHubApp.copyToClipboard('${inviteUrl}', 'School Invite link copied to clipboard!')" ${!isActive ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                              📋 Copy Link
                            </button>
                            ${isActive ? `
                              <button class="btn btn-ghost btn-sm" style="color: #DC2626; font-size: 11px; padding: 4px 8px;" onclick="window.SchoolHubApp.handleRevokeInvite('${inv.id}')">
                                Revoke
                              </button>
                            ` : ''}
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;
  }


  // -------------------------------------------------------------
  // TAB 2: SUBJECT REGISTRY
  // -------------------------------------------------------------
  if (activeTab === 'registry') {
    const juniorSubs = registrySubjects.filter((s) => s.level === 'junior' || s.level === 'both');
    const seniorSubs = registrySubjects.filter((s) => s.level === 'senior' || s.level === 'both');

    return `
      <div class="fade-in">
        <div class="content-header">
          <div>
            <h1 class="text-heading" style="font-size: 24px;">Central Subject Registry</h1>
            <p class="text-body" style="color: var(--c-text-2);">
              Manage curriculum subjects for Junior (JSS 1 – JSS 3) and Senior (SS 1 – SS 3) Secondary levels.
            </p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-ghost" onclick="window.SchoolHubApp.resetSubjectRegistryToDefault('${school.id}')">
              🔄 Reset to Standard Registry
            </button>
            <button class="btn btn-primary" onclick="window.SchoolHubApp.openSubjectRegistryModal()" style="background: var(--c-admin);">
              + Add New Subject
            </button>
          </div>
        </div>

        <!-- Info Card on Departments & Levels -->
        <div style="background: #F0F9FF; border: 1px solid #BAE6FD; border-radius: var(--radius-md); padding: 14px; margin-bottom: 20px; font-size: 13px; color: #0369A1;">
          <strong>Curriculum Structure:</strong>
          <span style="color: #0F172A; margin-left: 6px;">
            • <strong>Junior Secondary:</strong> 20 Standard Core Subjects (Compulsory for all JSS learners).<br/>
            • <strong>Senior Secondary:</strong> 6 Core Compulsory Subjects + Departmental Subject Tracks (<strong>Science</strong>, <strong>Arts</strong>, <strong>Commercial</strong>).
          </span>
        </div>

        <div class="card">
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 80px;">Code</th>
                  <th>Subject Name</th>
                  <th>Curriculum Level</th>
                  <th>Category</th>
                  <th>Departments (Senior)</th>
                  <th>Active Classes</th>
                  <th>Status</th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${registrySubjects.map((sub) => {
                  const isActive = sub.status === 'active';
                  return `
                    <tr>
                      <td><span style="font-weight: 800; color: #0369A1; font-family: monospace;">${sub.code}</span></td>
                      <td style="font-weight: 600; color: #0F172A;">${sub.name}</td>
                      <td>
                        <span class="badge ${sub.level === 'both' ? 'badge-academic' : sub.level === 'junior' ? 'badge-event' : 'badge-sports'}">
                          ${sub.level === 'both' ? 'JSS & SSS' : sub.level === 'junior' ? 'Junior (JSS)' : 'Senior (SSS)'}
                        </span>
                      </td>
                      <td>
                        <span class="badge ${sub.category === 'core' ? 'badge-active' : sub.category === 'departmental' ? 'badge-urgent' : 'badge-sports'}">
                          ${sub.category.toUpperCase()}
                        </span>
                      </td>
                      <td style="font-size: 12px; color: var(--c-text-2);">
                        ${sub.departments && sub.departments.length > 0 ? sub.departments.join(', ') : 'Compulsory All'}
                      </td>
                      <td style="font-size: 11px; color: var(--c-text-3);">
                        ${sub.activeClasses ? sub.activeClasses.join(', ') : 'All'}
                      </td>
                      <td>
                        <span class="badge ${isActive ? 'badge-active' : 'badge-suspended'}">
                          ${isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style="text-align: right;">
                        <div style="display: flex; gap: 6px; justify-content: flex-end;">
                          <button class="btn btn-ghost btn-sm" onclick="window.SchoolHubApp.openSubjectRegistryModal('${sub.id}')">
                            Edit
                          </button>
                          <button class="btn btn-ghost btn-sm" style="color: ${isActive ? '#D97706' : '#059669'};" onclick="window.SchoolHubApp.toggleRegistrySubjectStatus('${sub.id}')">
                            ${isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button class="btn btn-ghost btn-sm" style="color: #DC2626;" onclick="window.SchoolHubApp.deleteRegistrySubject('${sub.id}')">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------
  // TAB 3: SCHOOL FEES & BURSARY
  // -------------------------------------------------------------
  if (activeTab === 'fees') {
    let filteredStudents = students;
    if (feeClassFilter !== 'all') {
      filteredStudents = filteredStudents.filter((s) => s.studentClass === feeClassFilter);
    }
    if (feeSearchQuery.trim()) {
      const q = feeSearchQuery.toLowerCase();
      filteredStudents = filteredStudents.filter(
        (s) => s.name.toLowerCase().includes(q) || (s.admissionNumber && s.admissionNumber.toLowerCase().includes(q))
      );
    }

    const summaries = filteredStudents.map((s) => {
      const summary = store.getStudentFeeSummary(school.id, s.id, '1st Term', '2024/2025');
      return { student: s, summary };
    });

    let displaySummaries = summaries;
    if (feeStatusFilter === 'paid') {
      displaySummaries = summaries.filter((item) => item.summary.status === 'paid');
    } else if (feeStatusFilter === 'partial') {
      displaySummaries = summaries.filter((item) => item.summary.status === 'partial');
    } else if (feeStatusFilter === 'owing') {
      displaySummaries = summaries.filter((item) => item.summary.status === 'owing');
    }

    const totalCollected = feePayments.reduce((acc, p) => acc + p.amountPaid, 0);

    return `
      <div class="fade-in">
        <div class="content-header">
          <div>
            <h1 class="text-heading" style="font-size: 24px;">School Fees & Bursary Management</h1>
            <p class="text-body" style="color: var(--c-text-2);">
              Manage fee schedules, record tuition payments, issue official receipts, and audit student balances.
            </p>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-ghost" onclick="window.SchoolHubApp.openFeeScheduleModal()">
              ⚙️ Fee Schedules
            </button>
            <button class="btn btn-primary" onclick="window.SchoolHubApp.openRecordFeePaymentModal()" style="background: #059669;">
              💳 Record Fee Payment
            </button>
          </div>
        </div>

        <!-- Metric Cards -->
        <div class="stat-grid" style="grid-template-columns: repeat(4, 1fr);">
          <div class="stat-card">
            <div class="stat-label">TOTAL COLLECTED</div>
            <div class="stat-value" style="color: #059669; font-size: 22px;">${formatNaira(totalCollected)}</div>
            <div class="stat-sub">${feePayments.length} receipts generated</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">CLEARED STUDENTS</div>
            <div class="stat-value" style="color: #059669;" data-count="${summaries.filter((i) => i.summary.status === 'paid').length}">
              ${summaries.filter((i) => i.summary.status === 'paid').length}
            </div>
            <div class="stat-sub">100% tuition paid</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">PARTIAL PAYMENTS</div>
            <div class="stat-value" style="color: #D97706;" data-count="${summaries.filter((i) => i.summary.status === 'partial').length}">
              ${summaries.filter((i) => i.summary.status === 'partial').length}
            </div>
            <div class="stat-sub">Installments pending</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">OWING / UNPAID</div>
            <div class="stat-value" style="color: #DC2626;" data-count="${summaries.filter((i) => i.summary.status === 'owing').length}">
              ${summaries.filter((i) => i.summary.status === 'owing').length}
            </div>
            <div class="stat-sub">Zero payment recorded</div>
          </div>
        </div>

        <!-- Filter & Search Controls -->
        <div class="card" style="margin-top: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
              <input
                type="text"
                class="form-input"
                placeholder="Search student or admission no..."
                value="${feeSearchQuery}"
                oninput="window.SchoolHubApp.filterAdminFeeSearch(this.value)"
                style="width: 240px; padding: 6px 12px; font-size: 13px;"
              />
              <select class="form-select" onchange="window.SchoolHubApp.filterAdminFeeClass(this.value)" style="width: 140px; padding: 6px 10px; font-size: 13px;">
                <option value="all" ${feeClassFilter === 'all' ? 'selected' : ''}>All Classes</option>
                ${ALL_CLASSES.map((cls) => `<option value="${cls}" ${feeClassFilter === cls ? 'selected' : ''}>${cls}</option>`).join('')}
              </select>
              <select class="form-select" onchange="window.SchoolHubApp.filterAdminFeeStatus(this.value)" style="width: 150px; padding: 6px 10px; font-size: 13px;">
                <option value="all" ${feeStatusFilter === 'all' ? 'selected' : ''}>All Fee Statuses</option>
                <option value="paid" ${feeStatusFilter === 'paid' ? 'selected' : ''}>Fully Paid (Cleared)</option>
                <option value="partial" ${feeStatusFilter === 'partial' ? 'selected' : ''}>Partially Paid</option>
                <option value="owing" ${feeStatusFilter === 'owing' ? 'selected' : ''}>Owing / Unpaid</option>
              </select>
            </div>

            <div style="font-size: 13px; color: var(--c-text-2);">
              Showing <strong>${displaySummaries.length}</strong> student ledger records
            </div>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Admission No.</th>
                  <th>Class & Dept</th>
                  <th>Total Billed</th>
                  <th>Paid to Date</th>
                  <th>Balance Due</th>
                  <th>Fee Status</th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${displaySummaries.map(({ student, summary }) => {
                  const isPaid = summary.status === 'paid';
                  const isPartial = summary.status === 'partial';

                  return `
                    <tr>
                      <td style="font-weight: 600; color: #0F172A;">${student.name}</td>
                      <td><span style="font-family: monospace; color: #0369A1; font-weight: 600;">${student.admissionNumber || '—'}</span></td>
                      <td>${student.studentClass} ${student.department ? `(${student.department})` : ''}</td>
                      <td>${formatNaira(summary.totalBilled)}</td>
                      <td style="font-weight: 600; color: #059669;">${formatNaira(summary.totalPaid)}</td>
                      <td style="font-weight: 700; color: ${summary.balance > 0 ? '#DC2626' : '#059669'};">
                        ${formatNaira(summary.balance)}
                      </td>
                      <td>
                        <span class="badge ${isPaid ? 'badge-active' : isPartial ? 'badge-urgent' : 'badge-suspended'}">
                          ${isPaid ? '✓ Fully Paid' : isPartial ? 'Partially Paid' : 'Owing'}
                        </span>
                      </td>
                      <td style="text-align: right;">
                        <div style="display: flex; gap: 6px; justify-content: flex-end;">
                          <button class="btn btn-primary btn-sm" style="background: #059669; font-size: 11px; padding: 4px 10px;" onclick="window.SchoolHubApp.openRecordFeePaymentModal('${student.id}', '${student.studentClass}')">
                            + Pay Fee
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------
  // TAB 4: FACULTY (TEACHERS)
  // -------------------------------------------------------------
  if (activeTab === 'teachers') {
    const pendingFaculty = store.getPendingUsers(school.id).filter((u) => u.role === 'teacher');

    return `
      <div class="fade-in">
        <div class="content-header">
          <div>
            <h1 class="text-heading" style="font-size: 24px;">Faculty Management</h1>
            <p class="text-body" style="color: var(--c-text-2);">
              Manage Class Teachers and Subject Teachers, their assigned subjects, and teaching classes.
            </p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-primary" onclick="window.SchoolHubApp.openSchoolInvitesModal()" style="background: #4F46E5;">
              🔗 Generate Faculty Invite
            </button>
            <button class="btn btn-primary" onclick="window.SchoolHubApp.openAdminRegisterTeacherModal()" style="background: var(--c-admin);">
              + Register New Teacher
            </button>
          </div>
        </div>

        ${pendingFaculty.length > 0 ? `
          <div class="card" style="border: 1px solid #FCD34D; background: #FFFBEB; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h2 class="text-subheading" style="color: #92400E; margin: 0; font-size: 15px;">
                ⏳ Pending Teacher Signups (${pendingFaculty.length})
              </h2>
              <span style="font-size: 12px; color: #B45309;">Signed up via school invite link &bull; Awaiting activation</span>
            </div>

            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Teacher Name</th>
                    <th>Email</th>
                    <th>Specialty</th>
                    <th>Subjects Selected</th>
                    <th>Phone</th>
                    <th style="text-align: right;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${pendingFaculty.map((t) => `
                    <tr>
                      <td style="font-weight: 600; color: #0F172A;">${t.name}</td>
                      <td style="color: var(--c-text-2); font-size: 13px;">${t.email}</td>
                      <td><span class="badge badge-academic">${t.specialty || 'General'}</span></td>
                      <td style="font-size: 12px; color: var(--c-text-2);">${(t.assignedSubjects || []).join(', ') || 'None selected'}</td>
                      <td style="font-size: 12px;">${t.phone || '—'}</td>
                      <td style="text-align: right;">
                        <div style="display: flex; gap: 6px; justify-content: flex-end;">
                          <button class="btn btn-primary btn-sm" style="background: #059669; font-size: 11px; padding: 4px 10px;" onclick="window.SchoolHubApp.handleApproveUser('${t.id}')">
                            ✓ Approve
                          </button>
                          <button class="btn btn-ghost btn-sm" style="color: #DC2626; font-size: 11px; padding: 4px 8px;" onclick="window.SchoolHubApp.handleRejectUser('${t.id}')">
                            ✕ Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

        <div class="card">
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Faculty Name</th>
                  <th>Email</th>
                  <th>Designation</th>
                  <th>Form Class</th>
                  <th>Assigned Classes</th>
                  <th>Assigned Subjects</th>
                  <th>Status</th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${teachers.map((t) => {
                  const isClassTeacher = t.teacherType === 'class_teacher';
                  const assignedSubs = store.getTeacherAssignedSubjects(t);
                  const assignedClasses = t.assignedClasses || (t.assignedClass ? [t.assignedClass] : []);

                  return `
                    <tr>
                      <td style="font-weight: 600; color: #0F172A;">${t.name}</td>
                      <td style="color: var(--c-text-2); font-size: 13px;">${t.email}</td>
                      <td>
                        <span class="badge ${isClassTeacher ? 'badge-academic' : 'badge-event'}">
                          ${isClassTeacher ? 'Class Teacher' : 'Subject Teacher'}
                        </span>
                      </td>
                      <td><strong>${t.assignedClass || '—'}</strong></td>
                      <td style="font-size: 12px; color: var(--c-text-2);">
                        ${assignedClasses.length > 0 ? assignedClasses.join(', ') : 'All'}
                      </td>
                      <td style="font-size: 12px; color: var(--c-text-2);">
                        ${assignedSubs.length > 0 ? assignedSubs.join(', ') : '—'}
                      </td>
                      <td>
                        <span class="badge ${t.status === 'active' ? 'badge-active' : 'badge-suspended'}">
                          ${t.status}
                        </span>
                      </td>
                      <td style="text-align: right;">
                        <div style="display: flex; gap: 6px; justify-content: flex-end;">
                          <button class="btn btn-ghost btn-sm" onclick="window.SchoolHubApp.openAdminRegisterTeacherModal('${t.id}')">
                            Edit
                          </button>
                          <button class="btn btn-ghost btn-sm" onclick="window.SchoolHubApp.viewUserProfile('${t.id}')">
                            Profile
                          </button>
                          <button class="btn btn-ghost btn-sm" style="color: #DC2626;" onclick="window.SchoolHubApp.removeUserFromSchool('${t.id}')">
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------
  // TAB 5: STUDENTS
  // -------------------------------------------------------------
  if (activeTab === 'students') {
    let filteredStudents = students;
    if (classFilter !== 'all') {
      filteredStudents = filteredStudents.filter((s) => s.studentClass === classFilter);
    }

    return `
      <div class="fade-in">
        <div class="content-header">
          <div>
            <h1 class="text-heading" style="font-size: 24px;">Enrolled Student Learners</h1>
            <p class="text-body" style="color: var(--c-text-2);">
              Manage learner profiles, admission numbers, class cohorts, and senior departments.
            </p>
          </div>
          <div style="display: flex; gap: 10px;">
            <select class="form-select" onchange="window.SchoolHubApp.setSchoolAdminClassFilter(this.value)" style="width: 140px; padding: 6px 10px;">
              <option value="all" ${classFilter === 'all' ? 'selected' : ''}>All Cohorts</option>
              ${ALL_CLASSES.map((cls) => `<option value="${cls}" ${classFilter === cls ? 'selected' : ''}>${cls}</option>`).join('')}
            </select>
            <button class="btn btn-primary" onclick="window.SchoolHubApp.openEnrolStudentModal()" style="background: #0D9488;">
              + Enrol Student
            </button>
          </div>
        </div>

        <div class="card">
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Admission No.</th>
                  <th>Class Cohort</th>
                  <th>Department (Senior)</th>
                  <th>Enrolled Curriculum</th>
                  <th>Fee Clearance</th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filteredStudents.map((s) => {
                  const isSenior = SENIOR_CLASSES.includes(s.studentClass as StudentClass);
                  const isFeeCleared = store.isStudentFeeCleared(school.id, s.id, '1st Term', '2024/2025');
                  const subjects = store.getSubjectsForClass(s.studentClass as StudentClass, s.department, school.id);

                  return `
                    <tr>
                      <td style="font-weight: 600; color: #0F172A;">${s.name}</td>
                      <td><span style="font-family: monospace; color: #0369A1; font-weight: 600;">${s.admissionNumber || '—'}</span></td>
                      <td><strong>${s.studentClass}</strong></td>
                      <td>
                        ${isSenior ? `
                          <span class="badge ${s.department === 'Science' ? 'badge-academic' : s.department === 'Arts' ? 'badge-event' : 'badge-sports'}">
                            ${s.department || 'Science'}
                          </span>
                        ` : '<span style="color: var(--c-text-3);">Core (All JSS)</span>'}
                      </td>
                      <td style="font-size: 12px; color: var(--c-text-2);">
                        ${subjects.length} subjects enrolled
                      </td>
                      <td>
                        <span class="badge ${isFeeCleared ? 'badge-active' : 'badge-suspended'}">
                          ${isFeeCleared ? '✓ Fee Cleared' : 'Owing / Unpaid'}
                        </span>
                      </td>
                      <td style="text-align: right;">
                        <div style="display: flex; gap: 6px; justify-content: flex-end;">
                          <button class="btn btn-ghost btn-sm" onclick="window.SchoolHubApp.openEditStudentModal('${s.id}')">
                            Edit
                          </button>
                          <button class="btn btn-ghost btn-sm" onclick="window.SchoolHubApp.viewUserProfile('${s.id}')">
                            Profile
                          </button>
                          <button class="btn btn-ghost btn-sm" style="color: #DC2626;" onclick="window.SchoolHubApp.removeUserFromSchool('${s.id}')">
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------
  // TAB 6: RESULTS & REPORTS (COMPILATION & PUBLISHING)
  // -------------------------------------------------------------
  if (activeTab === 'reports') {
    const classReports = reports.filter(
      (r) => r.studentClass === resultClass && r.term === resultTerm && r.session === resultSession
    );

    const publishedCount = classReports.filter((r) => r.status === 'published').length;
    const approvedCount = classReports.filter((r) => r.status === 'approved').length;
    const rawScores = store.getSubjectScores(school.id, resultClass, undefined, resultTerm, resultSession);

    return `
      <div class="fade-in">
        <div class="content-header">
          <div>
            <h1 class="text-heading" style="font-size: 24px;">Terminal Results & Report Cards</h1>
            <p class="text-body" style="color: var(--c-text-2);">
              Compile teacher subject scores on the official 9-point WAEC scale, approve grades, and publish to student portals.
            </p>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-ghost" onclick="window.SchoolHubApp.viewSubjectScoresLedgerModal('${resultClass}', '${resultTerm}', '${resultSession}')">
              📊 Raw Marks Ledger (${rawScores.length})
            </button>
            <button class="btn btn-primary" onclick="window.SchoolHubApp.handleCompileTerminalResults('${resultClass}', '${resultTerm}', '${resultSession}')" style="background: var(--c-admin);">
              ⚙️ Compile ${resultClass} Results
            </button>
          </div>
        </div>

        <!-- Filter Controls Bar -->
        <div class="card" style="margin-bottom: 20px; padding: 16px;">
          <div style="display: flex; gap: 14px; align-items: center; flex-wrap: wrap;">
            <div>
              <label style="font-size: 11px; font-weight: 600; color: var(--c-text-2); display: block; margin-bottom: 4px;">TARGET CLASS</label>
              <select class="form-select" onchange="window.SchoolHubApp.setAdminResultFilters(this.value, undefined, undefined)" style="width: 120px; padding: 6px 10px;">
                ${ALL_CLASSES.map((cls) => `<option value="${cls}" ${resultClass === cls ? 'selected' : ''}>${cls}</option>`).join('')}
              </select>
            </div>

            <div>
              <label style="font-size: 11px; font-weight: 600; color: var(--c-text-2); display: block; margin-bottom: 4px;">ACADEMIC TERM</label>
              <select class="form-select" onchange="window.SchoolHubApp.setAdminResultFilters(undefined, this.value, undefined)" style="width: 130px; padding: 6px 10px;">
                <option value="1st Term" ${resultTerm === '1st Term' ? 'selected' : ''}>1st Term</option>
                <option value="2nd Term" ${resultTerm === '2nd Term' ? 'selected' : ''}>2nd Term</option>
                <option value="3rd Term" ${resultTerm === '3rd Term' ? 'selected' : ''}>3rd Term</option>
              </select>
            </div>

            <div>
              <label style="font-size: 11px; font-weight: 600; color: var(--c-text-2); display: block; margin-bottom: 4px;">SESSION</label>
              <input class="form-input" value="${resultSession}" onchange="window.SchoolHubApp.setAdminResultFilters(undefined, undefined, this.value)" style="width: 120px; padding: 6px 10px;" />
            </div>

            <div style="margin-left: auto; display: flex; gap: 8px;">
              <button class="btn btn-ghost btn-sm" onclick="window.SchoolHubApp.handleApproveAllReports('${resultClass}', '${resultTerm}', '${resultSession}')">
                ✓ Approve All Reports
              </button>
              <button class="btn btn-primary btn-sm" onclick="window.SchoolHubApp.handlePublishAllReports('${resultClass}', '${resultTerm}', '${resultSession}')" style="background: #059669;">
                🚀 Issue / Publish to Portal (${classReports.length})
              </button>
            </div>
          </div>
        </div>

        <!-- Compiled Report Cards Table -->
        <div class="card">
          ${classReports.length === 0 ? `
            <div class="empty-state">
              <div class="empty-icon">📑</div>
              <p class="text-body" style="font-weight: 600; margin-bottom: 4px;">No Compiled Results Found for ${resultClass} (${resultTerm})</p>
              <p class="text-body" style="font-size: 13px; color: var(--c-text-2); margin-bottom: 16px;">
                Click "Compile ${resultClass} Results" above to automatically aggregate all teacher entered subject marks.
              </p>
              <button class="btn btn-primary" onclick="window.SchoolHubApp.handleCompileTerminalResults('${resultClass}', '${resultTerm}', '${resultSession}')" style="background: var(--c-admin);">
                ⚙️ Compile ${resultClass} Results Now
              </button>
            </div>
          ` : `
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width: 60px;">Rank</th>
                    <th>Student Name</th>
                    <th>Admission No.</th>
                    <th>Department</th>
                    <th>Total Score</th>
                    <th>Average</th>
                    <th>Grade</th>
                    <th>Fee Clearance</th>
                    <th>Portal Status</th>
                    <th style="text-align: right;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${classReports.map((r) => {
                    const isPub = r.status === 'published';
                    const isAppr = r.status === 'approved';
                    const isFeeCleared = store.isStudentFeeCleared(school.id, r.studentId, r.term, r.session);

                    return `
                      <tr>
                        <td style="font-weight: 800; color: #0369A1; font-size: 15px;">#${r.position}</td>
                        <td style="font-weight: 600; color: #0F172A;">${r.studentName}</td>
                        <td><span style="font-family: monospace; color: #64748B;">${r.admissionNumber || 'ADM/2024/0142'}</span></td>
                        <td>${r.department || '—'}</td>
                        <td><strong>${r.totalScore || Math.round(r.averageScore * r.subjects.length)}</strong> / ${r.subjects.length * 100}</td>
                        <td style="font-weight: 700; color: #059669;">${r.averageScore.toFixed(1)}%</td>
                        <td><strong>${r.overallGrade}</strong> <span style="font-size: 11px; color: var(--c-text-3);">(${r.overallRemark})</span></td>
                        <td>
                          <span class="badge ${isFeeCleared ? 'badge-active' : 'badge-suspended'}">
                            ${isFeeCleared ? '✓ Cleared' : 'Owing'}
                          </span>
                        </td>
                        <td>
                          <span class="badge ${isPub ? 'badge-active' : isAppr ? 'badge-academic' : 'badge-suspended'}">
                            ${isPub ? 'Published' : isAppr ? 'Approved' : 'Draft / In Review'}
                          </span>
                        </td>
                        <td style="text-align: right;">
                          <div style="display: flex; gap: 6px; justify-content: flex-end;">
                            <button class="btn btn-ghost btn-sm" onclick="window.SchoolHubApp.viewReportCardModal('${r.id}')">
                              View Sheet 🖨
                            </button>
                            ${!isPub ? `
                              <button class="btn btn-primary btn-sm" style="background: #059669;" onclick="window.SchoolHubApp.handlePublishReport('${r.id}')">
                                Publish
                              </button>
                            ` : `
                              <button class="btn btn-ghost btn-sm" style="color: #D97706;" onclick="window.SchoolHubApp.handleUnpublishReport('${r.id}')">
                                Revert
                              </button>
                            `}
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------
  // TAB 7: ANNOUNCEMENTS
  // -------------------------------------------------------------
  if (activeTab === 'announcements') {
    return `
      <div class="fade-in">
        <div class="content-header">
          <div>
            <h1 class="text-heading" style="font-size: 24px;">Institutional Announcements</h1>
            <p class="text-body" style="color: var(--c-text-2);">Broadcast official bulletins and circulars to faculty and student portals.</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 24px;">
          <div class="card">
            <h2 class="text-subheading" style="margin-bottom: 16px;">Publish New Bulletin</h2>
            <form onsubmit="window.SchoolHubApp.handlePostAnnouncement(event, 'admin')">
              <div class="form-group">
                <label class="form-label" for="ann-title">Bulletin Title *</label>
                <input class="form-input" id="ann-title" type="text" placeholder="e.g. End of Term Resumption Guidelines" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="ann-cat">Category *</label>
                <select class="form-select" id="ann-cat" required>
                  <option value="academic">Academic Notice</option>
                  <option value="general">General Institution</option>
                  <option value="event">School Event / Assembly</option>
                  <option value="urgent">Urgent / Administrative</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="ann-body">Announcement Body *</label>
                <textarea class="form-textarea" id="ann-body" placeholder="Type notice content here..." style="min-height: 120px;" required></textarea>
              </div>
              <div class="form-group" style="display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" id="ann-pin" />
                <label for="ann-pin" style="font-size: 13px; cursor: pointer;">Pin bulletin to top of student feeds</label>
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%; background: var(--c-admin);">
                📢 Broadcast Notice
              </button>
            </form>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${announcements.map((ann) => `
              <div class="card" style="border-left: 4px solid var(--c-admin);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                  <div>
                    <h3 style="font-size: 16px; font-weight: 700; color: #0F172A; margin: 0 0 4px 0;">${ann.title}</h3>
                    <div style="font-size: 11px; color: var(--c-text-3);">
                      By <strong>${ann.authorName}</strong> &bull; ${new Date(ann.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div style="display: flex; gap: 6px; align-items: center;">
                    <span class="badge badge-academic">${ann.category.toUpperCase()}</span>
                    <button class="btn btn-ghost btn-sm" style="color: #DC2626;" onclick="window.SchoolHubApp.deleteAnnouncement('${ann.id}')">✕</button>
                  </div>
                </div>
                <p style="font-size: 13px; color: var(--c-text-1); line-height: 1.5; margin: 0;">${ann.body}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------
  // TAB 8: SCHOOL SETTINGS
  // -------------------------------------------------------------
  if (activeTab === 'settings') {
    return `
      <div class="fade-in">
        <div class="content-header">
          <div>
            <h1 class="text-heading" style="font-size: 24px;">School Settings & Policy Configuration</h1>
            <p class="text-body" style="color: var(--c-text-2);">Update institutional profile, contact details, and result clearance rules.</p>
          </div>
        </div>

        <div style="max-width: 680px;" class="card">
          <form onsubmit="window.SchoolHubApp.handleUpdateSchoolProfile(event)">
            <div class="form-group">
              <label class="form-label" for="edit-sch-name">School Official Name *</label>
              <input class="form-input" id="edit-sch-name" type="text" value="${school.name}" required />
            </div>

            <div class="input-row">
              <div class="form-group">
                <label class="form-label" for="edit-sch-type">Institution Ownership *</label>
                <select class="form-select" id="edit-sch-type" required>
                  <option value="Private" ${school.type === 'Private' ? 'selected' : ''}>Private Institution</option>
                  <option value="Public" ${school.type === 'Public' ? 'selected' : ''}>Public / State Institution</option>
                  <option value="Missionary / Faith-Based" ${school.type === 'Missionary / Faith-Based' ? 'selected' : ''}>Missionary / Faith-Based</option>
                  <option value="Federal / Unity" ${school.type === 'Federal / Unity' ? 'selected' : ''}>Federal / Unity College</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="edit-sch-level">Academic Level *</label>
                <select class="form-select" id="edit-sch-level" required>
                  <option value="JSS & SSS" ${school.level === 'JSS & SSS' ? 'selected' : ''}>Junior & Senior Secondary (JSS 1 – SS 3)</option>
                  <option value="JSS Only" ${school.level === 'JSS Only' ? 'selected' : ''}>Junior Secondary Only (JSS 1 – JSS 3)</option>
                  <option value="SSS Only" ${school.level === 'SSS Only' ? 'selected' : ''}>Senior Secondary Only (SS 1 – SS 3)</option>
                </select>
              </div>
            </div>

            <div class="input-row">
              <div class="form-group">
                <label class="form-label" for="edit-sch-state">State Location *</label>
                <select class="form-select" id="edit-sch-state" required>
                  ${NIGERIAN_STATES.map((st) => `<option value="${st}" ${school.state === st ? 'selected' : ''}>${st} State</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="edit-sch-email">Official School Email *</label>
                <input class="form-input" id="edit-sch-email" type="email" value="${school.email}" required />
              </div>
            </div>

            <div class="form-group" style="background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: var(--radius-sm); padding: 14px; margin-top: 10px;">
              <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer;">
                <input type="checkbox" id="edit-sch-fee-enforce" ${school.enforceFeeClearanceForResults ? 'checked' : ''} style="margin-top: 3px;" />
                <div>
                  <strong style="color: #0F172A; font-size: 13px;">Enforce School Fee Clearance for Result Viewing</strong>
                  <p style="font-size: 12px; color: var(--c-text-2); margin: 2px 0 0 0;">
                    When checked, students and parents cannot view or print their terminal report cards until their school fees are marked as fully paid in the bursary module.
                  </p>
                </div>
              </label>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
              <button type="submit" class="btn btn-primary" style="background: var(--c-admin);">
                Save Institutional Settings
              </button>
            </div>
          </form>
        </div>

        <div style="max-width: 680px; margin-top: 24px;" class="card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div>
              <h2 class="text-subheading" style="font-size: 16px; margin: 0; color: #0F172A; display: flex; align-items: center; gap: 8px;">
                <span>✉️</span> Live Email Notification Engine (Resend API)
              </h2>
              <p class="text-body" style="color: var(--c-text-2); font-size: 13px; margin: 4px 0 0 0;">
                Used to dispatch email verification codes, bursary receipts, and student invitations.
              </p>
            </div>
            <button class="btn btn-primary btn-sm" onclick="window.SchoolHubApp.openEmailTesterModal()" style="background: #0369A1; white-space: nowrap;">
              🚀 Test Email Dispatch
            </button>
          </div>

          <div style="background: #F8FAFC; border: 1px solid var(--c-border); border-radius: var(--radius-sm); padding: 14px; font-size: 13px; color: var(--c-text-1);">
            <div style="margin-bottom: 6px;">
              <strong>Active Service:</strong> Resend API &bull; <strong>Default Sender:</strong> <code>SchoolHub &lt;onboarding@resend.dev&gt;</code>
            </div>
            <div style="color: var(--c-text-2); font-size: 12px; line-height: 1.5;">
              To change your custom domain or sender email, configure <code>RESEND_API_KEY</code> and <code>EMAIL_FROM</code> in your environment variables.
            </div>
          </div>
        </div>
      </div>
    `;
  }

  return '';
}
