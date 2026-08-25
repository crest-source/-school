import { Store, formatRelativeTime, formatNaira } from '../store';
import { User, School } from '../types';
import { PERIOD_TIMES } from '../seed';

export function renderStudentDashboard(
  user: User,
  activeTab = 'home',
  newsCategoryFilter = 'all',
  assignmentStatusFilter = 'all'
): string {
  const store = Store.getInstance();
  const school = store.getSchoolById(user.schoolId) || ({ id: user.schoolId, name: 'School', code: user.schoolId, enforceFeeClearanceForResults: false } as School);
  const studentClass = user.studentClass || 'SS2';

  const allMyReports = store.getReports(user.schoolId).filter((r) => r.studentId === user.id);
  const myReports = allMyReports.filter((r) => r.status === 'published');
  const pendingReports = allMyReports.filter((r) => r.status === 'draft' || r.status === 'approved');
  const myAssignments = store.getAssignments(user.schoolId).filter((a) => a.studentClass === studentClass);
  const mySubmissions = store.getSubmissions().filter((s) => s.studentId === user.id);
  const myAttendance = store.getAttendance(user.schoolId).filter((a) => a.studentId === user.id);
  const feeSummary = store.getStudentFeeSummary(user.schoolId, user.id, '1st Term', '2024/2025');

  return `
    <div class="dashboard-container">
      <aside class="sidebar" style="background-color: var(--c-stud);">
        <div>
          <div class="sidebar-brand">
            <span class="sidebar-brand-icon">🎓</span>
            <div>
              <div class="sidebar-brand-text">Student Portal</div>
              <span class="sidebar-badge" style="background: rgba(255,255,255,0.25);">${studentClass} Class</span>
            </div>
          </div>

          <nav class="sidebar-nav">
            <a class="nav-item ${activeTab === 'home' ? 'active' : ''}" onclick="window.SchoolHubApp.setStudentTab('home')">
              <span>🏠</span> Overview
            </a>
            <a class="nav-item ${activeTab === 'news' ? 'active' : ''}" onclick="window.SchoolHubApp.setStudentTab('news')">
              <span>📢</span> School News
            </a>
            <a class="nav-item ${activeTab === 'reports' ? 'active' : ''}" onclick="window.SchoolHubApp.setStudentTab('reports')">
              <span>📑</span> My Report Cards (${myReports.length})
            </a>
            <a class="nav-item ${activeTab === 'fees' ? 'active' : ''}" onclick="window.SchoolHubApp.setStudentTab('fees')">
              <span>💳</span> Tuition & Fees (${feeSummary.status === 'paid' ? 'Cleared' : 'Owing'})
            </a>
            <a class="nav-item ${activeTab === 'assignments' ? 'active' : ''}" onclick="window.SchoolHubApp.setStudentTab('assignments')">
              <span>📝</span> Assignments (${myAssignments.length})
            </a>
            <a class="nav-item ${activeTab === 'attendance' ? 'active' : ''}" onclick="window.SchoolHubApp.setStudentTab('attendance')">
              <span>✅</span> Attendance
            </a>
            <a class="nav-item ${activeTab === 'schedule' ? 'active' : ''}" onclick="window.SchoolHubApp.setStudentTab('schedule')">
              <span>🗓</span> Timetable
            </a>
          </nav>
        </div>

        <div class="sidebar-footer">
          <div class="sidebar-user-pill">
            <div style="overflow: hidden;">
              <div style="font-weight: 600; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${user.name}</div>
              <div style="font-size: 11px; opacity: 0.85;">${school.name} &bull; ${studentClass} ${user.department ? `(${user.department})` : ''}</div>
            </div>
          </div>
          <button class="btn btn-sm" onclick="window.SchoolHubApp.logout()" style="width: 100%; background: rgba(0,0,0,0.25); color: #FFFFFF; border: 1px solid rgba(255,255,255,0.2);">
            Sign Out
          </button>
        </div>
      </aside>

      <main class="main-content">
        ${renderStudentTabContent(
          user,
          school,
          studentClass,
          activeTab,
          newsCategoryFilter,
          assignmentStatusFilter,
          myReports,
          pendingReports,
          myAssignments,
          mySubmissions,
          myAttendance,
          feeSummary
        )}
      </main>
    </div>
  `;
}

