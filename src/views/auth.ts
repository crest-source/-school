import { NIGERIAN_STATES } from '../seed';
import { School, SchoolInvite, RegistrySubject, Department, StudentClass } from '../types';
import { Store } from '../store';

export function renderRegisterSchool(): string {
  const statesOptions = NIGERIAN_STATES.map((st) => `<option value="${st}" ${st === 'Lagos' ? 'selected' : ''}>${st}</option>`).join('');

  return `
    <div class="auth-split-wrapper">
      <div class="auth-brand-side" style="background: #0369A1;">
        <div>
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 32px; cursor: pointer;" onclick="window.location.hash = ''">
            <span style="font-size: 32px;">🎓</span>
            <span style="font-size: 24px; font-weight: 700;">SchoolHub</span>
          </div>
          <div style="display: inline-block; background: rgba(255, 255, 255, 0.15); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 16px; letter-spacing: 0.5px;">
            PUBLIC ONBOARDING PORTAL
          </div>
          <h2 class="text-display" style="color: #FFFFFF; font-size: 28px; margin-bottom: 16px;">
            Empower your institution with modern school management.
          </h2>
          <p style="color: rgba(255, 255, 255, 0.85); font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            Create your administrative hub in under 2 minutes. On registration, your school is issued a unique institutional ID, instant admin portal, and shareable teacher/student invite links.
          </p>

          <div style="background: rgba(0, 0, 0, 0.2); border-radius: 12px; padding: 16px; border: 1px solid rgba(255, 255, 255, 0.15);">
            <div style="font-weight: 600; font-size: 13px; margin-bottom: 8px;">✨ What happens after registration:</div>
            <ul style="font-size: 12px; opacity: 0.9; line-height: 1.6; margin: 0; padding-left: 18px;">
              <li>Instant access to School Admin Dashboard</li>
              <li>Pre-configured Nigerian Junior & Senior curriculum registry</li>
              <li>Ability to generate shareable teacher and student invite links</li>
              <li>Complete bursary ledger and terminal result compiler</li>
            </ul>
          </div>
        </div>
        <div style="font-size: 13px; color: rgba(255, 255, 255, 0.7); margin-top: 24px;">
          Need help? <a href="mailto:support@schoolhub.ng" style="color: #FFFFFF; text-decoration: underline;">Contact Onboarding Desk</a>
        </div>
      </div>

      <div class="auth-form-side" style="max-height: 92vh; overflow-y: auto;">
        <div style="margin-bottom: 20px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <h1 class="text-heading" style="font-size: 24px; margin: 0;">Register Your School</h1>
            <span class="badge" style="background: #E0F2FE; color: #0369A1; font-size: 11px; font-weight: 600;">Step 1 of 1</span>
          </div>
          <p class="text-body" style="color: var(--c-text-2); font-size: 13px;">Fill in your school and administrator credentials to launch your portal.</p>
        </div>

        <form id="form-register-school" onsubmit="window.SchoolHubApp.handleRegisterSchool(event)">
          <!-- SECTION 1: School Profile -->
          <div style="font-size: 12px; font-weight: 700; color: #0369A1; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
            <span>🏫</span> School Information
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-sch-name">School Name *</label>
            <input class="form-input" id="reg-sch-name" type="text" placeholder="e.g. King's College Lagos" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-sch-address">School Address *</label>
            <input class="form-input" id="reg-sch-address" type="text" placeholder="e.g. 3 Catholic Mission Street, Lagos Island, Lagos" required />
          </div>

          <div class="input-row">
            <div class="form-group">
              <label class="form-label" for="reg-sch-govnum">Govt Approval / Reg No. (Optional)</label>
              <input class="form-input" id="reg-sch-govnum" type="text" placeholder="e.g. MOE/ED/LAG/2019/8492" />
            </div>
            <div class="form-group">
              <label class="form-label" for="reg-sch-state">State / Region *</label>
              <select class="form-select" id="reg-sch-state" required>
                ${statesOptions}
              </select>
            </div>
          </div>

          <div class="input-row">
            <div class="form-group">
              <label class="form-label" for="reg-sch-type">School Type *</label>
              <select class="form-select" id="reg-sch-type" required>
                <option value="Private">Private</option>
                <option value="Public">Public</option>
                <option value="Federal Government">Federal Government</option>
                <option value="State Government">State Government</option>
                <option value="Mission School">Mission School</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="reg-sch-level">School Level *</label>
              <select class="form-select" id="reg-sch-level" required>
                <option value="JSS & SSS">JSS & SSS</option>
                <option value="JSS Only">JSS Only</option>
                <option value="SSS Only">SSS Only</option>
                <option value="Primary & Secondary">Primary & Secondary</option>
              </select>
            </div>
          </div>

          <div class="input-row">
            <div class="form-group">
              <label class="form-label" for="reg-sch-email">Official School Email *</label>
              <input class="form-input" id="reg-sch-email" type="email" placeholder="info@kingscollege.edu.ng" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="reg-sch-phone">School Phone Number *</label>
              <input class="form-input" id="reg-sch-phone" type="tel" placeholder="e.g. 08023456789" required />
            </div>
          </div>

          <!-- School Logo Upload -->
          <div class="form-group">
            <label class="form-label" for="reg-sch-logo">School Crest / Logo (Optional)</label>
            <div style="display: flex; align-items: center; gap: 14px;">
              <div id="sch-logo-preview-box" style="width: 52px; height: 52px; border-radius: 8px; border: 1px dashed var(--c-border); display: flex; align-items: center; justify-content: center; font-size: 24px; background: var(--c-bg-subtle); overflow: hidden; flex-shrink: 0;">
                🏫
              </div>
              <div style="flex: 1;">
                <input class="form-input" id="reg-sch-logo-file" type="file" accept="image/*" onchange="window.SchoolHubApp.handleLogoUpload(event)" style="font-size: 12px; padding: 6px;" />
                <input type="hidden" id="reg-sch-logo-base64" value="" />
                <div style="font-size: 11px; color: var(--c-text-3); margin-top: 4px;">PNG, JPG, or SVG up to 2MB. Displayed on report cards and portals.</div>
              </div>
            </div>
          </div>

          <!-- SECTION 2: Administrator Account -->
          <div style="border-top: 1px solid var(--c-border); margin: 20px 0 16px; padding-top: 16px;">
            <div style="font-size: 12px; font-weight: 700; color: #0369A1; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
              <span>👤</span> Administrator Account (Primary Manager)
            </div>
            
            <div class="input-row">
              <div class="form-group">
                <label class="form-label" for="reg-adm-name">Admin Full Name *</label>
                <input class="form-input" id="reg-adm-name" type="text" placeholder="e.g. Dr. Emeka Obi" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="reg-adm-phone">Admin Mobile Phone *</label>
                <input class="form-input" id="reg-adm-phone" type="tel" placeholder="e.g. 08012345678" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-adm-email">Admin Login Email *</label>
              <input class="form-input" id="reg-adm-email" type="email" placeholder="admin@kingscollege.edu.ng" required />
              <div style="font-size: 11px; color: var(--c-text-3); margin-top: 3px;">You will use this email to sign in to the School Admin dashboard.</div>
            </div>

            <div class="input-row">
              <div class="form-group">
                <label class="form-label" for="reg-adm-password">Admin Password *</label>
                <input class="form-input" id="reg-adm-password" type="password" placeholder="Min. 6 characters" minlength="6" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="reg-adm-confirm">Confirm Password *</label>
                <input class="form-input" id="reg-adm-confirm" type="password" placeholder="Re-type password" minlength="6" required />
              </div>
            </div>
          </div>

          <button type="submit" class="btn btn-primary" id="btn-submit-register-sch" style="width: 100%; padding: 13px; background: #0369A1; margin-top: 8px; font-size: 15px; font-weight: 600;">
            Register School & Launch Dashboard →
          </button>
        </form>

        <div style="margin-top: 20px; text-align: center; font-size: 13px; color: var(--c-text-2);">
          Already registered? <a href="#login" style="color: #0369A1; font-weight: 600;">Sign in to your portal</a>
        </div>
      </div>
    </div>
  `;
}

