import { Store, formatRelativeTime, calculateGrade } from '../store';
import { User, School, StudentClass, Department } from '../types';
import { PERIOD_TIMES, ALL_CLASSES, SENIOR_CLASSES } from '../seed';

export function renderTeacherDashboard(
  user: User,
  activeTab = 'home',
  selectedClass = 'SS2',
  selectedDate = new Date().toISOString().split('T')[0],
  selectedSubject?: string,
  selectedTerm = '1st Term',
  selectedSession = '2024/2025'
): string {
  const store = Store.getInstance();
  const school = store.getSchoolById(user.schoolId) || ({ id: user.schoolId, name: 'School', code: user.schoolId } as School);

  const students = store.getUsers().filter((u) => u.schoolId === user.schoolId && u.role === 'student');
  const myNews = store.getAnnouncements(user.schoolId).filter((a) => a.authorId === user.id);
  const myAssignments = store.getAssignments(user.schoolId).filter((a) => a.teacherId === user.id);
  const assignedSubjects = store.getTeacherAssignedSubjects(user);
  const assignedClasses = user.assignedClasses && user.assignedClasses.length > 0 ? user.assignedClasses : ALL_CLASSES;
  
  const currentSubject = selectedSubject && assignedSubjects.includes(selectedSubject) ? selectedSubject : assignedSubjects[0] || 'Mathematics';
  const myScores = store.getSubjectScores(user.schoolId).filter((s) => s.recordedByTeacherId === user.id);

  const isClassTeacher = user.teacherType === 'class_teacher';
  const teacherRoleTitle = isClassTeacher
    ? `Class Teacher ${user.assignedClass ? `(${user.assignedClass})` : ''}`
    : `Subject Teacher (${assignedSubjects.join(', ')})`;

  return `
    <div class="dashboard-container">
      <aside class="sidebar" style="background-color: var(--c-teach);">
        <div>
          <div class="sidebar-brand">
            <span class="sidebar-brand-icon">📚</span>
            <div>
              <div class="sidebar-brand-text">Teacher Portal</div>
              <span class="sidebar-badge">${isClassTeacher ? 'Class Teacher' : 'Subject Teacher'}</span>
            </div>
          </div>

          <nav class="sidebar-nav">
            <a class="nav-item ${activeTab === 'home' ? 'active' : ''}" onclick="window.SchoolHubApp.setTeacherTab('home')">
              <span>🏠</span> Home
            </a>
            <a class="nav-item ${activeTab === 'scores' || activeTab === 'reports' ? 'active' : ''}" onclick="window.SchoolHubApp.setTeacherTab('scores')">
              <span>📊</span> Record Subject Scores
            </a>
            ${isClassTeacher ? `
              <a class="nav-item ${activeTab === 'students' ? 'active' : ''}" onclick="window.SchoolHubApp.setTeacherTab('students')">
                <span>🎓</span> My Class Register
              </a>
            ` : ''}
            <a class="nav-item ${activeTab === 'news' ? 'active' : ''}" onclick="window.SchoolHubApp.setTeacherTab('news')">
              <span>📢</span> News Board
            </a>
            <a class="nav-item ${activeTab === 'assignments' ? 'active' : ''}" onclick="window.SchoolHubApp.setTeacherTab('assignments')">
              <span>📝</span> Assignments
            </a>
            <a class="nav-item ${activeTab === 'attendance' ? 'active' : ''}" onclick="window.SchoolHubApp.setTeacherTab('attendance')">
              <span>✅</span> Attendance
            </a>
            <a class="nav-item ${activeTab === 'timetable' ? 'active' : ''}" onclick="window.SchoolHubApp.setTeacherTab('timetable')">
              <span>🗓</span> Timetable
            </a>
          </nav>
        </div>

        <div class="sidebar-footer">
          <div class="sidebar-user-pill">
            <div style="overflow: hidden;">
              <div style="font-weight: 600; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${user.name}</div>
              <div style="font-size: 11px; opacity: 0.85;">${teacherRoleTitle}</div>
              <div style="font-size: 10px; opacity: 0.75;">${school.name}</div>
            </div>
          </div>
          <button class="btn btn-sm" onclick="window.SchoolHubApp.logout()" style="width: 100%; background: rgba(0,0,0,0.25); color: #FFFFFF; border: 1px solid rgba(255,255,255,0.2); margin-top: 8px;">
            Sign Out
          </button>
        </div>
      </aside>

      <main class="main-content">
        ${renderTeacherTabContent(
          user,
          school,
          activeTab,
          selectedClass,
          selectedDate,
          students,
          myNews,
          myScores,
          myAssignments,
          assignedSubjects,
          assignedClasses,
          currentSubject,
          selectedTerm,
          selectedSession
        )}
      </main>
    </div>
  `;
}

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function renderTeacherTabContent(
  user: User,
  school: School,
  activeTab: string,
  selectedClass: string,
  selectedDate: string,
  students: User[],
  myNews: any[],
  myScores: any[],
  myAssignments: any[],
  assignedSubjects: string[],
  assignedClasses: StudentClass[],
  currentSubject: string,
  selectedTerm: string,
  selectedSession: string
): string {
  const store = Store.getInstance();
  const allSchoolAnnouncements = store.getAnnouncements(user.schoolId);
  const isClassTeacher = user.teacherType === 'class_teacher';

  if (activeTab === 'home') {
    const greeting = getTimeGreeting();
    const activeAssignmentsCount = myAssignments.filter((a) => a.status === 'open').length;

    return `
      <div class="fade-in">
        <div class="content-header">
          <div>
            <h1 class="text-heading" style="font-size: 24px;">${greeting}, ${user.name} 👋</h1>
            <p class="text-body" style="color: var(--c-text-2);">
              ${school.name} &bull; 
              <span class="badge ${isClassTeacher ? 'badge-academic' : 'badge-general'}">
                ${isClassTeacher ? `Class Teacher (${user.assignedClass || 'Assigned Class'})` : 'Subject Teacher'}
              </span>
              &bull; Assigned: <strong>${assignedSubjects.join(', ')}</strong>
            </p>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            ${isClassTeacher ? `
              <button class="btn btn-primary" onclick="window.SchoolHubApp.openEnrolStudentModal()" style="background: #0D9488;">
                + Enrol Student
              </button>
            ` : ''}
            <button class="btn btn-primary" onclick="window.SchoolHubApp.setTeacherTab('scores')" style="background: var(--c-teach);">
              📊 Record Subject Scores
            </button>
            <button class="btn btn-ghost" onclick="window.SchoolHubApp.setTeacherTab('news')">
              + Post News
            </button>
          </div>
        </div>

        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-label">ASSIGNED SUBJECTS</div>
            <div class="stat-value">${assignedSubjects.length}</div>
            <div class="stat-sub">${assignedSubjects.join(', ')}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">SCORES RECORDED</div>
            <div class="stat-value" data-count="${myScores.length}">${myScores.length}</div>
            <div class="stat-sub">Student subject entries</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">ENROLLED STUDENTS</div>
            <div class="stat-value" data-count="${students.length}">${students.length}</div>
            <div class="stat-sub">${isClassTeacher ? `Class ${user.assignedClass || 'Cohort'}` : 'Across school'}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">ACTIVE ASSIGNMENTS</div>
            <div class="stat-value" data-count="${activeAssignmentsCount}">${activeAssignmentsCount}</div>
            <div class="stat-sub">Open for submissions</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; margin-top: 16px;">
          <div class="card">
            <h2 class="text-subheading" style="margin-bottom: 16px;">School Announcements & Notices</h2>
            ${allSchoolAnnouncements.length === 0 ? `
              <div class="empty-state" style="padding: 24px 0;">
                <div class="empty-icon">📢</div>
                <p class="text-body" style="color: var(--c-text-2);">No announcements posted yet.</p>
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 12px;">
                ${allSchoolAnnouncements.slice(0, 3).map((ann) => `
                  <div style="padding: 12px; background: var(--c-surface2); border-left: 3px solid var(--c-teach); border-radius: var(--radius-sm);">
                    <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${ann.title}</div>
                    <div style="font-size: 12px; color: var(--c-text-2); margin-bottom: 6px;">${ann.body}</div>
                    <span class="badge badge-academic">${ann.category}</span>
                  </div>
                `).join('')}
              </div>
            `}
          </div>

          <div class="card">
            <h2 class="text-subheading" style="margin-bottom: 16px;">Role Capabilities & Workflow</h2>
            <div style="background: var(--c-surface2); border-left: 3px solid var(--c-teach); padding: 12px; border-radius: var(--radius-sm); margin-bottom: 16px; font-size: 13px;">
              ${isClassTeacher ? `
                <strong>Class Teacher Permissions:</strong> You can enrol students into class <strong>${user.assignedClass || 'cohort'}</strong>, record subject scores for <strong>${assignedSubjects.join(', ')}</strong>, and manage daily class attendance.
              ` : `
                <strong>Subject Teacher Permissions:</strong> You can record subject scores for your assigned subjects (<strong>${assignedSubjects.join(', ')}</strong>) and set coursework. Student registration and final terminal result compilation are reserved for Class Teachers and School Admins.
              `}
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              <button class="btn btn-ghost" onclick="window.SchoolHubApp.setTeacherTab('scores')" style="justify-content: flex-start;">
                📊 Record & Enter Subject Marks (CA + Exam)
              </button>
              ${isClassTeacher ? `
                <button class="btn btn-ghost" onclick="window.SchoolHubApp.openEnrolStudentModal()" style="justify-content: flex-start;">
                  🎓 Enrol / Register New Student
                </button>
                <button class="btn btn-ghost" onclick="window.SchoolHubApp.setTeacherTab('attendance')" style="justify-content: flex-start;">
                  ✅ Take Daily Class Roll Call
                </button>
              ` : ''}
              <button class="btn btn-ghost" onclick="window.SchoolHubApp.setTeacherTab('assignments')" style="justify-content: flex-start;">
                📝 Post Subject Homework / Assignment
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // --- Record Subject Scores Tab ---
  if (activeTab === 'scores' || activeTab === 'reports') {
    const classStudents = students.filter((s) => s.studentClass === selectedClass);
    const existingScores = store.getSubjectScores(user.schoolId, selectedClass, currentSubject, selectedTerm, selectedSession);
    const scoreMap = new Map<string, any>();
    existingScores.forEach((s) => scoreMap.set(s.studentId, s));

    return `
      <div class="fade-in">
        <div class="content-header">
          <div>
            <h1 class="text-heading" style="font-size: 24px;">Record Subject Marks & Scores</h1>
            <p class="text-body" style="color: var(--c-text-2);">
              Enter CA 1 (Max 20), CA 2 (Max 20), and Terminal Exam (Max 60) marks using the standard 9-point WAEC grading scale.
            </p>
          </div>
          <div>
            <span class="badge badge-academic" style="font-size: 13px; padding: 6px 14px;">
              Assigned Subjects: ${assignedSubjects.join(', ')}
            </span>
          </div>
        </div>

        <div class="card" style="margin-bottom: 24px; padding: 18px; background: var(--c-surface2);">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; align-items: flex-end;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 600;">Assigned Subject *</label>
              <select class="form-select" id="score-subject-select" onchange="window.SchoolHubApp.setTeacherScoreFilters(undefined, this.value, undefined, undefined)">
                ${assignedSubjects.map((sub) => `<option value="${sub}" ${currentSubject === sub ? 'selected' : ''}>${sub}</option>`).join('')}
              </select>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 600;">Target Class *</label>
              <select class="form-select" id="score-class-select" onchange="window.SchoolHubApp.setTeacherScoreFilters(this.value, undefined, undefined, undefined)">
                ${assignedClasses.map((cls) => `
                  <option value="${cls}" ${selectedClass === cls ? 'selected' : ''}>${cls}</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 600;">Academic Term *</label>
              <select class="form-select" id="score-term-select" onchange="window.SchoolHubApp.setTeacherScoreFilters(undefined, undefined, this.value, undefined)">
                <option value="1st Term" ${selectedTerm === '1st Term' ? 'selected' : ''}>1st Term</option>
                <option value="2nd Term" ${selectedTerm === '2nd Term' ? 'selected' : ''}>2nd Term</option>
                <option value="3rd Term" ${selectedTerm === '3rd Term' ? 'selected' : ''}>3rd Term</option>
              </select>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 600;">Academic Session *</label>
              <input class="form-input" id="score-session-input" type="text" value="${selectedSession}" onchange="window.SchoolHubApp.setTeacherScoreFilters(undefined, undefined, undefined, this.value)" />
            </div>
          </div>
        </div>

        <div class="card" style="margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
            <div>
              <h2 class="text-subheading">${currentSubject} Marks Sheet &bull; Class ${selectedClass}</h2>
              <p class="text-body" style="font-size: 13px; color: var(--c-text-2);">
                ${selectedTerm} &bull; ${selectedSession} &bull; <strong>${classStudents.length} Students Enrolled</strong>
              </p>
            </div>
            <div style="font-size: 12px; color: var(--c-text-2); background: var(--c-surface2); padding: 6px 12px; border-radius: var(--radius-sm);">
              Score Matrix: <strong>CA 1 (20) + CA 2 (20) + Exam (60) = 100 Marks</strong>
            </div>
          </div>

          ${classStudents.length === 0 ? `
            <div class="empty-state">
              <div class="empty-icon">🎓</div>
              <h3 class="text-subheading">No students registered in ${selectedClass} yet</h3>
              <p class="text-body" style="color: var(--c-text-2); max-width: 360px;">
                ${isClassTeacher ? 'You can use the "+ Enrol Student" button above to enrol students into this class.' : 'Class teachers or the school administrator will enrol students into this cohort.'}
              </p>
            </div>
          ` : `
            <form onsubmit="window.SchoolHubApp.handleSaveSubjectScoresBreakdown(event, '${selectedClass}', '${currentSubject}', '${selectedTerm}', '${selectedSession}')">
              <div class="table-container" style="margin-bottom: 20px;">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th style="width: 22%;">Student Name</th>
                      <th style="width: 11%;">CA 1 (20)</th>
                      <th style="width: 11%;">CA 2 (20)</th>
                      <th style="width: 10%;">CA (40)</th>
                      <th style="width: 12%;">Exam (60)</th>
                      <th style="width: 10%;">Total (100)</th>
                      <th style="width: 11%;">WAEC Grade</th>
                      <th style="width: 13%;">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${classStudents.map((s, idx) => {
                      const entry = scoreMap.get(s.id);
                      const ca1 = entry?.ca1Score ?? (entry?.caScore ? Math.round(entry.caScore / 2) : 14);
                      const ca2 = entry?.ca2Score ?? (entry?.caScore ? Math.round(entry.caScore / 2) : 14);
                      const caTotal = ca1 + ca2;
                      const exam = entry?.examScore ?? (entry?.score ? entry.score - caTotal : 48);
                      const total = entry?.score ?? (caTotal + exam);
                      const gradeObj = calculateGrade(total);

                      return `
                        <tr>
                          <td>
                            <strong style="color: #0F172A;">${s.name}</strong>
                            <div style="font-size: 10px; color: var(--c-text-3); font-family: monospace;">${s.admissionNumber || ''}</div>
                            <input type="hidden" name="student_id_${idx}" value="${s.id}" />
                            <input type="hidden" name="student_name_${idx}" value="${s.name}" />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max="20"
                              class="form-input"
                              id="ca1_${idx}"
                              name="ca1_score_${idx}"
                              value="${ca1}"
                              oninput="window.SchoolHubApp.handleSubjectScoreRowCalc(${idx})"
                              required
                              style="padding: 6px 8px; width: 100%; text-align: center;"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max="20"
                              class="form-input"
                              id="ca2_${idx}"
                              name="ca2_score_${idx}"
                              value="${ca2}"
                              oninput="window.SchoolHubApp.handleSubjectScoreRowCalc(${idx})"
                              required
                              style="padding: 6px 8px; width: 100%; text-align: center;"
                            />
                          </td>
                          <td style="text-align: center;">
                            <strong id="ca_total_${idx}" style="color: #0284C7; font-size: 14px;">${caTotal}</strong>
                            <span style="font-size: 10px; color: var(--c-text-3);">/40</span>
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max="60"
                              class="form-input"
                              id="exam_${idx}"
                              name="exam_score_${idx}"
                              value="${exam}"
                              oninput="window.SchoolHubApp.handleSubjectScoreRowCalc(${idx})"
                              required
                              style="padding: 6px 8px; width: 100%; text-align: center;"
                            />
                          </td>
                          <td style="text-align: center;">
                            <strong id="total_${idx}" style="font-size: 15px; color: #0F172A;">${total}</strong>
                            <span style="font-size: 10px; color: var(--c-text-3);">/100</span>
                          </td>
                          <td style="text-align: center;">
                            <span id="grade_badge_${idx}" class="badge ${gradeObj.grade === 'A1' || gradeObj.grade === 'B2' ? 'badge-academic' : gradeObj.grade === 'F9' ? 'badge-suspended' : 'badge-general'}" style="font-weight: 800;">
                              ${gradeObj.grade}
                            </span>
                          </td>
                          <td>
                            <span id="remark_text_${idx}" style="font-size: 12px; font-weight: 500; color: #475569;">
                              ${gradeObj.remark}
                            </span>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; background: var(--c-surface2); padding: 14px 18px; border-radius: var(--radius-md);">
                <div style="font-size: 13px; color: var(--c-text-2);">
                  💡 <em>Auto-generated WAEC remarks (A1-F9) are computed automatically as you type.</em>
                </div>
                <button type="submit" class="btn btn-primary" style="background: var(--c-teach); padding: 12px 28px;">
                  💾 Save ${currentSubject} Scores
                </button>
              </div>
            </form>
          `}
        </div>
      </div>
    `;
  }

  // --- Students / Class Register Tab (For Class Teachers) ---
  if (activeTab === 'students' && isClassTeacher) {
    const classStudents = students.filter((s) => s.studentClass === user.assignedClass || s.studentClass === selectedClass);

    return `
      <div class="fade-in">
        <div class="content-header">
          <div>
            <h1 class="text-heading" style="font-size: 24px;">Class Register & Students</h1>
            <p class="text-body" style="color: var(--c-text-2);">
              Manage enrolled learners in your assigned class <strong>${user.assignedClass || selectedClass}</strong>.
            </p>
          </div>
          <div>
            <button class="btn btn-primary" onclick="window.SchoolHubApp.openEnrolStudentModal('${user.assignedClass || selectedClass}')" style="background: #0D9488;">
              + Enrol New Student
            </button>
          </div>
        </div>

        ${classStudents.length === 0 ? `
          <div class="card empty-state">
            <div class="empty-icon">🎓</div>
            <h3 class="text-subheading">No students enrolled yet</h3>
            <p class="text-body" style="color: var(--c-text-2); max-width: 360px;">
              Click "+ Enrol New Student" above to register learners into this class cohort.
            </p>
          </div>
        ` : `
          <div class="card">
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Admission No.</th>
                    <th>Class</th>
                    <th>Department</th>
                    <th>Curriculum Subjects</th>
                    <th>Fee Clearance</th>
                    <th style="text-align: right;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${classStudents.map((s) => {
                    const isFeeCleared = store.isStudentFeeCleared(user.schoolId, s.id, '1st Term', '2024/2025');
                    const subs = store.getSubjectsForClass(s.studentClass as StudentClass, s.department, user.schoolId);

                    return `
                      <tr>
                        <td style="font-weight: 600; color: #0F172A;">${s.name}</td>
                        <td><span style="font-family: monospace; color: #0369A1;">${s.admissionNumber || '—'}</span></td>
                        <td><strong>${s.studentClass}</strong></td>
                        <td>${s.department ? `<span class="badge badge-academic">${s.department}</span>` : '—'}</td>
                        <td style="font-size: 12px; color: var(--c-text-2);">${subs.length} subjects</td>
                        <td>
                          <span class="badge ${isFeeCleared ? 'badge-active' : 'badge-suspended'}">
                            ${isFeeCleared ? '✓ Cleared' : 'Owing'}
                          </span>
                        </td>
                        <td style="text-align: right;">
                          <button class="btn btn-ghost btn-sm" onclick="window.SchoolHubApp.openEditStudentModal('${s.id}')">
                            Edit
                          </button>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `}
      </div>
    `;
  }

  // --- News Board Tab ---
  if (activeTab === 'news') {
    return `
      <div class="fade-in">
        <div class="content-header">
          <div>
            <h1 class="text-heading" style="font-size: 24px;">Faculty News Board</h1>
            <p class="text-body" style="color: var(--c-text-2);">Post classroom bulletins and review school announcements.</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 24px;">
          <div class="card">
            <h2 class="text-subheading" style="margin-bottom: 16px;">Post Classroom Notice</h2>
            <form onsubmit="window.SchoolHubApp.handlePostAnnouncement(event, 'teacher')">
              <div class="form-group">
                <label class="form-label" for="teach-ann-title">Notice Title *</label>
                <input class="form-input" id="teach-ann-title" type="text" placeholder="e.g. Mathematics Practice Questions" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="teach-ann-cat">Category *</label>
                <select class="form-select" id="teach-ann-cat" required>
                  <option value="academic">Academic Notice</option>
                  <option value="general">General Classroom</option>
                  <option value="event">Class Activity / Project</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="teach-ann-body">Notice Body *</label>
                <textarea class="form-textarea" id="teach-ann-body" placeholder="Enter bulletin message for your students..." style="min-height: 120px;" required></textarea>
              </div>
              <div class="form-group" style="display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" id="teach-ann-pin" />
                <label for="teach-ann-pin" style="font-size: 13px; cursor: pointer;">Pin bulletin</label>
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%; background: var(--c-teach);">
                📢 Post Notice
              </button>
            </form>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${allSchoolAnnouncements.map((ann) => `
              <div class="card" style="border-left: 4px solid var(--c-teach);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                  <div>
                    <h3 style="font-size: 16px; font-weight: 700; color: #0F172A; margin: 0 0 4px 0;">${ann.title}</h3>
                    <div style="font-size: 11px; color: var(--c-text-3);">
                      By <strong>${ann.authorName}</strong> (${ann.authorRole.toUpperCase()}) &bull; ${new Date(ann.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <span class="badge badge-academic">${ann.category}</span>
                </div>
                <p style="font-size: 13px; color: var(--c-text-1); line-height: 1.5; margin: 0;">${ann.body}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // --- Assignments Tab ---
  if (activeTab === 'assignments') {
    return `
      <div class="fade-in">
        <div class="content-header">
          <div>
            <h1 class="text-heading" style="font-size: 24px;">Subject Assignments & Homework</h1>
            <p class="text-body" style="color: var(--c-text-2);">Set coursework tasks and grade student submissions.</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 24px;">
          <div class="card">
            <h2 class="text-subheading" style="margin-bottom: 16px;">Create New Assignment</h2>
            <form onsubmit="window.SchoolHubApp.handleCreateAssignment(event)">
              <div class="form-group">
                <label class="form-label" for="asg-title">Assignment Title *</label>
                <input class="form-input" id="asg-title" type="text" placeholder="e.g. Quadratic Equations Exercises" required />
              </div>
              <div class="input-row">
                <div class="form-group">
                  <label class="form-label" for="asg-subject">Subject *</label>
                  <select class="form-select" id="asg-subject" required>
                    ${assignedSubjects.map((s) => `<option value="${s}">${s}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="asg-class">Target Class *</label>
                  <select class="form-select" id="asg-class" required>
                    ${assignedClasses.map((cls) => `<option value="${cls}" ${selectedClass === cls ? 'selected' : ''}>${cls}</option>`).join('')}
                  </select>
                </div>
              </div>
              <div class="input-row">
                <div class="form-group">
                  <label class="form-label" for="asg-due">Submission Due Date *</label>
                  <input class="form-input" id="asg-due" type="date" required />
                </div>
                <div class="form-group">
                  <label class="form-label" for="asg-max">Max Score *</label>
                  <input class="form-input" id="asg-max" type="number" min="5" max="100" value="20" required />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label" for="asg-instructions">Instructions / Questions *</label>
                <textarea class="form-textarea" id="asg-instructions" placeholder="Provide assignment questions..." style="min-height: 100px;" required></textarea>
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%; background: var(--c-teach);">
                📝 Publish Assignment
              </button>
            </form>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${myAssignments.length === 0 ? `
              <div class="card empty-state">
                <div class="empty-icon">📝</div>
                <h3 class="text-subheading">No assignments created yet</h3>
                <p class="text-body" style="color: var(--c-text-2);">Create homework assignments using the form on the left.</p>
              </div>
            ` : myAssignments.map((asg) => {
              const subs = store.getSubmissions(asg.id);
              return `
                <div class="card" style="border-left: 4px solid var(--c-teach);">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <div>
                      <h3 style="font-size: 16px; font-weight: 700; color: #0F172A; margin: 0 0 2px 0;">${asg.title}</h3>
                      <div style="font-size: 12px; color: var(--c-text-2);">
                        <strong>${asg.subject}</strong> &bull; Class: <strong>${asg.studentClass}</strong> &bull; Due: ${asg.dueDate}
                      </div>
                    </div>
                    <span class="badge ${asg.status === 'open' ? 'badge-active' : 'badge-suspended'}">${asg.status.toUpperCase()}</span>
                  </div>
                  <p style="font-size: 13px; color: var(--c-text-1); margin: 0 0 14px 0;">${asg.instructions}</p>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 12px; color: var(--c-text-2);">
                      <strong>${subs.length}</strong> submission(s) received
                    </span>
                    <button class="btn btn-ghost btn-sm" onclick="window.SchoolHubApp.viewSubmissionsModal('${asg.id}')">
                      Review & Grade Submissions (${subs.length}) →
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // --- Attendance Tab ---
  if (activeTab === 'attendance') {
    const classStudents = students.filter((s) => s.studentClass === selectedClass);
    const existingAtt = store.getAttendance(user.schoolId, selectedClass, selectedDate);
    const attMap = new Map<string, string>();
    existingAtt.forEach((a) => attMap.set(a.studentId, a.status));

    return `
      <div class="fade-in">
        <div class="content-header">
          <div>
            <h1 class="text-heading" style="font-size: 24px;">Daily Attendance Roll Call</h1>
            <p class="text-body" style="color: var(--c-text-2);">Mark and record daily class register attendance.</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <select class="form-select" onchange="window.SchoolHubApp.setTeacherAttendanceClass(this.value)" style="width: 140px; padding: 6px 10px;">
              ${assignedClasses.map((cls) => `<option value="${cls}" ${selectedClass === cls ? 'selected' : ''}>${cls}</option>`).join('')}
            </select>
            <input
              type="date"
              class="form-input"
              value="${selectedDate}"
              onchange="window.SchoolHubApp.setTeacherAttendanceDate(this.value)"
              style="width: 160px; padding: 6px 10px;"
            />
          </div>
        </div>

        <div class="card">
          <form onsubmit="window.SchoolHubApp.handleSaveAttendance(event, '${selectedClass}', '${selectedDate}')">
            <div class="table-container" style="margin-bottom: 20px;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Admission No.</th>
                    <th style="text-align: center;">Present</th>
                    <th style="text-align: center;">Absent</th>
                    <th style="text-align: center;">Late</th>
                  </tr>
                </thead>
                <tbody>
                  ${classStudents.map((s) => {
                    const currentStatus = attMap.get(s.id) || 'present';
                    return `
                      <tr>
                        <td style="font-weight: 600; color: #0F172A;">${s.name}</td>
                        <td><span style="font-family: monospace; color: #64748B;">${s.admissionNumber || '—'}</span></td>
                        <td style="text-align: center;">
                          <input type="radio" name="att_${s.id}" value="present" ${currentStatus === 'present' ? 'checked' : ''} />
                        </td>
                        <td style="text-align: center;">
                          <input type="radio" name="att_${s.id}" value="absent" ${currentStatus === 'absent' ? 'checked' : ''} />
                        </td>
                        <td style="text-align: center;">
                          <input type="radio" name="att_${s.id}" value="late" ${currentStatus === 'late' ? 'checked' : ''} />
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>

            <div style="display: flex; justify-content: flex-end;">
              <button type="submit" class="btn btn-primary" style="background: var(--c-teach);">
                ✅ Save Attendance for ${selectedDate}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  // --- Timetable Tab ---
  if (activeTab === 'timetable') {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timetable = store.getTimetable(user.schoolId, selectedClass);

    return `
      <div class="fade-in">
        <div class="content-header">
          <div>
            <h1 class="text-heading" style="font-size: 24px;">Class Timetable & Schedule</h1>
            <p class="text-body" style="color: var(--c-text-2);">Master schedule for <strong>${selectedClass}</strong>.</p>
          </div>
          <div>
            <select class="form-select" onchange="window.SchoolHubApp.setTeacherTimetableClass(this.value)" style="width: 140px; padding: 6px 10px;">
              ${ALL_CLASSES.map((cls) => `<option value="${cls}" ${selectedClass === cls ? 'selected' : ''}>${cls}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="card" style="overflow-x: auto;">
          <table class="data-table" style="min-width: 700px;">
            <thead>
              <tr>
                <th style="width: 120px;">Day</th>
                ${PERIOD_TIMES.map((t, idx) => `<th>Period ${idx + 1}<br/><span style="font-size: 10px; font-weight: normal; color: var(--c-text-3);">${t}</span></th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${days.map((day) => `
                <tr>
                  <td style="font-weight: 700; color: #0F172A;">${day}</td>
                  ${PERIOD_TIMES.map((_, periodIdx) => {
                    const slot = timetable.find((s) => s.day === day && s.period === periodIdx);
                    return `
                      <td style="vertical-align: top; padding: 8px;">
                        ${slot ? `
                          <div style="background: #E0F2FE; border-left: 3px solid #0369A1; padding: 6px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;" onclick="window.SchoolHubApp.openEditTimetableModal('${school.id}', '${selectedClass}', '${day}', ${periodIdx}, '${slot.subject}', '${slot.room}')">
                            <strong style="color: #0369A1; display: block;">${slot.subject}</strong>
                            <div style="color: #475569;">${slot.room || 'Room 201'}</div>
                          </div>
                        ` : `
                          <button class="btn btn-ghost btn-sm" style="font-size: 10px; padding: 4px 6px; width: 100%; border: 1px dashed var(--c-border);" onclick="window.SchoolHubApp.openEditTimetableModal('${school.id}', '${selectedClass}', '${day}', ${periodIdx}, '${assignedSubjects[0] || 'Mathematics'}', 'Room 201')">
                            + Add
                          </button>
                        `}
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

  return '';
}