function renderStudentTabContent(
  user: User,
  school: School,
  studentClass: string,
  activeTab: string,
  newsCategoryFilter: string,
  assignmentStatusFilter: string,
  myReports: any[],
  pendingReports: any[],
  myAssignments: any[],
  mySubmissions: any[],
  myAttendance: any[],
  feeSummary: any
): string {
  const store = Store.getInstance();
  const schoolNews = store.getAnnouncements(user.schoolId);

  // Attendance metrics
  const totalDays = myAttendance.length || 1;
  const presentCount = myAttendance.filter((a) => a.status === 'present').length;
  const absentCount = myAttendance.filter((a) => a.status === 'absent').length;
  const lateCount = myAttendance.filter((a) => a.status === 'late').length;
  const attRate = Math.round((presentCount / totalDays) * 100);

  if (activeTab === 'home') {
    const submissionMap = new Set(mySubmissions.map((s) => s.assignmentId));
    const pendingAssignments = myAssignments.filter((a) => !submissionMap.has(a.id) && a.status === 'open');

    // Next class helper
    const timetable = store.getTimetable(user.schoolId, studentClass);
    const dayNames: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri')[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const currentDayIdx = new Date().getDay() - 1; // 0 is Mon, 4 is Fri
    const todayName = dayNames[Math.max(0, Math.min(4, currentDayIdx))];
    const todayClasses = timetable.filter((t) => t.day === todayName && t.period !== 3);
    const nextSubject = todayClasses[0]?.subject || 'Mathematics';

    return `
      <div class="fade-in">
        <div class="content-header">
          <div>
            <h1 class="text-heading" style="font-size: 24px;">Welcome back, ${user.name} 🎓</h1>
            <p class="text-body" style="color: var(--c-text-2);">
              ${school.name} &bull; <strong>${studentClass} ${user.department ? `(${user.department})` : ''}</strong> &bull; Session 2024/2025
            </p>
          </div>
        </div>

        <div class="stat-grid">
          <div class="stat-card" style="border-top: 3px solid var(--c-stud);">
            <div class="stat-label">ASSIGNMENTS DUE</div>
            <div class="stat-value" data-count="${pendingAssignments.length}">${pendingAssignments.length}</div>
            <div class="stat-sub">Pending submission</div>
          </div>
          <div class="stat-card" style="border-top: 3px solid #10B981;">
            <div class="stat-label">TERM REPORT CARDS</div>
            <div class="stat-value" data-count="${myReports.length}">${myReports.length}</div>
            <div class="stat-sub">Published by faculty</div>
          </div>
          <div class="stat-card" style="border-top: 3px solid ${feeSummary.status === 'paid' ? '#10B981' : '#EF4444'};">
            <div class="stat-label">FEE STATUS</div>
            <div class="stat-value" style="font-size: 20px; color: ${feeSummary.status === 'paid' ? '#10B981' : '#EF4444'};">
              ${feeSummary.status === 'paid' ? 'Cleared ✓' : 'Owing'}
            </div>
            <div class="stat-sub">Balance: ${formatNaira(feeSummary.balance)}</div>
          </div>
          <div class="stat-card" style="border-top: 3px solid #0369A1;">
            <div class="stat-label">NEXT SUBJECT TODAY</div>
            <div class="stat-value" style="font-size: 20px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${nextSubject}</div>
            <div class="stat-sub">${todayName} timetable track</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px;">
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h2 class="text-subheading">Upcoming Course Assignments</h2>
              <button class="btn btn-ghost btn-sm" onclick="window.SchoolHubApp.setStudentTab('assignments')">View All</button>
            </div>
            ${pendingAssignments.length === 0 ? `
              <div style="padding: 24px; text-align: center; color: var(--c-text-2);">
                🎉 All caught up! No pending assignments.
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 12px;">
                ${pendingAssignments.slice(0, 3).map((asg) => `
                  <div style="padding: 14px; background: var(--c-surface2); border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <div style="font-weight: 600; font-size: 14px;">${asg.title}</div>
                      <div style="font-size: 12px; color: var(--c-text-2);">${asg.subject} &bull; Due: <strong>${asg.dueDate}</strong></div>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="window.SchoolHubApp.openSubmitAssignmentModal('${asg.id}', '${asg.title}')" style="background: var(--c-stud);">
                      Submit Work
                    </button>
                  </div>
                `).join('')}
              </div>
            `}
          </div>

          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h2 class="text-subheading">School Announcements</h2>
              <button class="btn btn-ghost btn-sm" onclick="window.SchoolHubApp.setStudentTab('news')">All News</button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${schoolNews.slice(0, 3).map((ann) => `
                <div style="padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--c-border); background: var(--c-surface);">
                  <div style="font-weight: 600; font-size: 13px; margin-bottom: 4px;">${ann.title}</div>
                  <div style="font-size: 11px; color: var(--c-text-3);">${formatRelativeTime(ann.createdAt)} &bull; ${ann.authorName}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (activeTab === 'news') {
    const filteredNews = newsCategoryFilter === 'all' ? schoolNews : schoolNews.filter((n) => n.category === newsCategoryFilter);
    filteredNews.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

    return `
      <div class="fade-in">
        <div class="content-header">
          <div>
            <h1 class="text-heading" style="font-size: 24px;">School Noticeboard & News</h1>
            <p class="text-body" style="color: var(--c-text-2);">Stay updated with school events, examination notices, and sports fixtures.</p>
          </div>
          <div>
            <select class="form-select" style="width: 160px;" onchange="window.SchoolHubApp.setStudentNewsFilter(this.value)">
              <option value="all" ${newsCategoryFilter === 'all' ? 'selected' : ''}>All Categories</option>
              <option value="Academic" ${newsCategoryFilter === 'Academic' ? 'selected' : ''}>Academic</option>
              <option value="Sports" ${newsCategoryFilter === 'Sports' ? 'selected' : ''}>Sports</option>
              <option value="Event" ${newsCategoryFilter === 'Event' ? 'selected' : ''}>Event</option>
              <option value="Urgent" ${newsCategoryFilter === 'Urgent' ? 'selected' : ''}>Urgent</option>
              <option value="General" ${newsCategoryFilter === 'General' ? 'selected' : ''}>General</option>
            </select>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${filteredNews.length === 0 ? `
            <div class="card empty-state">
              <div class="empty-icon">📢</div>
              <h3 class="text-subheading">No announcements found</h3>
            </div>
          ` : filteredNews.map((ann) => {
            const catBadgeClass =
              ann.category === 'Academic' ? 'badge-academic' :
              ann.category === 'Sports' ? 'badge-sports' :
              ann.category === 'Event' ? 'badge-event' :
              ann.category === 'Urgent' ? 'badge-urgent' : 'badge-general';

            return `
              <div class="card card-hover" style="${ann.isPinned ? 'border-left: 4px solid var(--c-stud);' : ''}">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="badge ${catBadgeClass}">${ann.category}</span>
                    ${ann.isPinned ? '<span style="font-size: 12px; color: var(--c-stud); font-weight: 600;">📌 Pinned</span>' : ''}
                  </div>
                  <span style="font-size: 12px; color: var(--c-text-3);">${formatRelativeTime(ann.createdAt)}</span>
                </div>
                <h3 class="text-subheading" style="margin-bottom: 8px;">${ann.title}</h3>
                <p class="text-body" style="color: var(--c-text-2); white-space: pre-line;">${ann.body}</p>
                <div style="margin-top: 14px; font-size: 12px; color: var(--c-text-3);">
                  Announced by <strong>${ann.authorName}</strong> ${ann.authorRole === 'admin' ? '(Admin)' : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // --- Reports Tab with Fee Clearance Enforcement ---
  if (activeTab === 'reports') {
    const isEnforced = school.enforceFeeClearanceForResults;
    const isFeeCleared = feeSummary.status === 'paid';

    return `
      <div class="fade-in">
        <div class="content-header">
          <div>
            <h1 class="text-heading" style="font-size: 24px;">My Academic Report Cards</h1>
            <p class="text-body" style="color: var(--c-text-2);">Official terminal evaluation results issued by your school administration.</p>
          </div>
        </div>

        ${isEnforced && !isFeeCleared ? `
          <div class="card" style="margin-bottom: 20px; background: #FEF2F2; border: 1px solid #FECACA; padding: 18px; display: flex; gap: 16px; align-items: center;">
            <div style="font-size: 32px;">🔒</div>
            <div>
              <h3 style="color: #991B1B; font-size: 16px; margin: 0 0 4px 0;">Official Result Cards Locked (Fee Clearance Required)</h3>
              <p style="font-size: 13px; color: #7F1D1D; margin: 0 0 10px 0;">
                The school requires full tuition clearance before end-of-term results and transcripts can be accessed. Your account currently has an outstanding balance of <strong>${formatNaira(feeSummary.balance)}</strong>.
              </p>
              <button class="btn btn-primary btn-sm" onclick="window.SchoolHubApp.setStudentTab('fees')" style="background: #DC2626;">
                View Fee Statement & Details →
              </button>
            </div>
          </div>
        ` : ''}

        ${pendingReports.length > 0 ? `
          <div class="card" style="margin-bottom: 20px; background: #FFFBEB; border: 1px solid #FDE68A; display: flex; gap: 14px; align-items: center; padding: 14px 18px;">
            <div style="font-size: 24px;">⏳</div>
            <div>
              <div style="font-weight: 600; color: #92400E; font-size: 14px;">Results In Compilation / Verification</div>
              <div style="font-size: 12px; color: #B45309;">
                ${pendingReports.length} term result card(s) are currently under administrative review & principal approval. Once officially published by the School Admin, they will unlock here.
              </div>
            </div>
          </div>
        ` : ''}

        ${myReports.length === 0 ? `
          <div class="card empty-state">
            <div class="empty-icon">📋</div>
            <h3 class="text-subheading">No published report cards yet</h3>
            <p class="text-body" style="color: var(--c-text-2); max-width: 380px;">
              ${pendingReports.length > 0 ? 'Your teachers have submitted scores and the administrator will release your official results shortly.' : 'Once the school compiles and issues your end-of-term results, they will appear here.'}
            </p>
          </div>
        ` : `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
            ${myReports.map((r) => {
              const isReportFeeCleared = store.isStudentFeeCleared(school.id, user.id, r.term, r.session);
              const isLocked = isEnforced && !isReportFeeCleared;

              return `
                <div class="card card-hover" style="border-top: 4px solid ${isLocked ? '#DC2626' : 'var(--c-stud)'}; display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                      <span class="badge badge-academic">${r.term}</span>
                      <span class="badge badge-general">${r.session}</span>
                    </div>
                    <h3 class="text-subheading" style="margin-bottom: 6px;">${r.studentClass} Terminal Evaluation</h3>
                    
                    ${isLocked ? `
                      <div style="padding: 14px; background: #FEF2F2; border-radius: var(--radius-md); font-size: 12px; color: #991B1B; margin: 12px 0;">
                        <strong>🔒 Details Hidden:</strong> Full marks breakdown and terminal sheet are locked pending fee clearance.
                      </div>
                    ` : `
                      <div style="font-size: 12px; color: var(--c-text-2); margin-bottom: 14px;">
                        Position: <strong>#${r.position} in class</strong> &bull; Avg: <strong>${r.averageScore.toFixed(1)}%</strong>
                      </div>
                      <div style="padding: 10px 14px; background: var(--c-surface2); border-radius: var(--radius-md); font-size: 12px; color: var(--c-text-1); margin-bottom: 16px;">
                        Grade: <strong>${r.overallGrade}</strong> &bull; ${r.overallRemark}
                      </div>
                    `}
                  </div>

                  <div style="border-top: 1px solid var(--c-border); padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 11px; color: var(--c-text-3);">Issued by Principal / Admin</span>
                    ${isLocked ? `
                      <button class="btn btn-ghost btn-sm" style="color: #DC2626;" disabled>
                        🔒 Locked
                      </button>
                    ` : `
                      <button class="btn btn-primary btn-sm" onclick="window.SchoolHubApp.viewReportCardModal('${r.id}')" style="background: var(--c-stud);">
                        View & Print 🖨
                      </button>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;
  }

  // --- Tuition & Fees Tab ---
  if (activeTab === 'fees') {
    const payments = store.getFeePayments(user.schoolId).filter((p) => p.studentId === user.id);

    return `
      <div class="fade-in">
        <div class="content-header">
          <div>
            <h1 class="text-heading" style="font-size: 24px;">Tuition & School Fee Ledger</h1>
            <p class="text-body" style="color: var(--c-text-2);">Summary of term school fees, payments recorded, and official payment receipts.</p>
          </div>
        </div>

        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-label">TOTAL BILLED</div>
            <div class="stat-value">${formatNaira(feeSummary.totalBilled)}</div>
            <div class="stat-sub">Academic session 2024/2025</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">TOTAL PAID TO DATE</div>
            <div class="stat-value" style="color: #059669;">${formatNaira(feeSummary.totalPaid)}</div>
            <div class="stat-sub">${payments.length} receipt(s) issued</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">CURRENT BALANCE</div>
            <div class="stat-value" style="color: ${feeSummary.balance > 0 ? '#DC2626' : '#059669'};">${formatNaira(feeSummary.balance)}</div>
            <div class="stat-sub">${feeSummary.status === 'paid' ? 'Zero balance' : 'Outstanding amount'}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">FEE STATUS</div>
            <div class="stat-value" style="font-size: 20px; color: ${feeSummary.status === 'paid' ? '#059669' : '#DC2626'};">
              ${feeSummary.status === 'paid' ? 'Fully Cleared ✓' : 'Owing Balance'}
            </div>
            <div class="stat-sub">Bursary clearance status</div>
          </div>
        </div>

        <div class="card" style="margin-top: 20px;">
          <h2 class="text-subheading" style="margin-bottom: 16px;">Payment History & Official Receipts</h2>
          ${payments.length === 0 ? `
            <div class="empty-state" style="padding: 24px 0;">
              <div class="empty-icon">💳</div>
              <p class="text-body" style="color: var(--c-text-2);">No payment receipts on file for this session.</p>
            </div>
          ` : `
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Receipt No.</th>
                    <th>Date Paid</th>
                    <th>Term</th>
                    <th>Method</th>
                    <th>Amount Paid</th>
                    <th>Balance Remaining</th>
                    <th style="text-align: right;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${payments.map((pay) => `
                    <tr>
                      <td><span style="font-family: monospace; font-weight: 700; color: #0369A1;">${pay.receiptNumber}</span></td>
                      <td>${new Date(pay.paidAt).toLocaleDateString()}</td>
                      <td>${pay.term}</td>
                      <td>${pay.paymentMethod}</td>
                      <td style="font-weight: 700; color: #059669;">${formatNaira(pay.amountPaid)}</td>
                      <td style="color: ${pay.balanceAfter > 0 ? '#DC2626' : '#059669'}; font-weight: 600;">
                        ${formatNaira(pay.balanceAfter)}
                      </td>
                      <td style="text-align: right;">
                        <button class="btn btn-ghost btn-sm" onclick="window.SchoolHubApp.viewFeeReceiptModal('${pay.id}')">
                          View Receipt 🖨
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;
  }

  // --- Assignments Tab ---
  if (activeTab === 'assignments') {
    const submissionMap = new Map(mySubmissions.map((s) => [s.assignmentId, s]));

    const filtered = myAssignments.filter((asg) => {
      const sub = submissionMap.get(asg.id);
      const isSubmitted = !!sub;
      const isPastDue = new Date(asg.dueDate).getTime() < Date.now();

      if (assignmentStatusFilter === 'Submitted') return isSubmitted;
      if (assignmentStatusFilter === 'Pending') return !isSubmitted && !isPastDue;
      if (assignmentStatusFilter === 'Overdue') return !isSubmitted && isPastDue;
      return true;
    });

    return `
      <div class="fade-in">
        <div class="content-header">
          <div>
            <h1 class="text-heading" style="font-size: 24px;">Coursework & Assignments</h1>
            <p class="text-body" style="color: var(--c-text-2);">Complete exercises and submit your responses directly to teachers.</p>
          </div>
          <div>
            <select class="form-select" style="width: 160px;" onchange="window.SchoolHubApp.setStudentAssignmentFilter(this.value)">
              <option value="all" ${assignmentStatusFilter === 'all' ? 'selected' : ''}>All Statuses</option>
              <option value="Pending" ${assignmentStatusFilter === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Submitted" ${assignmentStatusFilter === 'Submitted' ? 'selected' : ''}>Submitted</option>
              <option value="Overdue" ${assignmentStatusFilter === 'Overdue' ? 'selected' : ''}>Overdue</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
          ${filtered.length === 0 ? `
            <div class="card empty-state" style="grid-column: 1 / -1;">
              <div class="empty-icon">📚</div>
              <h3 class="text-subheading">No assignments found</h3>
            </div>
          ` : filtered.map((asg) => {
            const sub = submissionMap.get(asg.id);
            const isSubmitted = !!sub;
            const isPastDue = new Date(asg.dueDate).getTime() < Date.now();

            let statusBadge = `<span class="badge badge-general">Pending</span>`;
            if (isSubmitted) {
              statusBadge = `<span class="badge badge-academic">✓ Submitted</span>`;
            } else if (isPastDue) {
              statusBadge = `<span class="badge badge-urgent">Overdue</span>`;
            }

            return `
              <div class="card card-hover" style="display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                    <span class="badge badge-academic">${asg.subject}</span>
                    ${statusBadge}
                  </div>
                  <h3 class="text-subheading" style="margin-bottom: 6px;">${asg.title}</h3>
                  <div style="font-size: 12px; color: var(--c-text-2); margin-bottom: 12px;">
                    Teacher: <strong>${asg.teacherName}</strong> &bull; Max: <strong>${asg.maxScore} pts</strong>
                  </div>
                  <p class="text-body" style="font-size: 13px; color: var(--c-text-2); margin-bottom: 16px;">
                    ${asg.instructions}
                  </p>
                </div>

                <div>
                  ${isSubmitted ? `
                    <div style="padding: 10px; background: #D1FAE5; border-radius: var(--radius-md); font-size: 12px; color: #065F46; margin-bottom: 12px;">
                      <div><strong>Submitted:</strong> ${new Date(sub.submittedAt).toLocaleDateString()}</div>
                      ${sub.score !== undefined ? `<div style="font-weight: 600; margin-top: 4px;">Score: ${sub.score} / ${asg.maxScore} pts</div>` : '<div style="color: #047857;">Awaiting teacher grading</div>'}
                      ${sub.feedback ? `<div style="font-style: italic; margin-top: 4px;">"${sub.feedback}"</div>` : ''}
                    </div>
                  ` : ''}

                  <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--c-border); padding-top: 12px;">
                    <span style="font-size: 12px; color: var(--c-text-3);">Due: ${asg.dueDate}</span>
                    ${!isSubmitted ? `
                      <button class="btn btn-primary btn-sm" onclick="window.SchoolHubApp.openSubmitAssignmentModal('${asg.id}', '${asg.title}')" style="background: var(--c-stud);">
                        Submit Answer
                      </button>
                    ` : `
                      <span style="font-size: 12px; color: #10B981; font-weight: 600;">Completed</span>
                    `}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // --- Attendance Tab ---
  if (activeTab === 'attendance') {
    return `
      <div class="fade-in">
        <div class="content-header">
          <div>
            <h1 class="text-heading" style="font-size: 24px;">My Attendance Profile</h1>
            <p class="text-body" style="color: var(--c-text-2);">Complete record of classroom attendance and punctuality.</p>
          </div>
        </div>

        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-label">SESSIONS PRESENT</div>
            <div class="stat-value" style="color: #10B981;">${presentCount}</div>
            <div class="stat-sub">On-time classroom attendance</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">SESSIONS ABSENT</div>
            <div class="stat-value" style="color: #EF4444;">${absentCount}</div>
            <div class="stat-sub">Missed roll calls</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">LATE ARRIVALS</div>
            <div class="stat-value" style="color: #F59E0B;">${lateCount}</div>
            <div class="stat-sub">Marked after assembly</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">ATTENDANCE RATE</div>
            <div class="stat-value" style="color: ${attRate >= 75 ? '#10B981' : attRate >= 50 ? '#F59E0B' : '#EF4444'};">${attRate}%</div>
            <div class="stat-sub">Minimum requirement: 75%</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px;">
          <div class="card">
            <h2 class="text-subheading" style="margin-bottom: 16px;">Attendance History Log</h2>
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Class</th>
                  </tr>
                </thead>
                <tbody>
                  ${myAttendance.length === 0 ? `
                    <tr><td colspan="3" style="text-align: center; padding: 24px; color: var(--c-text-3);">No attendance records found</td></tr>
                  ` : myAttendance.map((a) => `
                    <tr>
                      <td style="font-weight: 500;">${new Date(a.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td>
                        <span class="badge ${a.status === 'present' ? 'badge-academic' : a.status === 'late' ? 'badge-sports' : 'badge-urgent'}">
                          ${a.status.toUpperCase()}
                        </span>
                      </td>
                      <td>${a.studentClass}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div class="card">
            <h2 class="text-subheading" style="margin-bottom: 16px;">4-Week Attendance Trend</h2>
            <div class="chart-container">
              <div class="chart-bar-col">
                <div class="chart-bar" style="height: 85%; background: var(--c-stud);"></div>
                <span style="font-size: 11px; color: var(--c-text-2); margin-top: 8px;">Wk 1</span>
              </div>
              <div class="chart-bar-col">
                <div class="chart-bar" style="height: 92%; background: var(--c-stud);"></div>
                <span style="font-size: 11px; color: var(--c-text-2); margin-top: 8px;">Wk 2</span>
              </div>
              <div class="chart-bar-col">
                <div class="chart-bar" style="height: 78%; background: var(--c-stud);"></div>
                <span style="font-size: 11px; color: var(--c-text-2); margin-top: 8px;">Wk 3</span>
              </div>
              <div class="chart-bar-col">
                <div class="chart-bar" style="height: 95%; background: var(--c-stud);"></div>
                <span style="font-size: 11px; color: var(--c-text-2); margin-top: 8px;">Wk 4</span>
              </div>
            </div>
            <div style="font-size: 12px; color: var(--c-text-2); margin-top: 14px; text-align: center;">
              Consistently meeting institutional compliance guidelines.
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Schedule / Timetable
  const timetable = store.getTimetable(user.schoolId, studentClass);
  const days: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri')[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const currentDayIdx = new Date().getDay() - 1;
  const todayName = dayNamesToday(currentDayIdx);

  return `
    <div class="fade-in">
      <div class="content-header">
        <div>
          <h1 class="text-heading" style="font-size: 24px;">Class Weekly Timetable</h1>
          <p class="text-body" style="color: var(--c-text-2);">${studentClass} Official Lecture Schedule</p>
        </div>
        <div style="background: var(--c-surface); border: 1px solid var(--c-border); padding: 6px 14px; border-radius: var(--radius-md); font-weight: 600; color: var(--c-stud); font-size: 13px;">
          🕒 Live Clock: <span id="student-live-clock">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      <div class="card" style="padding: 16px; overflow-x: auto;">
        <table class="timetable-table">
          <thead>
            <tr>
              <th style="width: 120px;">Period / Time</th>
              ${days.map((d) => `
                <th style="${d === todayName ? 'background: #EDE9FE; color: var(--c-stud); font-weight: 700;' : ''}">${d} ${d === todayName ? '(Today)' : ''}</th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${PERIOD_TIMES.map((timeStr, pIdx) => `
              <tr>
                <td style="font-weight: 600; font-size: 11px; background: var(--c-surface2);">${timeStr}</td>
                ${days.map((d) => {
                  const slot = timetable.find((s) => s.day === d && s.period === pIdx);
                  const isBreak = pIdx === 3;
                  const isToday = d === todayName;

                  if (isBreak) {
                    return `
                      <td class="timetable-break">Mid-Day Break</td>
                    `;
                  }

                  return `
                    <td class="${isToday ? 'timetable-day-highlight' : ''}">
                      <div class="timetable-cell" style="background: ${slot ? '#EEF2FF' : 'transparent'}; color: ${slot ? '#4338CA' : '#9CA3AF'}; font-weight: 600;">
                        ${slot ? `
                          <div>${slot.subject}</div>
                          <div style="font-size: 10px; font-weight: 400; color: var(--c-text-2);">${slot.room || 'Room 101'}</div>
                        ` : '—'}
                      </div>
                    </td>
                  `;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function dayNamesToday(idx: number): string {
  const map = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  if (idx >= 0 && idx < 5) return map[idx];
  return 'Mon';
}