export function renderJoinSchool(invite: SchoolInvite, school: School, store: Store): string {
  const isTeacher = invite.role === 'teacher';
  const brandBg = isTeacher ? '#0F766E' : '#2563EB';
  const roleName = isTeacher ? 'Teacher / Faculty' : 'Student';
  const subjects = store.getRegistrySubjects(school.id).filter((s) => s.status === 'active');
  const classesList: StudentClass[] = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'];

  return `
    <div class="auth-split-wrapper">
      <div class="auth-brand-side" style="background: ${brandBg};">
        <div>
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px; cursor: pointer;" onclick="window.location.hash = ''">
            ${school.logoUrl ? `<img src="${school.logoUrl}" style="width: 38px; height: 38px; border-radius: 8px; object-fit: cover; background: #fff;" />` : '<span style="font-size: 32px;">🎓</span>'}
            <div>
              <div style="font-size: 18px; font-weight: 700; color: #FFFFFF;">${school.name}</div>
              <div style="font-size: 12px; opacity: 0.85;">Code: ${school.code} • ${school.state}</div>
            </div>
          </div>

          <div style="display: inline-block; background: rgba(255, 255, 255, 0.18); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 16px;">
            OFFICIAL ${roleName.toUpperCase()} INVITATION
          </div>

          <h2 class="text-display" style="color: #FFFFFF; font-size: 26px; margin-bottom: 14px;">
            ${isTeacher ? 'Join our academic faculty.' : 'Welcome to your student portal.'}
          </h2>
          <p style="color: rgba(255, 255, 255, 0.9); font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            ${isTeacher
              ? `You have received a secure faculty onboarding link to register as a teacher at <strong>${school.name}</strong>. Complete your subject specialties below.`
              : `You are registering for student access at <strong>${school.name}</strong>. Select your current academic class cohort.`
            }
          </p>

          <div style="background: rgba(0, 0, 0, 0.2); border-radius: 12px; padding: 16px; border: 1px solid rgba(255, 255, 255, 0.15); font-size: 13px;">
            <div style="font-weight: 600; margin-bottom: 6px;">🔒 Institutional Verification:</div>
            <div style="opacity: 0.9; line-height: 1.5;">
              ${isTeacher
                ? 'For school integrity, accounts registered via invite links start in <strong>Pending Admin Review</strong>. Once confirmed by the administrator, you will gain full classroom and assessment access.'
                : 'Your student enrollment will be linked to your class registry and verified by the school administration.'
              }
            </div>
          </div>
        </div>

        <div style="font-size: 12px; color: rgba(255, 255, 255, 0.7); margin-top: 24px;">
          Invite token: <code style="background: rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 4px;">${invite.token}</code>
        </div>
      </div>

      <div class="auth-form-side" style="max-height: 92vh; overflow-y: auto;">
        <div style="margin-bottom: 20px;">
          <h1 class="text-heading" style="font-size: 22px; margin-bottom: 4px;">
            ${isTeacher ? 'Faculty Account Setup' : 'Student Enrollment Setup'}
          </h1>
          <p class="text-body" style="color: var(--c-text-2); font-size: 13px;">
            Registering for <strong>${school.name}</strong> (${school.code})
          </p>
        </div>

        <form id="form-join-school" onsubmit="window.SchoolHubApp.handleJoinSchoolSubmit(event, '${invite.schoolId}', '${invite.token}')">
          <div class="form-group">
            <label class="form-label" for="join-usr-name">Full Name *</label>
            <input class="form-input" id="join-usr-name" type="text" placeholder="${isTeacher ? 'e.g. Mr. Babatunde Alabi' : 'e.g. Chukwuemeka Obi'}" required autofocus />
          </div>

          <div class="input-row">
            <div class="form-group">
              <label class="form-label" for="join-usr-email">Email Address *</label>
              <input class="form-input" id="join-usr-email" type="email" placeholder="name@domain.com" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="join-usr-phone">Phone Number *</label>
              <input class="form-input" id="join-usr-phone" type="tel" placeholder="e.g. 08031234567" required />
            </div>
          </div>

          <div class="input-row">
            <div class="form-group">
              <label class="form-label" for="join-usr-password">Password *</label>
              <input class="form-input" id="join-usr-password" type="password" placeholder="Min. 6 characters" minlength="6" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="join-usr-confirm">Confirm Password *</label>
              <input class="form-input" id="join-usr-confirm" type="password" placeholder="Confirm password" minlength="6" required />
            </div>
          </div>

          ${isTeacher ? `
            <!-- Teacher Specific Fields -->
            <div style="border-top: 1px solid var(--c-border); margin: 18px 0 14px; padding-top: 14px;">
              <div style="font-size: 12px; font-weight: 700; color: #0F766E; text-transform: uppercase; margin-bottom: 10px;">
                📚 Teaching Assignment & Subjects
              </div>

              <div class="form-group">
                <label class="form-label" for="join-teacher-specialty">Primary Subject Specialty *</label>
                <select class="form-select" id="join-teacher-specialty" required>
                  ${subjects.map((sub) => `<option value="${sub.name}">${sub.name} (${sub.code})</option>`).join('')}
                  <option value="General Science">General Science</option>
                  <option value="Humanities">Humanities</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Select Subjects You Teach at ${school.name}:</label>
                <div style="max-height: 160px; overflow-y: auto; border: 1px solid var(--c-border); border-radius: 8px; padding: 10px; background: var(--c-bg-subtle); display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 6px;">
                  ${subjects.map((sub) => `
                    <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer; padding: 3px 0;">
                      <input type="checkbox" class="join-assigned-sub" value="${sub.name}" style="accent-color: #0F766E;" />
                      <span>${sub.name} <span style="color: var(--c-text-3);">(${sub.code})</span></span>
                    </label>
                  `).join('')}
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Teaching Class Levels:</label>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                  ${classesList.map((c) => `
                    <label style="display: flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; background: var(--c-bg-subtle); padding: 6px 12px; border-radius: 6px; border: 1px solid var(--c-border);">
                      <input type="checkbox" class="join-assigned-class" value="${c}" style="accent-color: #0F766E;" />
                      <strong>${c}</strong>
                    </label>
                  `).join('')}
                </div>
              </div>
            </div>
          ` : `
            <!-- Student Specific Fields -->
            <div style="border-top: 1px solid var(--c-border); margin: 18px 0 14px; padding-top: 14px;">
              <div style="font-size: 12px; font-weight: 700; color: #2563EB; text-transform: uppercase; margin-bottom: 10px;">
                🎓 Academic Placement
              </div>

              <div class="input-row">
                <div class="form-group">
                  <label class="form-label" for="join-stud-class">Enrolling Class *</label>
                  <select class="form-select" id="join-stud-class" onchange="window.SchoolHubApp.handleJoinStudentClassChange(this.value)" required>
                    <option value="JSS1">JSS1</option>
                    <option value="JSS2">JSS2</option>
                    <option value="JSS3">JSS3</option>
                    <option value="SS1">SS1</option>
                    <option value="SS2" selected>SS2</option>
                    <option value="SS3">SS3</option>
                  </select>
                </div>
                <div class="form-group" id="join-dept-group">
                  <label class="form-label" for="join-stud-dept">Senior Department (SS1-SS3)</label>
                  <select class="form-select" id="join-stud-dept">
                    <option value="Science">Science</option>
                    <option value="Arts">Arts / Humanities</option>
                    <option value="Commercial">Commercial / Business</option>
                  </select>
                </div>
              </div>
            </div>
          `}

          <button type="submit" class="btn btn-primary" id="btn-submit-join-school" style="width: 100%; padding: 13px; background: ${brandBg}; margin-top: 10px; font-size: 14px; font-weight: 600;">
            ${isTeacher ? 'Submit Faculty Registration →' : 'Submit Student Enrollment →'}
          </button>
        </form>

        <div style="margin-top: 18px; text-align: center; font-size: 13px; color: var(--c-text-2);">
          Already have an active account? <a href="#login" style="color: ${brandBg}; font-weight: 600;">Sign in here</a>
        </div>
      </div>
    </div>
  `;
}

