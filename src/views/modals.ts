import { Store, calculateGrade, formatNaira } from '../store';
import {
  ReportCard,
  Assignment,
  Submission,
  School,
  User,
  StudentClass,
  Department,
  RegistrySubject,
  FeePayment,
  FeeSchedule,
  SchoolInvite,
  InviteRole,
} from '../types';
import { ALL_CLASSES, JUNIOR_CLASSES, SENIOR_CLASSES, DEPARTMENTS, SUBJECT_LIST } from '../seed';

export function renderModalsContainer(): string {
  return `
    <div id="modal-container" class="modal-backdrop" onclick="window.SchoolHubApp.handleModalBackdropClick(event)">
      <div id="modal-content-target" style="display: contents;">
        <!-- Injected dynamically -->
      </div>
    </div>
    <div id="toast-container"></div>
  `;
}

// -------------------------------------------------------------
// 1. Upgraded Official Terminal Result Card Modal
// -------------------------------------------------------------
export function buildReportCardModalHtml(report: ReportCard, school: School): string {
  const isPublished = report.status === 'published';
  const isApproved = report.status === 'approved';
  const isSenior = SENIOR_CLASSES.includes(report.studentClass);

  return `
    <div class="modal-card modal-lg" style="max-width: 860px;">
      <button class="modal-close no-print" onclick="window.SchoolHubApp.closeModal()">✕</button>

      <div class="report-card-sheet" id="printable-report" style="background: #FFFFFF; padding: 32px; border: 2px solid #0369A1; border-radius: 8px; font-family: 'Inter', system-ui, sans-serif; color: #0F172A;">
        
        <!-- Header Section -->
        <div class="report-header" style="text-align: center; border-bottom: 2px solid #0369A1; padding-bottom: 16px; margin-bottom: 20px; position: relative;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 8px;">
            <div style="width: 56px; height: 56px; background: #E0F2FE; border: 2px solid #0369A1; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 32px;">
              🏫
            </div>
            <div>
              <h1 style="font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; color: #0F172A; margin: 0;">
                ${school.name}
              </h1>
              <div style="font-size: 13px; color: #475569; margin-top: 2px;">
                ${school.address || `${school.state} State, Nigeria`} &bull; Email: ${school.email}
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: center; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 8px;">
            <span style="background: #059669; color: #FFFFFF; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 2px 10px; border-radius: 12px; letter-spacing: 0.08em;">
              ✓ Government Approved Institution
            </span>
            <span style="background: #0369A1; color: #FFFFFF; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 2px 12px; border-radius: 12px; letter-spacing: 0.05em;">
              School Code: ${school.code}
            </span>
            <span style="background: #1E293B; color: #FFFFFF; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 2px 12px; border-radius: 12px; letter-spacing: 0.05em;">
              Terminal Performance Dossier
            </span>
          </div>
        </div>

        <!-- Student & Session Metadata Grid -->
        <div class="report-info-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #F8FAFC; border: 1px solid #CBD5E1; padding: 14px; border-radius: 6px; margin-bottom: 20px; font-size: 12px;">
          <div>
            <span style="color: #64748B; font-size: 10px; text-transform: uppercase; font-weight: 600;">Student Full Name</span><br/>
            <strong style="font-size: 14px; color: #0F172A;">${report.studentName}</strong>
          </div>
          <div>
            <span style="color: #64748B; font-size: 10px; text-transform: uppercase; font-weight: 600;">Admission / ID No.</span><br/>
            <strong style="font-size: 13px; color: #0369A1;">${report.admissionNumber || 'ADM/2024/0142'}</strong>
          </div>
          <div>
            <span style="color: #64748B; font-size: 10px; text-transform: uppercase; font-weight: 600;">Class Cohort</span><br/>
            <strong style="font-size: 13px; color: #0369A1;">${report.studentClass} ${isSenior && report.department ? `(${report.department})` : ''}</strong>
          </div>
          <div>
            <span style="color: #64748B; font-size: 10px; text-transform: uppercase; font-weight: 600;">Academic Term & Session</span><br/>
            <strong>${report.term} &bull; ${report.session}</strong>
          </div>

          <div>
            <span style="color: #64748B; font-size: 10px; text-transform: uppercase; font-weight: 600;">Class Position</span><br/>
            <strong style="font-size: 15px; color: #0369A1;">#${report.position} in class</strong>
          </div>
          <div>
            <span style="color: #64748B; font-size: 10px; text-transform: uppercase; font-weight: 600;">Cumulative Score</span><br/>
            <strong>${report.totalScore || Math.round(report.averageScore * report.subjects.length)}</strong> / ${report.subjects.length * 100}
          </div>
          <div>
            <span style="color: #64748B; font-size: 10px; text-transform: uppercase; font-weight: 600;">Terminal Average</span><br/>
            <strong style="font-size: 15px; color: #059669;">${report.averageScore.toFixed(1)}%</strong>
          </div>
          <div>
            <span style="color: #64748B; font-size: 10px; text-transform: uppercase; font-weight: 600;">Overall Grade & Remark</span><br/>
            <strong style="font-size: 14px; color: #059669;">${report.overallGrade} (${report.overallRemark})</strong>
          </div>
        </div>

        <!-- Score Breakdown Table (CA1 20, CA2 20, Exam 60 = 100) -->
        <div style="overflow-x: auto; margin-bottom: 20px;">
          <table class="report-table" style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #0369A1; color: #FFFFFF;">
                <th style="padding: 8px 6px; text-align: center; width: 4%;">S/N</th>
                <th style="padding: 8px 10px; text-align: left; width: 34%;">Subject Curriculum</th>
                <th style="padding: 8px 6px; text-align: center; width: 10%;">CA 1 (20)</th>
                <th style="padding: 8px 6px; text-align: center; width: 10%;">CA 2 (20)</th>
                <th style="padding: 8px 6px; text-align: center; width: 10%;">CA (40)</th>
                <th style="padding: 8px 6px; text-align: center; width: 12%;">Exam (60)</th>
                <th style="padding: 8px 6px; text-align: center; width: 10%;">Total (100)</th>
                <th style="padding: 8px 6px; text-align: center; width: 8%;">Grade</th>
                <th style="padding: 8px 8px; text-align: left; width: 12%;">Remark</th>
              </tr>
            </thead>
            <tbody>
              ${report.subjects.map((sub, i) => {
                const ca1 = sub.ca1Score !== undefined ? sub.ca1Score : Math.round(sub.score * 0.15);
                const ca2 = sub.ca2Score !== undefined ? sub.ca2Score : Math.round(sub.score * 0.15);
                const caTotal = sub.caScore !== undefined ? sub.caScore : (ca1 + ca2);
                const exam = sub.examScore !== undefined ? sub.examScore : (sub.score - caTotal);
                const isPass = sub.grade !== 'F9';

                return `
                  <tr style="border-bottom: 1px solid #E2E8F0; background: ${i % 2 === 0 ? '#FFFFFF' : '#F8FAFC'};">
                    <td style="padding: 7px 6px; text-align: center; color: #64748B;">${i + 1}</td>
                    <td style="padding: 7px 10px; font-weight: 600; color: #1E293B;">
                      ${sub.subject}
                      ${sub.subjectCode ? `<span style="font-size: 10px; color: #64748B; margin-left: 4px;">(${sub.subjectCode})</span>` : ''}
                    </td>
                    <td style="padding: 7px 6px; text-align: center; color: #475569;">${ca1}</td>
                    <td style="padding: 7px 6px; text-align: center; color: #475569;">${ca2}</td>
                    <td style="padding: 7px 6px; text-align: center; font-weight: 600; color: #0284C7;">${caTotal}</td>
                    <td style="padding: 7px 6px; text-align: center; color: #475569;">${exam}</td>
                    <td style="padding: 7px 6px; text-align: center; font-weight: 800; color: #0F172A;">${sub.score}</td>
                    <td style="padding: 7px 6px; text-align: center;">
                      <span style="font-weight: 800; color: ${isPass ? '#059669' : '#DC2626'};">${sub.grade}</span>
                    </td>
                    <td style="padding: 7px 8px; font-size: 11px; color: #475569;">${sub.remark}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Grading Key & Attendance Metrics -->
        <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 14px; margin-bottom: 16px;">
          <div style="background: #F1F5F9; padding: 10px 14px; border-radius: 6px; font-size: 11px; color: #334155; line-height: 1.4;">
            <strong style="color: #0F172A;">NATIONAL 9-POINT WAEC/NECO SCALE:</strong><br/>
            75-100: <strong>A1</strong> (Excellent) | 70-74: <strong>B2</strong> (Very Good) | 65-69: <strong>B3</strong> (Good)<br/>
            60-64: <strong>C4</strong> (Credit) | 55-59: <strong>C5</strong> (Credit) | 50-54: <strong>C6</strong> (Credit)<br/>
            45-49: <strong>D7</strong> (Pass) | 40-44: <strong>E8</strong> (Pass) | 0-39: <strong>F9</strong> (Fail)
          </div>
          <div style="background: #F1F5F9; padding: 10px 14px; border-radius: 6px; font-size: 11px; color: #334155;">
            <strong style="color: #0F172A;">ATTENDANCE PROFILE:</strong><br/>
            Days Present: <strong>${report.attendancePresent || 58}</strong> days<br/>
            Days Absent: <strong>${report.attendanceAbsent || 2}</strong> days &bull; Late: <strong>${report.attendanceLate || 1}</strong> times<br/>
            <span style="color: #0369A1; font-weight: 600;">Attendance Rate: ${(((report.attendancePresent || 58) / ((report.attendancePresent || 58) + (report.attendanceAbsent || 2))) * 100).toFixed(0)}%</span>
          </div>
        </div>

        <!-- Footer Comments -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px;">
          <div style="border: 1px solid #CBD5E1; padding: 12px; border-radius: 6px; font-size: 12px; background: #FFFFFF;">
            <strong style="color: #0F172A; display: block; margin-bottom: 4px;">Class Teacher's Comment:</strong>
            <p style="font-style: italic; color: #475569; margin: 0; line-height: 1.4;">
              "${report.teacherComment || 'Shows consistent academic commitment and exemplary classroom conduct.'}"
            </p>
          </div>
          <div style="border: 1px solid #CBD5E1; padding: 12px; border-radius: 6px; font-size: 12px; background: #FFFFFF;">
            <strong style="color: #0F172A; display: block; margin-bottom: 4px;">Principal / Administrator's Remark:</strong>
            <p style="font-style: italic; color: #475569; margin: 0; line-height: 1.4;">
              "${report.principalRemark || 'A commendable academic performance. Keep working hard towards excellence.'}"
            </p>
          </div>
        </div>

        <!-- Next Term Resumption Date -->
        <div style="background: #EFF6FF; border: 1px dashed #3B82F6; border-radius: 6px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; font-size: 12px;">
          <div>
            <strong style="color: #1E40AF;">📅 Next Academic Term Resumption:</strong>
            <span style="color: #1E293B; margin-left: 6px; font-weight: 700;">${report.nextTermBegins || 'Monday, 28th April, 2025'}</span>
          </div>
          <div style="font-size: 11px; color: #64748B;">
            All boarders resume the previous Sunday.
          </div>
        </div>

        <!-- Signatures & Official Stamp -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px dashed #94A3B8; padding-top: 16px;">
          <div style="text-align: center; font-size: 11px;">
            <div style="font-weight: 700; color: #0F172A; font-size: 13px;">${report.teacherName}</div>
            <div style="color: #64748B;">Class Teacher Signature</div>
          </div>

          <div style="text-align: center;">
            <div style="border: 2px solid ${isPublished ? '#059669' : '#D97706'}; color: ${isPublished ? '#059669' : '#D97706'}; border-radius: 50%; width: 72px; height: 72px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 9px; font-weight: 800; text-transform: uppercase; margin: 0 auto 4px auto;">
              <span>${isPublished ? 'OFFICIAL' : 'DRAFT'}</span>
              <span>${isPublished ? 'SEAL' : 'PENDING'}</span>
            </div>
            <div style="font-size: 10px; color: #64748B;">${school.code} &bull; ${report.session}</div>
          </div>

          <div style="text-align: center; font-size: 11px;">
            <div style="font-weight: 700; color: #0F172A; font-size: 13px;">School Principal / Head of School</div>
            <div style="color: #64748B;">Official Stamp & Signature</div>
          </div>
        </div>
      </div>

      <!-- Modal Action Buttons -->
      <div class="no-print" style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div>
          <span class="badge ${isPublished ? 'badge-active' : isApproved ? 'badge-academic' : 'badge-suspended'}">
            Status: ${isPublished ? '✓ Published to Student Portal' : isApproved ? 'Approved by Admin' : 'Draft / In Review'}
          </span>
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-ghost" onclick="window.SchoolHubApp.closeModal()">Close</button>
          <button class="btn btn-ghost" onclick="window.SchoolHubApp.handleEmailReportCard('${report.id}')" style="border: 1px solid var(--c-border); background: #FFFFFF;" title="Dispatch official digital result summary to student inbox">
            <span>✉️</span> Email Result
          </button>
          <button class="btn btn-primary" onclick="window.print()" style="background: #0369A1;">
            <span>🖨</span> Print Official Result Sheet
          </button>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// 2. Subject Registry Modals
// -------------------------------------------------------------
export function buildSubjectRegistryModalHtml(subject?: RegistrySubject, schoolId?: string): string {
  const isEdit = !!subject;

  return `
    <div class="modal-card modal-lg">
      <button class="modal-close" onclick="window.SchoolHubApp.closeModal()">✕</button>

      <h2 class="text-heading" style="font-size: 20px; margin-bottom: 4px;">
        ${isEdit ? 'Edit Subject in Registry' : 'Add Subject to Central Registry'}
      </h2>
      <p class="text-body" style="color: var(--c-text-2); margin-bottom: 20px;">
        Configure subject code, level, department assignment, and active classes.
      </p>

      <form onsubmit="window.SchoolHubApp.handleSaveRegistrySubject(event, '${subject?.id || ''}')">
        <div class="input-row">
          <div class="form-group">
            <label class="form-label" for="reg-sub-code">Subject Code * (e.g. MTH, PHY, ENG)</label>
            <input class="form-input" id="reg-sub-code" type="text" placeholder="e.g. MTH" value="${subject?.code || ''}" required uppercase style="text-transform: uppercase;" />
          </div>
          <div class="form-group">
            <label class="form-label" for="reg-sub-name">Full Subject Name *</label>
            <input class="form-input" id="reg-sub-name" type="text" placeholder="e.g. Mathematics" value="${subject?.name || ''}" required />
          </div>
        </div>

        <div class="input-row">
          <div class="form-group">
            <label class="form-label" for="reg-sub-level">Curriculum Level *</label>
            <select class="form-select" id="reg-sub-level" onchange="window.SchoolHubApp.toggleSubjectRegistryLevel(this.value)" required>
              <option value="both" ${subject?.level === 'both' ? 'selected' : ''}>Both Junior & Senior Secondary (JSS 1 – SS 3)</option>
              <option value="junior" ${subject?.level === 'junior' ? 'selected' : ''}>Junior Secondary Only (JSS 1 – JSS 3)</option>
              <option value="senior" ${subject?.level === 'senior' ? 'selected' : ''}>Senior Secondary Only (SS 1 – SS 3)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="reg-sub-cat">Subject Category *</label>
            <select class="form-select" id="reg-sub-cat" required>
              <option value="core" ${subject?.category === 'core' ? 'selected' : ''}>Core (Compulsory)</option>
              <option value="departmental" ${subject?.category === 'departmental' ? 'selected' : ''}>Department-Specific</option>
              <option value="elective" ${subject?.category === 'elective' ? 'selected' : ''}>Elective / Vocational</option>
            </select>
          </div>
        </div>

        <div class="form-group" id="reg-sub-depts-wrapper">
          <label class="form-label">Applicable Senior Departments (For SS1 – SS3)</label>
          <div style="display: flex; gap: 16px; background: var(--c-surface2); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--c-border);">
            ${DEPARTMENTS.map((dept) => {
              const checked = subject?.departments?.includes(dept) ?? (subject?.category === 'core');
              return `
                <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer;">
                  <input type="checkbox" name="reg_sub_depts" value="${dept}" ${checked ? 'checked' : ''} />
                  <span>${dept}</span>
                </label>
              `;
            }).join('')}
          </div>
          <span style="font-size: 11px; color: var(--c-text-3);">Admin can assign a subject to one or multiple departments.</span>
        </div>

        <div class="form-group">
          <label class="form-label">Active Classes</label>
          <div style="display: flex; gap: 12px; flex-wrap: wrap; background: var(--c-surface2); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--c-border);">
            ${ALL_CLASSES.map((cls) => {
              const checked = subject ? (subject.activeClasses?.includes(cls) ?? true) : true;
              return `
                <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer;">
                  <input type="checkbox" name="reg_sub_classes" value="${cls}" ${checked ? 'checked' : ''} />
                  <span>${cls}</span>
                </label>
              `;
            }).join('')}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="reg-sub-status">Status</label>
          <select class="form-select" id="reg-sub-status">
            <option value="active" ${subject?.status === 'active' || !subject ? 'selected' : ''}>Active</option>
            <option value="inactive" ${subject?.status === 'inactive' ? 'selected' : ''}>Inactive / Disabled</option>
          </select>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
          <button type="button" class="btn btn-ghost" onclick="window.SchoolHubApp.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" style="background: var(--c-admin);">
            ${isEdit ? 'Save Changes' : 'Add to Subject Registry'}
          </button>
        </div>
      </form>
    </div>
  `;
}

// -------------------------------------------------------------
// 3. Teacher Onboarding / Assignment Modal (Multi-Subject & Multi-Class)
// -------------------------------------------------------------
export function buildAdminRegisterTeacherModalHtml(schoolId: string, schoolName: string, teacherToEdit?: User): string {
  const store = Store.getInstance();
  const subjects = store.getRegistrySubjects(schoolId).filter((s) => s.status === 'active');
  const isEdit = !!teacherToEdit;

  const currentSubjects = teacherToEdit?.assignedSubjects || [];
  const currentClasses = teacherToEdit?.assignedClasses || (teacherToEdit?.assignedClass ? [teacherToEdit.assignedClass] : []);

  return `
    <div class="modal-card modal-lg">
      <button class="modal-close" onclick="window.SchoolHubApp.closeModal()">✕</button>

      <h2 class="text-heading" style="font-size: 22px; margin-bottom: 4px;">
        ${isEdit ? 'Edit Teacher Assignments' : 'Register & Assign Teacher'}
      </h2>
      <p class="text-body" style="color: var(--c-text-2); margin-bottom: 20px;">
        Faculty profile for <strong>${schoolName}</strong>. Assign multiple subjects and class cohorts.
      </p>

      <form onsubmit="window.SchoolHubApp.handleAdminRegisterTeacher(event, '${schoolId}', '${teacherToEdit?.id || ''}')">
        <div class="input-row">
          <div class="form-group">
            <label class="form-label" for="adm-teach-name">Teacher Full Name *</label>
            <input class="form-input" id="adm-teach-name" type="text" placeholder="e.g. Mr. Adeyemi Kolawole" value="${teacherToEdit?.name || ''}" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="adm-teach-email">Teacher Email Address *</label>
            <input class="form-input" id="adm-teach-email" type="email" placeholder="teacher@school.edu.ng" value="${teacherToEdit?.email || ''}" required ${isEdit ? 'readonly' : ''} />
          </div>
        </div>

        ${!isEdit ? `
          <div class="form-group">
            <label class="form-label" for="adm-teach-pass">Initial Login Password *</label>
            <input class="form-input" id="adm-teach-pass" type="password" value="Teacher@2025" required />
          </div>
        ` : ''}

        <div class="input-row">
          <div class="form-group">
            <label class="form-label" for="adm-teach-role">Teacher Designation *</label>
            <select class="form-select" id="adm-teach-role" onchange="window.SchoolHubApp.toggleAdminTeacherRoleType(this.value)" required>
              <option value="class_teacher" ${teacherToEdit?.teacherType === 'class_teacher' ? 'selected' : ''}>Class Teacher (Manages cohort attendance & records subject marks)</option>
              <option value="subject_teacher" ${teacherToEdit?.teacherType === 'subject_teacher' || !teacherToEdit ? 'selected' : ''}>Subject Teacher (Records marks for assigned subjects)</option>
            </select>
          </div>
          <div id="adm-teach-class-wrapper" class="form-group" style="${teacherToEdit?.teacherType === 'subject_teacher' ? 'display: none;' : ''}">
            <label class="form-label" for="adm-teach-class">Assigned Form Class *</label>
            <select class="form-select" id="adm-teach-class">
              ${ALL_CLASSES.map((cls) => `
                <option value="${cls}" ${teacherToEdit?.assignedClass === cls ? 'selected' : ''}>${cls}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Assigned Teaching Classes * (Select all classes this teacher instructs)</label>
          <div style="display: flex; gap: 12px; flex-wrap: wrap; background: var(--c-surface2); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--c-border);">
            ${ALL_CLASSES.map((cls) => {
              const checked = currentClasses.includes(cls);
              return `
                <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer;">
                  <input type="checkbox" name="adm_teach_classes" value="${cls}" ${checked ? 'checked' : ''} />
                  <span><strong>${cls}</strong></span>
                </label>
              `;
            }).join('')}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Assigned Teaching Subjects * (Select from active central registry)</label>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; max-height: 200px; overflow-y: auto; background: var(--c-surface2); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--c-border);">
            ${subjects.map((sub) => {
              const isChecked = currentSubjects.includes(sub.name) || currentSubjects.includes(sub.code);
              return `
                <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer;">
                  <input type="checkbox" name="adm_teach_subjects" value="${sub.name}" ${isChecked ? 'checked' : ''} />
                  <span><strong>${sub.code}</strong> - ${sub.name}</span>
                </label>
              `;
            }).join('')}
          </div>
          <span style="font-size: 11px; color: var(--c-text-3); margin-top: 4px; display: block;">
            These assignments determine the subjects and classes permitted on the teacher's score recording dashboard.
          </span>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
          <button type="button" class="btn btn-ghost" onclick="window.SchoolHubApp.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" style="background: var(--c-admin);">
            ${isEdit ? 'Update Teacher Profile' : 'Complete Teacher Registration'}
          </button>
        </div>
      </form>
    </div>
  `;
}

// -------------------------------------------------------------
// 4. Student Enrolment Modal with Department Selection (SS1 - SS3)
// -------------------------------------------------------------
export function buildEnrolStudentModalHtml(schoolId: string, defaultClass = 'SS2', studentToEdit?: User): string {
  const store = Store.getInstance();
  const isEdit = !!studentToEdit;
  const currentClass = studentToEdit?.studentClass || defaultClass;
  const isSenior = SENIOR_CLASSES.includes(currentClass as StudentClass);
  const currentDept = studentToEdit?.department || 'Science';

  return `
    <div class="modal-card modal-lg">
      <button class="modal-close" onclick="window.SchoolHubApp.closeModal()">✕</button>

      <h2 class="text-heading" style="font-size: 20px; margin-bottom: 4px;">
        ${isEdit ? 'Edit Student Details' : 'Enrol New Student'}
      </h2>
      <p class="text-body" style="color: var(--c-text-2); margin-bottom: 20px;">
        Register learner cohort, assign department (for Senior students), and auto-resolve curriculum subjects.
      </p>

      <form onsubmit="window.SchoolHubApp.handleEnrolStudent(event, '${schoolId}', '${studentToEdit?.id || ''}')">
        <div class="input-row">
          <div class="form-group">
            <label class="form-label" for="enrol-stud-name">Student Full Name *</label>
            <input class="form-input" id="enrol-stud-name" type="text" placeholder="e.g. Chukwuemeka Obi" value="${studentToEdit?.name || ''}" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="enrol-stud-adm">Admission / Student ID Number *</label>
            <input class="form-input" id="enrol-stud-adm" type="text" placeholder="e.g. HSS/2024/0142" value="${studentToEdit?.admissionNumber || ''}" required />
          </div>
        </div>

        <div class="input-row">
          <div class="form-group">
            <label class="form-label" for="enrol-stud-email">Student Login Email *</label>
            <input class="form-input" id="enrol-stud-email" type="email" placeholder="student@schoolhub.com" value="${studentToEdit?.email || ''}" required ${isEdit ? 'readonly' : ''} />
          </div>
          ${!isEdit ? `
            <div class="form-group">
              <label class="form-label" for="enrol-stud-pass">Login Password *</label>
              <input class="form-input" id="enrol-stud-pass" type="password" value="Student@2025" required />
            </div>
          ` : `
            <div class="form-group">
              <label class="form-label">Joined Portal</label>
              <input class="form-input" type="text" value="${new Date(studentToEdit?.joinedAt || '').toLocaleDateString()}" readonly />
            </div>
          `}
        </div>

        <div class="input-row">
          <div class="form-group">
            <label class="form-label" for="enrol-stud-class">Assigned Class Cohort *</label>
            <select class="form-select" id="enrol-stud-class" onchange="window.SchoolHubApp.handleStudentClassChange(this.value)" required>
              ${ALL_CLASSES.map((cls) => `
                <option value="${cls}" ${currentClass === cls ? 'selected' : ''}>${cls}</option>
              `).join('')}
            </select>
          </div>
          <div class="form-group" id="enrol-stud-dept-wrapper" style="${isSenior ? '' : 'display: none;'}">
            <label class="form-label" for="enrol-stud-dept">Department (Senior Secondary Only) *</label>
            <select class="form-select" id="enrol-stud-dept" onchange="window.SchoolHubApp.handleStudentDeptChange(this.value)">
              <option value="Science" ${currentDept === 'Science' ? 'selected' : ''}>Science (Physics, Chemistry, Biology, Further Maths, Technical Drawing)</option>
              <option value="Arts" ${currentDept === 'Arts' ? 'selected' : ''}>Arts (Literature, History, Government, CRS, French)</option>
              <option value="Commercial" ${currentDept === 'Commercial' ? 'selected' : ''}>Commercial (Commerce, Financial Accounting, Economics, Book Keeping, Digital Tech)</option>
            </select>
          </div>
        </div>

        <!-- Resolved Subjects Preview -->
        <div class="form-group" style="margin-top: 10px;">
          <label class="form-label">Auto-Populated Curriculum Subjects (Core + Department)</label>
          <div id="enrol-stud-subjects-preview" style="background: var(--c-surface2); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--c-border); font-size: 13px; color: var(--c-text-1);">
            <!-- Populated dynamically via JS -->
            Loading subjects for ${currentClass}...
          </div>
          <span style="font-size: 11px; color: var(--c-text-3); margin-top: 4px; display: block;">
            The subject list is automatically compiled from the standard registry (Core subjects + Department subjects).
          </span>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
          <button type="button" class="btn btn-ghost" onclick="window.SchoolHubApp.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" style="background: #0D9488;">
            ${isEdit ? 'Save Student Updates' : 'Complete Enrolment'}
          </button>
        </div>
      </form>
    </div>
  `;
}

// -------------------------------------------------------------
// 5. School Fees Payment Recording Modal
// -------------------------------------------------------------
export function buildRecordFeePaymentModalHtml(schoolId: string, preselectedStudentId?: string, defaultClass = 'SS2'): string {
  const store = Store.getInstance();
  const students = store.getUsers().filter((u) => u.schoolId === schoolId && u.role === 'student');
  const currentUser = store.getCurrentUser();
  const today = new Date().toISOString().split('T')[0];

  const selectedStudent = students.find((s) => s.id === preselectedStudentId) || students[0];
  const summary = selectedStudent ? store.getStudentFeeSummary(schoolId, selectedStudent.id, '1st Term', '2024/2025') : null;

  return `
    <div class="modal-card modal-lg">
      <button class="modal-close" onclick="window.SchoolHubApp.closeModal()">✕</button>

      <h2 class="text-heading" style="font-size: 20px; margin-bottom: 4px;">Record School Fee Payment</h2>
      <p class="text-body" style="color: var(--c-text-2); margin-bottom: 20px;">
        Accept tuition and institutional levy payments, update student balance, and generate an official receipt.
      </p>

      <form onsubmit="window.SchoolHubApp.handleRecordFeePayment(event, '${schoolId}')">
        <div class="input-row">
          <div class="form-group">
            <label class="form-label" for="fee-pay-student">Select Student *</label>
            <select class="form-select" id="fee-pay-student" onchange="window.SchoolHubApp.handleFeeStudentChange(this.value, '${schoolId}')" required>
              ${students.map((s) => `
                <option value="${s.id}" ${s.id === selectedStudent?.id ? 'selected' : ''}>
                  ${s.name} (${s.studentClass || '—'} &bull; ${s.admissionNumber || 'No ID'})
                </option>
              `).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="fee-pay-term">Academic Term & Session *</label>
            <select class="form-select" id="fee-pay-term" required>
              <option value="1st Term">1st Term &bull; 2024/2025</option>
              <option value="2nd Term">2nd Term &bull; 2024/2025</option>
              <option value="3rd Term">3rd Term &bull; 2024/2025</option>
            </select>
          </div>
        </div>

        <!-- Student Current Balance Banner -->
        <div id="fee-pay-balance-banner" style="background: #F0FDF4; border: 1px solid #86EFAC; border-radius: var(--radius-md); padding: 14px; margin-bottom: 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; text-align: center;">
          <div>
            <div style="font-size: 11px; color: #166534; text-transform: uppercase; font-weight: 600;">Total Billed</div>
            <div style="font-size: 18px; font-weight: 700; color: #166534;">${formatNaira(summary?.totalBilled || 100000)}</div>
          </div>
          <div>
            <div style="font-size: 11px; color: #166534; text-transform: uppercase; font-weight: 600;">Amount Paid So Far</div>
            <div style="font-size: 18px; font-weight: 700; color: #059669;">${formatNaira(summary?.totalPaid || 0)}</div>
          </div>
          <div>
            <div style="font-size: 11px; color: #991B1B; text-transform: uppercase; font-weight: 600;">Current Balance Due</div>
            <div style="font-size: 18px; font-weight: 800; color: ${(summary?.balance || 0) > 0 ? '#DC2626' : '#059669'};">
              ${formatNaira(summary?.balance || 0)}
            </div>
          </div>
        </div>

        <div class="input-row">
          <div class="form-group">
            <label class="form-label" for="fee-pay-amount">Amount Paid (₦) *</label>
            <input class="form-input" id="fee-pay-amount" type="number" min="1" step="100" placeholder="e.g. 50000" value="${summary?.balance || 50000}" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="fee-pay-date">Payment Date *</label>
            <input class="form-input" id="fee-pay-date" type="date" value="${today}" required />
          </div>
        </div>

        <div class="input-row">
          <div class="form-group">
            <label class="form-label" for="fee-pay-method">Payment Channel / Method *</label>
            <select class="form-select" id="fee-pay-method" required>
              <option value="Bank Transfer">Bank Transfer (Zenith / GTBank / Access / UBA)</option>
              <option value="Cash">Cash (Bursary Counter)</option>
              <option value="POS">POS Terminal Card Transaction</option>
              <option value="Online / Card">Online Portal Payment Gateway</option>
              <option value="Bank Draft">Bank Draft / Cheque</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="fee-pay-ref">Transaction Reference / Teller No. *</label>
            <input class="form-input" id="fee-pay-ref" type="text" placeholder="e.g. TXN-84920194 or CSH-0012" value="TXN-${Math.floor(10000000 + Math.random() * 90000000)}" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="fee-pay-notes">Cashier / Bursar Remarks or Notes (Optional)</label>
          <input class="form-input" id="fee-pay-notes" type="text" placeholder="e.g. First installment paid towards 1st term tuition fees" value="Payment recorded by ${currentUser?.name || 'Admin'}." />
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
          <button type="button" class="btn btn-ghost" onclick="window.SchoolHubApp.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" style="background: #059669;">
            💳 Record Payment & Generate Receipt
          </button>
        </div>
      </form>
    </div>
  `;
}

// -------------------------------------------------------------
// 6. Printable Payment Receipt Modal
// -------------------------------------------------------------
export function buildFeeReceiptModalHtml(payment: FeePayment, school: School, studentUser?: User, schedule?: FeeSchedule): string {
  const store = Store.getInstance();
  const student = studentUser || store.getUserById(payment.studentId) || ({ name: payment.studentName, admissionNumber: 'ADM/2024/0142' } as User);
  const summary = store.getStudentFeeSummary(school.id, payment.studentId, payment.term, payment.session);

  return `
    <div class="modal-card modal-lg" style="max-width: 760px;">
      <button class="modal-close no-print" onclick="window.SchoolHubApp.closeModal()">✕</button>

      <div class="report-card-sheet" id="printable-receipt" style="background: #FFFFFF; padding: 32px; border: 2px solid #059669; border-radius: 8px; font-family: 'Inter', system-ui, sans-serif; color: #0F172A;">
        
        <!-- Header -->
        <div style="text-align: center; border-bottom: 2px solid #059669; padding-bottom: 16px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 6px;">
            <div style="width: 48px; height: 48px; background: #DCFCE7; border: 2px solid #059669; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 26px;">
              🏫
            </div>
            <div>
              <h1 style="font-size: 22px; font-weight: 800; text-transform: uppercase; color: #0F172A; margin: 0;">
                ${school.name}
              </h1>
              <div style="font-size: 12px; color: #475569;">
                ${school.address || `${school.state} State, Nigeria`} &bull; Email: ${school.email}
              </div>
            </div>
          </div>

          <div style="display: inline-block; background: #059669; color: #FFFFFF; padding: 3px 18px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.05em; margin-top: 6px;">
            OFFICIAL PAYMENT RECEIPT & BURSARY CLEARANCE
          </div>
        </div>

        <!-- Receipt Metadata -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: #F8FAFC; border: 1px solid #CBD5E1; padding: 12px; border-radius: 6px; margin-bottom: 20px; font-size: 12px;">
          <div>
            <span style="color: #64748B; font-size: 10px; text-transform: uppercase; font-weight: 600;">Receipt Number</span><br/>
            <strong style="font-size: 14px; color: #059669; font-family: monospace;">${payment.receiptNumber || payment.id}</strong>
          </div>
          <div>
            <span style="color: #64748B; font-size: 10px; text-transform: uppercase; font-weight: 600;">Payment Date</span><br/>
            <strong>${new Date(payment.paidAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
          </div>
          <div>
            <span style="color: #64748B; font-size: 10px; text-transform: uppercase; font-weight: 600;">Payment Channel</span><br/>
            <strong>${payment.paymentMethod}</strong>
          </div>

          <div>
            <span style="color: #64748B; font-size: 10px; text-transform: uppercase; font-weight: 600;">Student Full Name</span><br/>
            <strong style="font-size: 13px; color: #0F172A;">${payment.studentName}</strong>
          </div>
          <div>
            <span style="color: #64748B; font-size: 10px; text-transform: uppercase; font-weight: 600;">Admission / ID No.</span><br/>
            <strong style="color: #0369A1;">${student.admissionNumber || 'ADM/2024/0142'}</strong>
          </div>
          <div>
            <span style="color: #64748B; font-size: 10px; text-transform: uppercase; font-weight: 600;">Class Cohort</span><br/>
            <strong>${payment.studentClass} (${payment.term} &bull; ${payment.session})</strong>
          </div>
        </div>

        <!-- Amount Paid Callout -->
        <div style="background: #F0FDF4; border: 2px solid #059669; border-radius: 8px; padding: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 12px; color: #166534; font-weight: 600; text-transform: uppercase;">Amount Paid (This Transaction)</div>
            <div style="font-size: 28px; font-weight: 800; color: #059669;">${formatNaira(payment.amountPaid)}</div>
            <div style="font-size: 11px; color: #166534; font-style: italic; margin-top: 2px;">
              Receipt Ref: <strong>${payment.receiptNumber || payment.id}</strong>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11px; color: #64748B;">Total Billed: <strong>${formatNaira(summary.totalBilled)}</strong></div>
            <div style="font-size: 11px; color: #059669;">Total Paid to Date: <strong>${formatNaira(summary.totalPaid)}</strong></div>
            <div style="font-size: 13px; font-weight: 800; color: ${summary.balance > 0 ? '#DC2626' : '#059669'}; margin-top: 4px;">
              ${summary.balance > 0 ? `Outstanding Balance: ${formatNaira(summary.balance)}` : '✓ FULLY CLEARED'}
            </div>
          </div>
        </div>

        ${payment.notes ? `
          <div style="font-size: 12px; color: #475569; margin-bottom: 20px; background: #F8FAFC; padding: 10px; border-radius: 6px;">
            <strong>Transaction Remarks:</strong> ${payment.notes}
          </div>
        ` : ''}

        <!-- Signatures & Stamp -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px dashed #94A3B8; padding-top: 16px; margin-top: 10px;">
          <div style="text-align: center; font-size: 11px;">
            <div style="font-weight: 700; color: #0F172A;">Bursary Department</div>
            <div style="color: #64748B;">Authorized Cashier / Officer</div>
          </div>

          <div style="text-align: center;">
            <div style="border: 2px solid #059669; color: #059669; border-radius: 50%; width: 70px; height: 70px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 9px; font-weight: 800; text-transform: uppercase; margin: 0 auto 4px auto;">
              <span>FEES PAID</span>
              <span>BURSARY</span>
            </div>
            <div style="font-size: 9px; color: #64748B;">${school.code}</div>
          </div>

          <div style="text-align: center; font-size: 11px;">
            <div style="font-weight: 700; color: #0F172A;">Head of Finance / Admin</div>
            <div style="color: #64748B;">Official Stamp & Clearance</div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="no-print" style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn btn-ghost" onclick="window.SchoolHubApp.closeModal()">Close</button>
        <button class="btn btn-primary" onclick="window.print()" style="background: #059669;">
          <span>🖨</span> Print Official Receipt
        </button>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// Custom Report Generator Modal
// -------------------------------------------------------------
export function buildCustomReportGeneratorModalHtml(schoolId: string, defaultClass = 'SS2'): string {
  const store = Store.getInstance();
  const students = store.getUsers().filter((u) => u.schoolId === schoolId && u.role === 'student');

  return `
    <div class="modal-card modal-lg">
      <button class="modal-close" onclick="window.SchoolHubApp.closeModal()">✕</button>

      <h2 class="text-heading" style="font-size: 22px; margin-bottom: 4px;">Custom Terminal Report Generator</h2>
      <p class="text-body" style="color: var(--c-text-2); margin-bottom: 20px;">
        Compile single student terminal report card with custom marks, remarks, and grading on the 9-point WAEC scale.
      </p>

      <form onsubmit="window.SchoolHubApp.handleGenerateReport(event)">
        <div class="input-row">
          <div class="form-group">
            <label class="form-label" for="rep-student">Select Enrolled Student *</label>
            <select class="form-select" id="rep-student" onchange="window.SchoolHubApp.handleReportStudentChange(this.value)" required>
              ${students.map((s) => `
                <option value="${s.id}">${s.name} (${s.studentClass || defaultClass}) &bull; ${s.admissionNumber || 'ADM/001'}</option>
              `).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="rep-term">Academic Term *</label>
            <select class="form-select" id="rep-term" required>
              <option value="1st Term">1st Term</option>
              <option value="2nd Term">2nd Term</option>
              <option value="3rd Term">3rd Term</option>
            </select>
          </div>
        </div>

        <div class="input-row">
          <div class="form-group">
            <label class="form-label" for="rep-session">Academic Session *</label>
            <input class="form-input" id="rep-session" type="text" value="2024/2025" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="rep-position">Class Position Rank *</label>
            <input class="form-input" id="rep-position" type="number" min="1" max="100" value="1" required />
          </div>
        </div>

        <h3 class="text-subheading" style="margin-top: 16px; margin-bottom: 10px;">Curriculum Subject Marks (0 - 100)</h3>
        <div style="max-height: 240px; overflow-y: auto; background: var(--c-surface2); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--c-border); margin-bottom: 16px;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th style="width: 110px;">Total (100)</th>
                <th style="width: 80px;">Grade</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              ${SUBJECT_LIST.map((sub, i) => {
                const defaultScore = 75;
                const { grade, remark } = calculateGrade(defaultScore);
                return `
                  <tr>
                    <td style="font-weight: 500;">${sub}</td>
                    <td>
                      <input class="form-input" id="score_${i}" type="number" min="0" max="100" value="${defaultScore}" oninput="window.SchoolHubApp.calculateReportRowScore(${i})" style="padding: 4px 8px;" />
                    </td>
                    <td><span id="grade_${i}" class="badge badge-academic">${grade}</span></td>
                    <td id="remark_${i}" style="font-size: 12px; color: var(--c-text-2);">${remark}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Real-time Live Summary Banner -->
        <div style="background: #E0F2FE; border: 1px solid #BAE6FD; border-radius: var(--radius-md); padding: 12px 18px; display: flex; justify-content: space-around; margin-bottom: 16px; font-size: 13px;">
          <div>Cumulative Total: <strong id="rep-live-total" style="color: #0369A1;">${SUBJECT_LIST.length * 75} / ${SUBJECT_LIST.length * 100}</strong></div>
          <div>Terminal Average: <strong id="rep-live-avg" style="color: #0369A1;">75.0%</strong></div>
          <div>Overall Performance: <strong id="rep-live-grade" style="color: #059669;">A1 (Distinction)</strong></div>
        </div>

        <div class="input-row">
          <div class="form-group">
            <label class="form-label" for="rep-teacher-comment">Class Teacher's Evaluative Comment *</label>
            <textarea class="form-textarea" id="rep-teacher-comment" required style="min-height: 70px;">An outstanding, diligent student with high academic and moral standard.</textarea>
          </div>
          <div class="form-group">
            <label class="form-label" for="rep-principal-comment">Principal's Formal Remark *</label>
            <textarea class="form-textarea" id="rep-principal-comment" required style="min-height: 70px;">Excellent terminal performance. Keep up the high standard of excellence.</textarea>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
          <button type="button" class="btn btn-ghost" onclick="window.SchoolHubApp.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" style="background: var(--c-admin);">
            Issue Official Result Card →
          </button>
        </div>
      </form>
    </div>
  `;
}

// -------------------------------------------------------------
// 7. Fee Schedule Configuration Modal
// -------------------------------------------------------------
export function buildFeeScheduleModalHtml(schoolId: string, defaultClass: StudentClass = 'SS1'): string {
  const store = Store.getInstance();
  const schedule = store.getFeeScheduleForClass(schoolId, defaultClass, '1st Term', '2024/2025');

  return `
    <div class="modal-card modal-lg">
      <button class="modal-close" onclick="window.SchoolHubApp.closeModal()">✕</button>

      <h2 class="text-heading" style="font-size: 20px; margin-bottom: 4px;">Configure Class Fee Schedule</h2>
      <p class="text-body" style="color: var(--c-text-2); margin-bottom: 20px;">
        Set term tuition amount, development levy, examination, and ICT lab charges for this cohort.
      </p>

      <form onsubmit="window.SchoolHubApp.handleSaveFeeSchedule(event, '${schoolId}')">
        <div class="input-row">
          <div class="form-group">
            <label class="form-label" for="sch-fee-class">Class Cohort *</label>
            <select class="form-select" id="sch-fee-class" onchange="window.SchoolHubApp.handleFeeScheduleClassChange(this.value, '${schoolId}')" required>
              ${ALL_CLASSES.map((cls) => `
                <option value="${cls}" ${defaultClass === cls ? 'selected' : ''}>${cls}</option>
              `).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="sch-fee-term">Academic Term *</label>
            <select class="form-select" id="sch-fee-term" required>
              <option value="1st Term">1st Term</option>
              <option value="2nd Term">2nd Term</option>
              <option value="3rd Term">3rd Term</option>
            </select>
          </div>
        </div>

        <div class="input-row">
          <div class="form-group">
            <label class="form-label" for="sch-fee-tuition">Tuition Fee (₦) *</label>
            <input class="form-input" id="sch-fee-tuition" type="number" min="0" value="${schedule?.tuitionFee || 75000}" oninput="window.SchoolHubApp.recalcFeeScheduleTotal()" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="sch-fee-dev">Development Levy (₦)</label>
            <input class="form-input" id="sch-fee-dev" type="number" min="0" value="${schedule?.developmentLevy || 15000}" oninput="window.SchoolHubApp.recalcFeeScheduleTotal()" />
          </div>
        </div>

        <div class="input-row">
          <div class="form-group">
            <label class="form-label" for="sch-fee-exam">Examination Fee (₦)</label>
            <input class="form-input" id="sch-fee-exam" type="number" min="0" value="${schedule?.examFee || 10000}" oninput="window.SchoolHubApp.recalcFeeScheduleTotal()" />
          </div>
          <div class="form-group">
            <label class="form-label" for="sch-fee-ict">ICT / Lab & Utilities (₦)</label>
            <input class="form-input" id="sch-fee-ict" type="number" min="0" value="${schedule?.ictFee || 10000}" oninput="window.SchoolHubApp.recalcFeeScheduleTotal()" />
          </div>
        </div>

        <div class="input-row">
          <div class="form-group">
            <label class="form-label" for="sch-fee-other">Other Incidental Charges (₦)</label>
            <input class="form-input" id="sch-fee-other" type="number" min="0" value="${schedule?.otherCharges || 10000}" oninput="window.SchoolHubApp.recalcFeeScheduleTotal()" />
          </div>
          <div class="form-group">
            <label class="form-label" for="sch-fee-total">Total Billed Fee (₦) *</label>
            <input class="form-input" id="sch-fee-total" type="number" value="${schedule?.totalAmount || 120000}" readonly style="font-weight: 800; background: #F8FAFC;" />
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
          <button type="button" class="btn btn-ghost" onclick="window.SchoolHubApp.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" style="background: var(--c-admin);">
            Save Fee Schedule
          </button>
        </div>
      </form>
    </div>
  `;
}

// -------------------------------------------------------------
// 8. Raw Subject Scores Ledger Modal
// -------------------------------------------------------------
export function buildSubjectScoresLedgerModalHtml(
  schoolId: string,
  resultClass: string,
  resultTerm: string,
  resultSession: string
): string {
  const store = Store.getInstance();
  const scores = store.getSubjectScores(schoolId, resultClass, undefined, resultTerm, resultSession);

  return `
    <div class="modal-card modal-lg">
      <button class="modal-close" onclick="window.SchoolHubApp.closeModal()">✕</button>

      <h2 class="text-heading" style="font-size: 22px; margin-bottom: 4px;">Subject Marks Ledger &bull; ${resultClass}</h2>
      <p class="text-body" style="color: var(--c-text-2); margin-bottom: 16px;">
        Term: <strong>${resultTerm}</strong> &bull; Session: <strong>${resultSession}</strong> &bull; ${scores.length} raw marks recorded by teachers
      </p>

      ${scores.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">📊</div>
          <p class="text-body" style="color: var(--c-text-2);">No subject scores entered yet for this class cohort.</p>
        </div>
      ` : `
        <div class="table-container" style="max-height: 380px; overflow-y: auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Subject</th>
                <th>CA 1 (20)</th>
                <th>CA 2 (20)</th>
                <th>CA (40)</th>
                <th>Exam (60)</th>
                <th>Total (100)</th>
                <th>Grade</th>
                <th>Teacher</th>
                <th>Recorded At</th>
              </tr>
            </thead>
            <tbody>
              ${scores.map((sc) => {
                const ca1 = sc.ca1Score !== undefined ? sc.ca1Score : Math.round(sc.score * 0.15);
                const ca2 = sc.ca2Score !== undefined ? sc.ca2Score : Math.round(sc.score * 0.15);
                const caTotal = sc.caScore !== undefined ? sc.caScore : (ca1 + ca2);
                const exam = sc.examScore !== undefined ? sc.examScore : (sc.score - caTotal);

                return `
                  <tr>
                    <td style="font-weight: 600;">${sc.studentName}</td>
                    <td><span class="badge badge-academic">${sc.subject}</span></td>
                    <td>${ca1}</td>
                    <td>${ca2}</td>
                    <td style="font-weight: 600; color: #0284C7;">${caTotal}</td>
                    <td>${exam}</td>
                    <td><strong>${sc.score}</strong></td>
                    <td><strong style="color: ${sc.grade === 'F9' ? '#DC2626' : '#059669'};">${sc.grade}</strong></td>
                    <td style="font-size: 12px; color: var(--c-text-2);">${sc.recordedByTeacherName || 'Teacher'}</td>
                    <td style="font-size: 11px; color: var(--c-text-3);">${new Date(sc.updatedAt).toLocaleDateString()}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `}

      <div style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center;">
        <button class="btn btn-ghost" onclick="window.SchoolHubApp.closeModal()">Close</button>
        <button
          class="btn btn-primary"
          onclick="window.SchoolHubApp.handleCompileTerminalResults('${resultClass}', '${resultTerm}', '${resultSession}'); window.SchoolHubApp.closeModal();"
          style="background: var(--c-admin);"
        >
          ⚙️ Compile Into Terminal Report Cards
        </button>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// 9. Auxiliary Utility Modals
// -------------------------------------------------------------
export function buildShareCodeModalHtml(schoolCode: string, schoolName: string): string {
  return `
    <div class="modal-card" style="text-align: center;">
      <button class="modal-close" onclick="window.SchoolHubApp.closeModal()">✕</button>

      <div style="font-size: 40px; margin-bottom: 12px;">🏫</div>
      <h2 class="text-heading" style="font-size: 22px; margin-bottom: 6px;">${schoolName}</h2>
      <p class="text-body" style="color: var(--c-text-2); margin-bottom: 20px;">
        Share this official school code with your teachers and students so they can join your institutional portal.
      </p>

      <div style="background: var(--c-surface2); border: 2px dashed var(--c-border2); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px;">
        <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--c-text-2); font-weight: 600; margin-bottom: 6px;">School Join Code</div>
        <div style="font-size: 36px; font-weight: 800; letter-spacing: 3px; color: #0369A1; font-family: monospace;">
          ${schoolCode}
        </div>
      </div>

      <div style="display: flex; gap: 12px;">
        <button class="btn btn-primary" onclick="window.SchoolHubApp.copyToClipboard('${schoolCode}', 'School code copied to clipboard!')" style="flex: 1; background: #0369A1;">
          📋 Copy School Code
        </button>
        <button class="btn btn-ghost" onclick="window.SchoolHubApp.closeModal()">
          Done
        </button>
      </div>
    </div>
  `;
}

export function buildEditTimetableModalHtml(
  schoolId: string,
  studentClass: string,
  day: string,
  period: number,
  currentSubject: string,
  currentRoom: string
): string {
  const store = Store.getInstance();
  const subjects = store.getRegistrySubjects(schoolId).filter((s) => s.status === 'active');

  return `
    <div class="modal-card">
      <button class="modal-close" onclick="window.SchoolHubApp.closeModal()">✕</button>

      <h2 class="text-heading" style="font-size: 20px; margin-bottom: 6px;">Configure Timetable Slot</h2>
      <p class="text-body" style="color: var(--c-text-2); margin-bottom: 20px;">
        ${studentClass} &bull; ${day} &bull; Period ${period + 1}
      </p>

      <form onsubmit="window.SchoolHubApp.handleSaveTimetableSlot(event, '${schoolId}', '${studentClass}', '${day}', ${period})">
        <div class="form-group">
          <label class="form-label" for="slot-subject">Subject *</label>
          <select class="form-select" id="slot-subject" required>
            ${subjects.map((sub) => `<option value="${sub.name}" ${currentSubject === sub.name ? 'selected' : ''}>${sub.name}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="slot-room">Classroom / Laboratory</label>
          <input class="form-input" id="slot-room" type="text" placeholder="e.g. Science Lab 2" value="${currentRoom || 'Room 201'}" required />
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 24px;">
          <button type="button" class="btn btn-danger btn-sm" onclick="window.SchoolHubApp.handleClearTimetableSlot('${schoolId}', '${studentClass}', '${day}', ${period})">
            Clear Cell
          </button>
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn btn-ghost" onclick="window.SchoolHubApp.closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary" style="background: var(--c-teach);">Save Slot</button>
          </div>
        </div>
      </form>
    </div>
  `;
}

export function buildSubmissionsModalHtml(assignment: Assignment, submissions: Submission[]): string {
  return `
    <div class="modal-card modal-lg">
      <button class="modal-close" onclick="window.SchoolHubApp.closeModal()">✕</button>

      <h2 class="text-heading" style="font-size: 20px; margin-bottom: 4px;">Submissions: ${assignment.title}</h2>
      <p class="text-body" style="color: var(--c-text-2); margin-bottom: 20px;">
        Class: ${assignment.studentClass} &bull; Subject: ${assignment.subject} &bull; Max Score: ${assignment.maxScore} pts
      </p>

      ${submissions.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <p class="text-body" style="color: var(--c-text-2);">No submissions received yet for this assignment.</p>
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${submissions.map((sub) => `
            <div style="border: 1px solid var(--c-border); border-radius: var(--radius-md); padding: 16px; background: var(--c-surface2);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <div>
                  <div style="font-weight: 600; font-size: 15px;">${sub.studentName}</div>
                  <div style="font-size: 11px; color: var(--c-text-3);">Submitted: ${new Date(sub.submittedAt).toLocaleString()}</div>
                </div>
                <div>
                  ${sub.score !== undefined ? `<span class="badge badge-academic">Score: ${sub.score} / ${assignment.maxScore}</span>` : '<span class="badge badge-urgent">Needs Grading</span>'}
                </div>
              </div>

              <div style="background: #FFFFFF; border: 1px solid var(--c-border); border-radius: var(--radius-sm); padding: 12px; font-size: 13px; color: var(--c-text-1); margin-bottom: 12px; white-space: pre-wrap;">
                ${sub.content}
              </div>

              <form onsubmit="window.SchoolHubApp.handleGradeSubmission(event, '${sub.id}', ${assignment.maxScore})" style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <label style="font-size: 12px; font-weight: 500;">Score:</label>
                  <input type="number" min="0" max="${assignment.maxScore}" name="grade_score" value="${sub.score !== undefined ? sub.score : ''}" class="form-input" style="width: 90px; padding: 6px;" placeholder="0-${assignment.maxScore}" required />
                </div>
                <div style="flex: 1; min-width: 200px;">
                  <input type="text" name="grade_feedback" value="${sub.feedback || ''}" class="form-input" placeholder="Feedback comment..." style="padding: 6px;" />
                </div>
                <button type="submit" class="btn btn-primary btn-sm" style="background: var(--c-teach);">
                  Record Grade
                </button>
              </form>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

export function buildSubmitAssignmentModalHtml(assignmentId: string, assignmentTitle: string): string {
  return `
    <div class="modal-card">
      <button class="modal-close" onclick="window.SchoolHubApp.closeModal()">✕</button>

      <h2 class="text-heading" style="font-size: 20px; margin-bottom: 6px;">Submit Assignment Work</h2>
      <p class="text-body" style="color: var(--c-text-2); margin-bottom: 20px;">
        ${assignmentTitle}
      </p>

      <form onsubmit="window.SchoolHubApp.handleSubmitAssignment(event, '${assignmentId}')">
        <div class="form-group">
          <label class="form-label" for="sub-answer">Your Work / Answer Text *</label>
          <textarea class="form-textarea" id="sub-answer" placeholder="Type or paste your completed assignment solution, workings, or essay here..." style="min-height: 160px;" required></textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
          <button type="button" class="btn btn-ghost" onclick="window.SchoolHubApp.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" style="background: var(--c-stud);">Submit Response →</button>
        </div>
      </form>
    </div>
  `;
}

export function buildUserDetailsModalHtml(user: User): string {
  return `
    <div class="modal-card">
      <button class="modal-close" onclick="window.SchoolHubApp.closeModal()">✕</button>

      <div style="font-size: 36px; margin-bottom: 12px;">👤</div>
      <h2 class="text-heading" style="font-size: 22px; margin-bottom: 4px;">${user.name}</h2>
      <span class="badge ${user.role === 'admin' ? 'badge-urgent' : user.role === 'teacher' ? 'badge-academic' : 'badge-event'}" style="margin-bottom: 16px;">
        ${user.role.toUpperCase()} ${user.teacherType ? `(${user.teacherType === 'class_teacher' ? 'Class Teacher' : 'Subject Teacher'})` : ''}
      </span>

      <div style="background: var(--c-surface2); border-radius: var(--radius-md); padding: 16px; text-align: left; display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
        <div><strong>Email:</strong> ${user.email}</div>
        <div><strong>School Code:</strong> <code>${user.schoolId}</code></div>
        ${user.admissionNumber ? `<div><strong>Admission No:</strong> ${user.admissionNumber}</div>` : ''}
        ${user.studentClass ? `<div><strong>Student Class:</strong> ${user.studentClass} ${user.department ? `(${user.department})` : ''}</div>` : ''}
        ${user.assignedClass ? `<div><strong>Assigned Form Class:</strong> ${user.assignedClass}</div>` : ''}
        ${user.assignedClasses && user.assignedClasses.length > 0 ? `<div><strong>Teaching Classes:</strong> ${user.assignedClasses.join(', ')}</div>` : ''}
        ${user.assignedSubjects && user.assignedSubjects.length > 0 ? `<div><strong>Assigned Subjects:</strong> ${user.assignedSubjects.join(', ')}</div>` : ''}
        <div><strong>Status:</strong> ${user.status}</div>
        <div><strong>Joined:</strong> ${new Date(user.joinedAt).toLocaleString()}</div>
      </div>

      <div style="margin-top: 20px; text-align: right;">
        <button class="btn btn-ghost" onclick="window.SchoolHubApp.closeModal()">Close</button>
      </div>
    </div>
  `;
}

export function buildSchoolDetailsModalHtml(school: School, users: User[]): string {
  const teachers = users.filter((u) => u.role === 'teacher');
  const students = users.filter((u) => u.role === 'student');

  return `
    <div class="modal-card modal-lg">
      <button class="modal-close" onclick="window.SchoolHubApp.closeModal()">✕</button>

      <h2 class="text-heading" style="font-size: 22px; margin-bottom: 4px;">${school.name}</h2>
      <p class="text-body" style="color: var(--c-text-2); margin-bottom: 16px;">
        Code: <strong>${school.code}</strong> &bull; ${school.state} State &bull; ${school.type} (${school.level})
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
        <div style="padding: 12px; background: #E0F2FE; border-radius: var(--radius-md); text-align: center;">
          <div style="font-size: 12px; color: #0369A1; font-weight: 600;">TEACHERS ENROLLED</div>
          <div style="font-size: 22px; font-weight: 700; color: #0369A1;">${teachers.length}</div>
        </div>
        <div style="padding: 12px; background: #EDE9FE; border-radius: var(--radius-md); text-align: center;">
          <div style="font-size: 12px; color: #7C3AED; font-weight: 600;">STUDENTS ENROLLED</div>
          <div style="font-size: 22px; font-weight: 700; color: #7C3AED;">${students.length}</div>
        </div>
      </div>

      <h3 class="text-subheading" style="margin-bottom: 10px;">Registered Users</h3>
      <div class="table-container" style="max-height: 240px; overflow-y: auto;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Class / Department</th>
            </tr>
          </thead>
          <tbody>
            ${users.map((u) => `
              <tr>
                <td style="font-weight: 500;">${u.name}</td>
                <td style="color: var(--c-text-2);">${u.email}</td>
                <td><span class="badge ${u.role === 'admin' ? 'badge-urgent' : u.role === 'teacher' ? 'badge-academic' : 'badge-event'}">${u.role}</span></td>
                <td>${u.studentClass ? `${u.studentClass} ${u.department ? `(${u.department})` : ''}` : u.assignedClass || u.specialty || '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div style="margin-top: 20px; text-align: right;">
        <button class="btn btn-ghost" onclick="window.SchoolHubApp.closeModal()">Close</button>
      </div>
    </div>
  `;
}

export function buildConfirmModalHtml(title: string, message: string, actionFnName: string): string {
  return `
    <div class="modal-card">
      <button class="modal-close" onclick="window.SchoolHubApp.closeModal()">✕</button>

      <div style="font-size: 36px; color: #DC2626; margin-bottom: 12px;">⚠️</div>
      <h2 class="text-heading" style="font-size: 20px; margin-bottom: 8px;">${title}</h2>
      <p class="text-body" style="color: var(--c-text-2); margin-bottom: 24px;">
        ${message}
      </p>

      <div style="display: flex; justify-content: flex-end; gap: 12px;">
        <button class="btn btn-ghost" onclick="window.SchoolHubApp.closeModal()">Cancel</button>
        <button class="btn btn-danger" onclick="window.SchoolHubApp.${actionFnName}()">Confirm Action</button>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// 17. School Onboarding & Per-School Invite Links Management Modal
// -------------------------------------------------------------
export function buildSchoolInvitesModalHtml(school: School, invites: SchoolInvite[], store: Store): string {
  const publicRegUrl = `${window.location.origin}${window.location.pathname}#register-school`;
  const pendingUsers = store.getPendingUsers(school.id);

  return `
    <div class="modal-card modal-lg" style="max-width: 860px; max-height: 90vh; overflow-y: auto;">
      <button class="modal-close" onclick="window.SchoolHubApp.closeModal()">✕</button>

      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
        <span style="font-size: 28px;">🔗</span>
        <div>
          <h2 class="text-heading" style="font-size: 22px; margin: 0;">Onboarding & Invite Links</h2>
          <p class="text-body" style="color: var(--c-text-2); font-size: 13px; margin: 2px 0 0 0;">
            Manage shareable onboarding links for <strong>${school.name}</strong> (Code: <code>${school.code}</code>)
          </p>
        </div>
      </div>

      <!-- PART 1: Public "Register Your School" Link Banner -->
      <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: var(--radius-md); padding: 14px 16px; margin: 16px 0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="flex: 1; min-width: 260px;">
          <div style="font-size: 11px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">
            PART 1 &bull; Public Institutional Sign-up Link
          </div>
          <div style="font-size: 13px; font-weight: 600; color: #14532D;">
            Public "Register Your School" Link
          </div>
          <div style="font-size: 12px; color: #166534; margin-top: 2px; word-break: break-all;">
            <code>${publicRegUrl}</code>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" style="background: #16A34A;" onclick="window.SchoolHubApp.copyToClipboard('${publicRegUrl}', 'Public School Registration Link copied to clipboard!')">
          📋 Copy Public Link
        </button>
      </div>

      <!-- PART 2: Generate New Per-School Invite Link -->
      <div class="card" style="background: #F8FAFC; border: 1px solid var(--c-border); margin-bottom: 20px; padding: 18px;">
        <div style="font-size: 13px; font-weight: 700; color: #0369A1; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
          <span>✨</span> Generate New Per-School Invite Link
        </div>

        <form id="form-generate-invite" onsubmit="window.SchoolHubApp.handleGenerateInviteSubmit(event, '${school.id}')">
          <div style="display: grid; grid-template-columns: 1fr 1.4fr 1fr 1fr; gap: 12px; align-items: flex-end;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" for="new-inv-role" style="font-size: 12px;">Invite Target Role *</label>
              <select class="form-select" id="new-inv-role" required style="font-size: 13px;">
                <option value="teacher" selected>👨‍🏫 Teacher / Faculty</option>
                <option value="student">🎓 Student Learner</option>
              </select>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" for="new-inv-label" style="font-size: 12px;">Label / Purpose</label>
              <input class="form-input" id="new-inv-label" type="text" placeholder="e.g. Term 1 Faculty Recruitment" style="font-size: 13px;" />
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" for="new-inv-expiry" style="font-size: 12px;">Expiration</label>
              <select class="form-select" id="new-inv-expiry" style="font-size: 13px;">
                <option value="7" selected>7 Days (Default)</option>
                <option value="1">24 Hours</option>
                <option value="14">14 Days</option>
                <option value="30">30 Days</option>
                <option value="0">Never (No Expiry)</option>
              </select>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" for="new-inv-max" style="font-size: 12px;">Usage Limit</label>
              <select class="form-select" id="new-inv-max" style="font-size: 13px;">
                <option value="0" selected>Unlimited Uses</option>
                <option value="1">1 Person (Single-use)</option>
                <option value="5">5 Signups</option>
                <option value="10">10 Signups</option>
                <option value="25">25 Signups</option>
                <option value="50">50 Signups</option>
              </select>
            </div>
          </div>

          <div style="margin-top: 14px; display: flex; justify-content: flex-end;">
            <button type="submit" class="btn btn-primary" id="btn-create-invite" style="background: #0369A1; font-size: 13px; font-weight: 600;">
              + Generate Secure Invite Link
            </button>
          </div>
        </form>
      </div>

      <!-- Existing Generated Invites -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h3 class="text-subheading" style="font-size: 15px; margin: 0;">Generated School Invite Links (${invites.length})</h3>
        <span style="font-size: 12px; color: var(--c-text-3);">Unique to ${school.name} &bull; Cannot be spoofed</span>
      </div>

      ${invites.length === 0 ? `
        <div class="empty-state" style="padding: 24px; border: 1px dashed var(--c-border); border-radius: 8px;">
          <div style="font-size: 32px; margin-bottom: 6px;">✉️</div>
          <div style="font-weight: 600; font-size: 14px; color: var(--c-text-1);">No invite links generated yet</div>
          <p style="font-size: 12px; color: var(--c-text-2); margin-top: 4px;">
            Use the form above to generate a Teacher or Student onboarding link with custom expiration and limits.
          </p>
        </div>
      ` : `
        <div class="table-container" style="max-height: 280px; overflow-y: auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Target</th>
                <th>Label / Token</th>
                <th>Usage</th>
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
                      <div style="font-family: monospace; font-size: 11px; color: var(--c-text-3);">${inv.token.substring(0, 16)}...</div>
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
                        <button class="btn btn-primary btn-sm" style="font-size: 11px; padding: 4px 8px; background: #0369A1;" onclick="window.SchoolHubApp.copyToClipboard('${inviteUrl}', 'School Invite link copied!')" ${!isActive ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
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

      <!-- Pending Approvals Alert if any -->
      ${pendingUsers.length > 0 ? `
        <div style="background: #FEF3C7; border: 1px solid #FCD34D; border-radius: var(--radius-md); padding: 12px 16px; margin-top: 18px; display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 13px; color: #92400E;">
            <strong>⏳ ${pendingUsers.length} Pending Approval(s):</strong> Teachers/students who joined via invite links are waiting for review.
          </div>
          <button class="btn btn-primary btn-sm" style="background: #D97706;" onclick="window.SchoolHubApp.closeModal(); window.SchoolHubApp.setSchoolAdminTab('teachers');">
            Review Approvals →
          </button>
        </div>
      ` : ''}

      <div style="margin-top: 24px; text-align: right;">
        <button class="btn btn-ghost" onclick="window.SchoolHubApp.closeModal()">Done</button>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// 18. Pending Approvals Review Modal
// -------------------------------------------------------------
export function buildPendingApprovalsModalHtml(school: School, pendingUsers: User[], store: Store): string {
  return `
    <div class="modal-card modal-lg" style="max-width: 800px;">
      <button class="modal-close" onclick="window.SchoolHubApp.closeModal()">✕</button>

      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
        <span style="font-size: 28px;">⏳</span>
        <div>
          <h2 class="text-heading" style="font-size: 22px; margin: 0;">Pending Registrations (${pendingUsers.length})</h2>
          <p class="text-body" style="color: var(--c-text-2); font-size: 13px; margin: 2px 0 0 0;">
            Review new teacher and student signups from invite links before granting full platform access.
          </p>
        </div>
      </div>

      ${pendingUsers.length === 0 ? `
        <div class="empty-state" style="padding: 36px 20px;">
          <div style="font-size: 40px; margin-bottom: 10px;">✓</div>
          <div style="font-weight: 600; font-size: 16px;">All registrations approved!</div>
          <p style="font-size: 13px; color: var(--c-text-2); margin-top: 4px;">
            There are no pending teacher or student account requests at this time.
          </p>
        </div>
      ` : `
        <div class="table-container" style="max-height: 380px; overflow-y: auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Role Applied</th>
                <th>Assigned Subjects / Class</th>
                <th>Contact Phone</th>
                <th>Date Applied</th>
                <th style="text-align: right;">Approval Action</th>
              </tr>
            </thead>
            <tbody>
              ${pendingUsers.map((u) => `
                <tr>
                  <td>
                    <div style="font-weight: 600; color: #0F172A;">${u.name}</div>
                    <div style="font-size: 12px; color: var(--c-text-2);">${u.email}</div>
                  </td>
                  <td>
                    <span class="badge ${u.role === 'teacher' ? 'badge-academic' : 'badge-event'}">
                      ${u.role === 'teacher' ? 'Subject Teacher' : 'Student'}
                    </span>
                  </td>
                  <td style="font-size: 12px;">
                    ${u.role === 'teacher'
                      ? `<div><strong>Specialty:</strong> ${u.specialty || 'General'}</div>
                         <div style="color: var(--c-text-3); font-size: 11px;">${(u.assignedSubjects || []).join(', ') || 'None selected'}</div>`
                      : `<div>Class: <strong>${u.studentClass || '—'}</strong> ${u.department ? `(${u.department})` : ''}</div>`
                    }
                  </td>
                  <td style="font-size: 12px;">${u.phone || '—'}</td>
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
      `}

      <div style="margin-top: 20px; text-align: right;">
        <button class="btn btn-ghost" onclick="window.SchoolHubApp.closeModal()">Close</button>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// 19. Real Email Dispatch Diagnostics & Test Console Modal
// -------------------------------------------------------------
export function buildEmailTesterModalHtml(userEmail?: string): string {
  const targetEmail = userEmail || 'elcrest9@gmail.com';

  return `
    <div class="modal-card modal-lg" style="max-width: 680px;">
      <button class="modal-close" onclick="window.SchoolHubApp.closeModal()">✕</button>

      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
        <div style="width: 44px; height: 44px; border-radius: 10px; background: #E0F2FE; color: #0369A1; display: flex; align-items: center; justify-content: center; font-size: 24px;">
          ✉️
        </div>
        <div>
          <h2 class="text-heading" style="font-size: 20px; margin: 0;">Email Dispatch Diagnostics</h2>
          <p class="text-body" style="color: var(--c-text-2); font-size: 13px; margin: 2px 0 0 0;">
            Verify live connection with the Resend email delivery backend.
          </p>
        </div>
      </div>

      <!-- Provider Status Card -->
      <div id="email-status-banner" style="background: #F8FAFC; border: 1px solid var(--c-border); border-radius: var(--radius-md); padding: 14px 16px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: var(--c-text-3); text-transform: uppercase; letter-spacing: 0.5px;">Service Provider</span>
          <span id="email-config-badge" class="badge badge-academic">Checking Status...</span>
        </div>
        <div style="font-size: 13px; color: var(--c-text-1);">
          <strong>Provider:</strong> Resend API &bull; <strong>Sender:</strong> <code id="email-sender-display">SchoolHub &lt;onboarding@resend.dev&gt;</code>
        </div>
        <div id="email-status-hint" style="font-size: 12px; color: var(--c-text-2); margin-top: 4px;">
          Loading provider configuration...
        </div>
      </div>

      <!-- Quick API Key Configuration Accordion / Panel -->
      <div style="background: #F0F9FF; border: 1px solid #BAE6FD; border-radius: var(--radius-md); padding: 14px 16px; margin-bottom: 18px;">
        <div style="font-size: 12px; font-weight: 700; color: #0369A1; text-transform: uppercase; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          <span>🔑</span> Configure Resend API Key
        </div>
        <div style="font-size: 12px; color: #334155; margin-bottom: 10px;">
          Enter your API key from <a href="https://resend.com/api-keys" target="_blank" style="color: #0369A1; font-weight: 600; text-decoration: underline;">resend.com</a> to enable real email delivery across all features:
        </div>
        <div style="display: flex; gap: 8px;">
          <input
            class="form-input"
            id="cfg-resend-api-key"
            type="password"
            placeholder="re_123456789abcdef..."
            style="flex: 1; font-family: monospace; font-size: 13px; background: #FFFFFF;"
          />
          <button
            type="button"
            class="btn btn-primary"
            id="btn-save-email-cfg"
            onclick="window.SchoolHubApp.handleSaveEmailApiKey()"
            style="background: #0369A1; font-size: 13px; padding: 8px 16px; white-space: nowrap;"
          >
            💾 Save Key
          </button>
        </div>
        <div id="email-cfg-status" style="font-size: 11px; margin-top: 6px; display: none;"></div>
      </div>

      <!-- Test Send Form -->
      <form id="form-send-test-email" onsubmit="window.SchoolHubApp.handleSendTestEmailSubmit(event)">
        <div class="form-group">
          <label class="form-label" for="test-email-target" style="font-weight: 600;">Destination Recipient Email *</label>
          <input
            class="form-input"
            id="test-email-target"
            type="email"
            value="${targetEmail}"
            placeholder="e.g. elcrest9@gmail.com"
            required
            style="font-size: 14px;"
          />
          <span style="font-size: 11px; color: var(--c-text-3); margin-top: 4px; display: block;">
            Tip: In Resend free test mode, emails are delivered directly to the email address registered on your Resend account.
          </span>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight: 600;">Subject Line</label>
          <input
            class="form-input"
            id="test-email-subject"
            type="text"
            value="Test Email — Setup Successful (SchoolHub)"
            readonly
            style="background: #F1F5F9; color: #475569; font-size: 13px;"
          />
        </div>

        <!-- Result Console Target -->
        <div id="test-email-result" style="display: none; margin-top: 14px; padding: 14px; border-radius: var(--radius-md); font-size: 13px;"></div>

        <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end; align-items: center;">
          <button type="button" class="btn btn-ghost" onclick="window.SchoolHubApp.closeModal()">Close</button>
          <button type="submit" id="btn-dispatch-test-email" class="btn btn-primary" style="background: #0369A1; font-weight: 600;">
            🚀 Dispatch Test Email
          </button>
        </div>
      </form>
    </div>
  `;
}

