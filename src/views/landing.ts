export function renderLandingPage(): string {
  return `
    <div class="landing-nav">
      <div class="landing-nav-inner">
        <div style="display: flex; align-items: center; gap: 10px; cursor: pointer;" onclick="window.location.hash = ''">
          <span style="font-size: 26px;">🎓</span>
          <span style="font-size: 20px; font-weight: 700; background: linear-gradient(135deg, #0369A1 0%, #7C3AED 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">SchoolHub</span>
        </div>
        <div style="display: flex; gap: 12px;">
          <button class="btn btn-ghost" id="btn-nav-login" onclick="window.location.hash = '#login'">Login</button>
          <button class="btn btn-primary" id="btn-nav-register" onclick="window.location.hash = '#register-school'" style="background: #0369A1;">Register School</button>
        </div>
      </div>
    </div>

    <section class="hero-section">
      <div>
        <div style="display: inline-flex; align-items: center; gap: 8px; background: #E0F2FE; color: #0369A1; padding: 6px 14px; border-radius: var(--radius-xl); font-size: 13px; font-weight: 600; margin-bottom: 20px;">
          <span>🇳🇬</span> Trusted by schools across Nigeria
        </div>
        <h1 class="text-display" style="font-size: 38px; margin-bottom: 16px; color: var(--c-text-1);">
          One platform.<br/>Every school.<br/>Every student.
        </h1>
        <p class="text-body" style="font-size: 16px; color: var(--c-text-2); margin-bottom: 32px; max-width: 480px;">
          SchoolHub connects teachers, students, and school administrators in one beautifully simple portal. Streamline grades, news, attendance, and timetables.
        </p>
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          <button class="btn btn-primary" id="hero-btn-register" onclick="window.location.hash = '#register-school'" style="background: #0369A1; font-size: 15px; padding: 12px 24px;">
            Register Your School →
          </button>
          <button class="btn btn-ghost" id="hero-btn-login" onclick="window.location.hash = '#login'" style="font-size: 15px; padding: 12px 24px;">
            Login to Portal
          </button>
        </div>
      </div>

      <div class="hero-mockup fade-in">
        <div class="mockup-header">
          <div class="mockup-dot" style="background: #EF4444;"></div>
          <div class="mockup-dot" style="background: #F59E0B;"></div>
          <div class="mockup-dot" style="background: #10B981;"></div>
          <span style="font-size: 11px; color: var(--c-text-3); margin-left: 8px; font-weight: 500;">portal.schoolhub.ng / harmony-school</span>
        </div>
        <div class="mockup-body">
          <div class="mockup-sidebar" style="display: flex; flex-direction: column; gap: 8px; padding: 12px 8px;">
            <div style="width: 100%; height: 16px; background: rgba(255,255,255,0.4); border-radius: 4px;"></div>
            <div style="width: 70%; height: 10px; background: rgba(255,255,255,0.3); border-radius: 3px;"></div>
            <div style="width: 85%; height: 10px; background: rgba(255,255,255,0.3); border-radius: 3px;"></div>
            <div style="width: 60%; height: 10px; background: rgba(255,255,255,0.3); border-radius: 3px;"></div>
          </div>
          <div class="mockup-content">
            <div class="mockup-stats">
              <div class="mockup-card" style="padding: 10px; display: flex; flex-direction: column; justify-content: center; gap: 4px;">
                <div style="font-size: 10px; color: var(--c-text-2); font-weight: 600;">ACTIVE STUDENTS</div>
                <div style="font-size: 18px; font-weight: 700; color: #0369A1;">482</div>
              </div>
              <div class="mockup-card" style="padding: 10px; display: flex; flex-direction: column; justify-content: center; gap: 4px;">
                <div style="font-size: 10px; color: var(--c-text-2); font-weight: 600;">TERM PASS RATE</div>
                <div style="font-size: 18px; font-weight: 700; color: #10B981;">94.6%</div>
              </div>
            </div>
            <div style="background: var(--c-surface2); border-radius: var(--radius-md); padding: 12px; flex: 1; display: flex; flex-direction: column; gap: 6px;">
              <div style="height: 10px; width: 40%; background: #D1D5DB; border-radius: 3px;"></div>
              <div style="height: 8px; width: 90%; background: #E5E7EB; border-radius: 3px;"></div>
              <div style="height: 8px; width: 75%; background: #E5E7EB; border-radius: 3px;"></div>
              <div style="margin-top: auto; display: flex; justify-content: space-between;">
                <div style="height: 14px; width: 50px; background: #D1FAE5; border-radius: 10px;"></div>
                <div style="height: 14px; width: 40px; background: #E0F2FE; border-radius: 10px;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section style="background: var(--c-surface); border-top: 1px solid var(--c-border); border-bottom: 1px solid var(--c-border); padding: 64px 24px;">
      <div style="max-width: 1100px; margin: 0 auto;">
        <div style="text-align: center; max-width: 600px; margin: 0 auto 48px;">
          <h2 class="text-heading" style="font-size: 28px; margin-bottom: 12px;">Everything your school needs</h2>
          <p class="text-body" style="color: var(--c-text-2);">Purpose-built for secondary education standards across Nigeria, from JSS1 to SS3.</p>
        </div>

        <div class="feature-grid">
          <div class="card card-hover">
            <div style="font-size: 28px; margin-bottom: 12px;">📊</div>
            <h3 class="text-subheading" style="margin-bottom: 8px;">Reports & Grades</h3>
            <p class="text-body" style="color: var(--c-text-2); font-size: 13px;">Generate and share professional Nigerian report cards with auto-grading (A–F), remarks, class averages, and print-ready layouts.</p>
          </div>

          <div class="card card-hover">
            <div style="font-size: 28px; margin-bottom: 12px;">📢</div>
            <h3 class="text-subheading" style="margin-bottom: 8px;">Announcements</h3>
            <p class="text-body" style="color: var(--c-text-2); font-size: 13px;">Post school news, exam timetables, sports trials, and urgent notices instantly to all registered students and teachers.</p>
          </div>

          <div class="card card-hover">
            <div style="font-size: 28px; margin-bottom: 12px;">✅</div>
            <h3 class="text-subheading" style="margin-bottom: 8px;">Attendance</h3>
            <p class="text-body" style="color: var(--c-text-2); font-size: 13px;">Track daily classroom roll calls with one click. Automatic calculations of present, absent, late rates, and 4-week trends.</p>
          </div>

          <div class="card card-hover">
            <div style="font-size: 28px; margin-bottom: 12px;">📚</div>
            <h3 class="text-subheading" style="margin-bottom: 8px;">Assignments</h3>
            <p class="text-body" style="color: var(--c-text-2); font-size: 13px;">Set, collect, and grade assignments digitally with deadline tracking, submission status, and teacher feedback notes.</p>
          </div>

          <div class="card card-hover">
            <div style="font-size: 28px; margin-bottom: 12px;">🗓</div>
            <h3 class="text-subheading" style="margin-bottom: 8px;">Timetables</h3>
            <p class="text-body" style="color: var(--c-text-2); font-size: 13px;">Build 8-period weekly timetables with break periods, room assignments, teacher allocation, and real-time live clock indicators.</p>
          </div>

          <div class="card card-hover">
            <div style="font-size: 28px; margin-bottom: 12px;">💬</div>
            <h3 class="text-subheading" style="margin-bottom: 8px;">Messaging & Community</h3>
            <p class="text-body" style="color: var(--c-text-2); font-size: 13px;">Keep teachers and students in direct harmony through verified school codes and secure institutional accounts.</p>
          </div>
        </div>
      </div>
    </section>

    <section style="padding: 64px 24px; max-width: 1100px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 48px;">
        <h2 class="text-heading" style="font-size: 28px; margin-bottom: 12px;">How It Works</h2>
        <p class="text-body" style="color: var(--c-text-2);">Get your entire school online in three simple steps.</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
        <div class="card" style="border-top: 4px solid #0369A1;">
          <div style="font-size: 20px; font-weight: 700; color: #0369A1; margin-bottom: 8px;">Step 1</div>
          <h3 class="text-subheading" style="margin-bottom: 8px;">Register Your School</h3>
          <p class="text-body" style="color: var(--c-text-2); font-size: 13px;">Enter your school information and create your administrator profile to generate your unique 8-character school code (e.g. SH-HMS001).</p>
        </div>

        <div class="card" style="border-top: 4px solid #0F766E;">
          <div style="font-size: 20px; font-weight: 700; color: #0F766E; margin-bottom: 8px;">Step 2</div>
          <h3 class="text-subheading" style="margin-bottom: 8px;">Share Code with Staff & Students</h3>
          <p class="text-body" style="color: var(--c-text-2); font-size: 13px;">Distribute your code to teachers and students so they can easily create their specialized portal accounts and connect to your school.</p>
        </div>

        <div class="card" style="border-top: 4px solid #6C63FF;">
          <div style="font-size: 20px; font-weight: 700; color: #6C63FF; margin-bottom: 8px;">Step 3</div>
          <h3 class="text-subheading" style="margin-bottom: 8px;">Everyone Connects</h3>
          <p class="text-body" style="color: var(--c-text-2); font-size: 13px;">Teachers record marks and take roll call; students review report cards and submit assignments; admins oversee the entire campus.</p>
        </div>
      </div>
    </section>

    <footer style="background: #111827; color: #F3F4F6; padding: 48px 24px; border-top: 1px solid #374151; margin-top: auto;">
      <div style="max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 24px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 24px;">🎓</span>
          <span style="font-size: 18px; font-weight: 700; color: #FFFFFF;">SchoolHub</span>
        </div>
        <div style="display: flex; gap: 24px; font-size: 13px; color: #9CA3AF;">
          <a href="#" style="color: #9CA3AF; text-decoration: none;" onclick="return false;">Privacy Policy</a>
          <a href="#" style="color: #9CA3AF; text-decoration: none;" onclick="return false;">Terms of Service</a>
          <a href="#" style="color: #9CA3AF; text-decoration: none;" onclick="return false;">Contact Support</a>
        </div>
      </div>
      <div style="max-width: 1100px; margin: 24px auto 0; padding-top: 24px; border-top: 1px solid #1F2937; text-align: center; font-size: 12px; color: #6B7280;">
        &copy; 2025 SchoolHub. Built for Nigerian schools.
      </div>
    </footer>
  `;
}