export function renderInvalidInvite(reason: string, invite?: SchoolInvite): string {
  return `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; background: var(--c-bg);">
      <div class="card fade-in" style="max-width: 480px; width: 100%; text-align: center; padding: 40px 30px; box-shadow: var(--shadow-lg);">
        <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
        <h1 class="text-heading" style="font-size: 24px; margin-bottom: 10px; color: #DC2626;">
          Invitation Link Not Available
        </h1>
        <p class="text-body" style="color: var(--c-text-2); font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          ${reason}
        </p>

        <div style="background: var(--c-bg-subtle); border-radius: 8px; padding: 14px; margin-bottom: 24px; text-align: left; font-size: 13px; border-left: 4px solid #DC2626;">
          <div style="font-weight: 600; margin-bottom: 4px;">What should you do?</div>
          <div style="color: var(--c-text-2);">
            • Request a renewed invitation link from your School Administrator.<br/>
            • If you have the school's standard 6-character school code, you can register directly.
          </div>
        </div>

        <div style="display: flex; gap: 10px; justify-content: center;">
          <button class="btn btn-secondary" onclick="window.location.hash = '#login'">
            Go to Sign In
          </button>
          <button class="btn btn-primary" onclick="window.location.hash = '#register-user'" style="background: #0369A1;">
            Join with School Code
          </button>
        </div>
      </div>
    </div>
  `;
}

export function renderJoinSuccess(school: School, role: 'teacher' | 'student', userName: string): string {
  const isTeacher = role === 'teacher';

  return `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; background: var(--c-bg);">
      <div class="card fade-in" style="max-width: 500px; width: 100%; text-align: center; padding: 40px 32px; box-shadow: var(--shadow-lg);">
        <div style="font-size: 52px; margin-bottom: 16px;">🎉</div>
        <h1 class="text-heading" style="font-size: 24px; margin-bottom: 8px; color: #059669;">
          Registration Received!
        </h1>
        <p class="text-body" style="color: var(--c-text-1); font-size: 15px; margin-bottom: 16px;">
          Welcome aboard, <strong>${userName}</strong>!
        </p>
        <p class="text-body" style="color: var(--c-text-2); font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          Your profile for <strong>${school.name}</strong> (${school.code}) has been submitted successfully.
        </p>

        <div style="background: #FEF3C7; border: 1px solid #FCD34D; border-radius: 10px; padding: 16px; margin-bottom: 24px; text-align: left; font-size: 13px; color: #92400E;">
          <div style="font-weight: 700; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
            <span>⏳</span> Awaiting Administrator Approval
          </div>
          <div>
            ${isTeacher
              ? 'To protect school data, teacher accounts must be confirmed by the School Administrator. Once approved, you can log in with full teacher privileges to enter marks and create assignments.'
              : 'Your student enrollment record has been queued for verification by the School Administrator or Class Teacher.'
            }
          </div>
        </div>

        <button class="btn btn-primary" onclick="window.location.hash = '#login'" style="width: 100%; padding: 12px; background: #0369A1; font-weight: 600;">
          Proceed to Sign In Screen →
        </button>
      </div>
    </div>
  `;
}


export function renderRegisterUser(): string {
  return `
    <div class="auth-split-wrapper">
      <div class="auth-brand-side" style="background: #0F766E;">
        <div>
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 32px; cursor: pointer;" onclick="window.location.hash = ''">
            <span style="font-size: 32px;">🎓</span>
            <span style="font-size: 24px; font-weight: 700;">SchoolHub</span>
          </div>
          <h2 class="text-display" style="color: #FFFFFF; font-size: 28px; margin-bottom: 16px;">
            Join your school community with your School Code.
          </h2>
          <p style="color: rgba(255, 255, 255, 0.85); font-size: 15px; line-height: 1.6;">
            Connect directly to your teachers, assignments, announcements, and term report cards. All in one safe institutional portal.
          </p>
        </div>
        <div style="font-size: 13px; color: rgba(255, 255, 255, 0.7);">
          Need your school's code? Ask your school administrator or class teacher.
        </div>
      </div>

      <div class="auth-form-side">
        <div style="margin-bottom: 24px;">
          <h1 class="text-heading" style="font-size: 24px; margin-bottom: 6px;">Create Your Account</h1>
          <p class="text-body" style="color: var(--c-text-2);">Join as a teacher or student using your school code.</p>
        </div>

        <form id="form-register-user" onsubmit="window.SchoolHubApp.handleRegisterUser(event)">
          <div class="form-group">
            <label class="form-label" for="reg-usr-name">Full Name *</label>
            <input class="form-input" id="reg-usr-name" type="text" placeholder="e.g. Chukwuemeka Obi" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-usr-email">Email Address *</label>
            <input class="form-input" id="reg-usr-email" type="email" placeholder="student@example.com" required />
          </div>

          <div class="input-row">
            <div class="form-group">
              <label class="form-label" for="reg-usr-password">Password *</label>
              <input class="form-input" id="reg-usr-password" type="password" placeholder="••••••••" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="reg-usr-confirm">Confirm Password *</label>
              <input class="form-input" id="reg-usr-confirm" type="password" placeholder="••••••••" required />
            </div>
          </div>

          <div class="input-row">
            <div class="form-group">
              <label class="form-label" for="reg-usr-role">I am joining as a *</label>
              <select class="form-select" id="reg-usr-role" onchange="window.SchoolHubApp.toggleRoleFields(this.value)" required>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="reg-usr-code">School Code *</label>
              <input class="form-input" id="reg-usr-code" type="text" placeholder="e.g. SH-HMS001" style="text-transform: uppercase;" required />
            </div>
          </div>

          <div id="field-student-class" class="form-group">
            <label class="form-label" for="reg-usr-class">Class *</label>
            <select class="form-select" id="reg-usr-class">
              <option value="JSS1">JSS1</option>
              <option value="JSS2">JSS2</option>
              <option value="JSS3">JSS3</option>
              <option value="SS1">SS1</option>
              <option value="SS2" selected>SS2</option>
              <option value="SS3">SS3</option>
            </select>
          </div>

          <div id="field-teacher-specialty" class="form-group" style="display: none;">
            <label class="form-label" for="reg-usr-specialty">Subject Specialty *</label>
            <select class="form-select" id="reg-usr-specialty">
              <option value="English">English</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Basic Science">Basic Science</option>
              <option value="Social Studies">Social Studies</option>
              <option value="Civic Education">Civic Education</option>
              <option value="CRS/IRS">CRS/IRS</option>
              <option value="Agricultural Science">Agricultural Science</option>
              <option value="Computer Studies">Computer Studies</option>
              <option value="Physical Education">Physical Education</option>
              <option value="Fine Arts">Fine Arts</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button type="submit" class="btn btn-primary" id="btn-submit-register-usr" style="width: 100%; padding: 12px; background: #0F766E; margin-top: 8px;">
            Continue to Verification →
          </button>
        </form>

        <div style="margin-top: 20px; text-align: center; font-size: 13px; color: var(--c-text-2);">
          Already have an account? <a href="#login" style="color: #0F766E; font-weight: 600;">Sign in</a>
        </div>
      </div>
    </div>
  `;
}

export function renderEmailVerification(email: string, demoCode: string): string {
  return `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; background: var(--c-bg);">
      <div class="card fade-in" style="max-width: 440px; width: 100%; text-align: center; padding: 36px 28px;">
        <div style="font-size: 48px; margin-bottom: 12px;">✉️</div>
        <h1 class="text-heading" style="font-size: 24px; margin-bottom: 8px;">Verify your email</h1>
        <p class="text-body" style="color: var(--c-text-2); font-size: 14px; margin-bottom: 24px;">
          Enter the 6-digit code sent to<br/><strong style="color: var(--c-text-1);">${email}</strong>
        </p>

        <form id="form-verify-email" onsubmit="window.SchoolHubApp.handleVerifyEmail(event)">
          <div class="verify-inputs">
            <input type="text" maxlength="1" class="verify-digit" id="code-0" autofocus oninput="window.SchoolHubApp.handleCodeDigit(this, 0)" onkeydown="window.SchoolHubApp.handleCodeKey(event, 0)" required />
            <input type="text" maxlength="1" class="verify-digit" id="code-1" oninput="window.SchoolHubApp.handleCodeDigit(this, 1)" onkeydown="window.SchoolHubApp.handleCodeKey(event, 1)" required />
            <input type="text" maxlength="1" class="verify-digit" id="code-2" oninput="window.SchoolHubApp.handleCodeDigit(this, 2)" onkeydown="window.SchoolHubApp.handleCodeKey(event, 2)" required />
            <input type="text" maxlength="1" class="verify-digit" id="code-3" oninput="window.SchoolHubApp.handleCodeDigit(this, 3)" onkeydown="window.SchoolHubApp.handleCodeKey(event, 3)" required />
            <input type="text" maxlength="1" class="verify-digit" id="code-4" oninput="window.SchoolHubApp.handleCodeDigit(this, 4)" onkeydown="window.SchoolHubApp.handleCodeKey(event, 4)" required />
            <input type="text" maxlength="1" class="verify-digit" id="code-5" oninput="window.SchoolHubApp.handleCodeDigit(this, 5)" onkeydown="window.SchoolHubApp.handleCodeKey(event, 5)" required />
          </div>

          <div style="margin-bottom: 24px;">
            <span class="badge" style="background: #FEF3C7; color: #92400E; font-size: 12px; padding: 4px 12px; border-radius: var(--radius-xl);">
              Your demo code: <strong>${demoCode}</strong>
            </span>
          </div>

          <button type="submit" class="btn btn-primary" id="btn-verify-submit" style="width: 100%; padding: 12px; background: #0369A1;">
            Verify Email →
          </button>
        </form>

        <div style="margin-top: 20px; font-size: 13px;">
          <a href="#" onclick="window.SchoolHubApp.resendVerificationCode(); return false;" style="color: #0369A1; text-decoration: none; font-weight: 500;">
            Didn't receive code? Resend
          </a>
        </div>
      </div>
    </div>
  `;
}

export function renderLogin(lastEmail: string): string {
  return `
    <div class="auth-split-wrapper">
      <div class="auth-brand-side" style="background: linear-gradient(135deg, #0369A1 0%, #0F766E 100%);">
        <div>
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 32px; cursor: pointer;" onclick="window.location.hash = ''">
            <span style="font-size: 32px;">🎓</span>
            <span style="font-size: 24px; font-weight: 700;">SchoolHub</span>
          </div>
          <h2 class="text-display" style="color: #FFFFFF; font-size: 28px; margin-bottom: 16px;">
            Welcome back to your educational portal.
          </h2>
          <p style="color: rgba(255, 255, 255, 0.85); font-size: 15px; line-height: 1.6;">
            Sign in with your registered email and password to access your role-specific dashboard, announcements, grades, and records.
          </p>
        </div>
      </div>

      <div class="auth-form-side">
        <div style="margin-bottom: 28px;">
          <h1 class="text-heading" style="font-size: 24px; margin-bottom: 6px;">Sign In to SchoolHub</h1>
          <p class="text-body" style="color: var(--c-text-2);">Enter your email and password to enter your dashboard.</p>
        </div>

        <form id="form-login" onsubmit="window.SchoolHubApp.handleLogin(event)">
          <div class="form-group">
            <label class="form-label" for="login-email">Email Address</label>
            <input class="form-input" id="login-email" type="email" placeholder="name@school.com" value="${lastEmail}" required autofocus />
          </div>

          <div class="form-group">
            <label class="form-label" for="login-password">Password</label>
            <input class="form-input" id="login-password" type="password" placeholder="••••••••" required />
          </div>

          <button type="submit" class="btn btn-primary" id="btn-submit-login" style="width: 100%; padding: 12px; background: #0369A1; margin-top: 8px;">
            Login to Portal →
          </button>
        </form>

        <div style="margin-top: 28px; display: flex; flex-direction: column; gap: 12px; font-size: 13px; text-align: center; border-top: 1px solid var(--c-border); padding-top: 20px;">
          <div>
            Register a new institution? <a href="#register-school" style="color: #0369A1; font-weight: 600;">Register your school</a>
          </div>
          <div>
            Have a school code? <a href="#register-user" style="color: #0F766E; font-weight: 600;">Join with school code</a>
          </div>
        </div>
      </div>
    </div>
  `;
}
