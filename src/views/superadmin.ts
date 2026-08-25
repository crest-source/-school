import { Store } from '../store';

export function renderSuperAdminLogin(): string {
  return `
    <div style="min-height: 100vh; background: #0F172A; display: flex; align-items: center; justify-content: center; padding: 24px; color: #F8FAFC;">
      <div class="card fade-in" style="background: #1E293B; border-color: #334155; max-width: 400px; width: 100%; padding: 36px 28px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #94A3B8; font-weight: 600; margin-bottom: 8px;">
            System Access
          </div>
          <div style="font-size: 32px; margin-bottom: 8px;">🔐</div>
          <h1 style="font-size: 20px; font-weight: 600; color: #FFFFFF;">Root Authentication</h1>
        </div>

        <form id="form-super-login" onsubmit="window.SchoolHubApp.handleSuperAdminLogin(event)">
          <div class="form-group">
            <label class="form-label" style="color: #CBD5E1;">System Identity</label>
            <input class="form-input" id="super-email" type="email" placeholder="admin@domain.com" style="background: #0F172A; border-color: #475569; color: #F8FAFC;" required autofocus />
          </div>

          <div class="form-group">
            <label class="form-label" style="color: #CBD5E1;">Access Key</label>
            <input class="form-input" id="super-password" type="password" placeholder="••••••••" style="background: #0F172A; border-color: #475569; color: #F8FAFC;" required />
          </div>

          <button type="submit" class="btn" style="width: 100%; padding: 12px; background: #7C3AED; color: #FFFFFF; font-weight: 600; margin-top: 8px;">
            Authenticate Access →
          </button>
        </form>

        <div style="margin-top: 24px; text-align: center;">
          <a href="#" onclick="window.location.hash = ''; return false;" style="color: #64748B; font-size: 12px; text-decoration: none;">
            ← Return to public portal
          </a>
        </div>
      </div>
    </div>
  `;
}

export function renderSuperAdminDashboard(activeTab = 'overview', searchFilter = '', roleFilter = 'all', schoolFilter = 'all'): string {
  const store = Store.getInstance();
  const schools = store.getSchools();
  const users = store.getUsers();
  const reports = store.getReports();

  const totalTeachers = users.filter((u) => u.role === 'teacher').length;
  const totalStudents = users.filter((u) => u.role === 'student').length;

  return `
    <div class="dashboard-container">
      <aside class="sidebar" style="background-color: #7C3AED;">
        <div>
          <div class="sidebar-brand">
            <span class="sidebar-brand-icon">⚡</span>
            <div>
              <div class="sidebar-brand-text">Super Admin</div>
              <span class="sidebar-badge">Root Control</span>
            </div>
          </div>

          <nav class="sidebar-nav">
            <a class="nav-item ${activeTab === 'overview' ? 'active' : ''}" onclick="window.SchoolHubApp.setSuperAdminTab('overview')">
              <span>📊</span> Overview
            </a>
            <a class="nav-item ${activeTab === 'schools' ? 'active' : ''}" onclick="window.SchoolHubApp.setSuperAdminTab('schools')">
              <span>🏫</span> Schools (${schools.length})
            </a>
            <a class="nav-item ${activeTab === 'users' ? 'active' : ''}" onclick="window.SchoolHubApp.setSuperAdminTab('users')">
              <span>👥</span> Users (${users.length})
            </a>
            <a class="nav-item ${activeTab === 'stats' ? 'active' : ''}" onclick="window.SchoolHubApp.setSuperAdminTab('stats')">
              <span>📈</span> Platform Stats
            </a>
            <a class="nav-item ${activeTab === 'settings' ? 'active' : ''}" onclick="window.SchoolHubApp.setSuperAdminTab('settings')">
              <span>⚙️</span> Settings
            </a>
          </nav>
        </div>

        <div class="sidebar-footer">
          <div class="sidebar-user-pill">
            <span style="font-size: 12px; font-weight: 500;">superadmin@schoolhub</span>
            <span style="font-size: 10px; background: rgba(255,255,255,0.25); padding: 2px 6px; border-radius: 4px;">ACTIVE</span>
          </div>
          <button class="btn btn-sm" onclick="window.SchoolHubApp.logoutSuperAdmin()" style="width: 100%; background: rgba(0,0,0,0.3); color: #FFFFFF; border: 1px solid rgba(255,255,255,0.2);">
            Exit System
          </button>
        </div>
      </aside>

      <main class="main-content">
        ${renderSuperAdminTabContent(activeTab, searchFilter, roleFilter, schoolFilter)}
      </main>
    </div>
  `;
}

function renderSuperAdminTabContent(activeTab: string, searchFilter: string, roleFilter: string, schoolFilter: string): string {
  const store = Store.getInstance();
  const schools = store.getSchools();
  const users = store.getUsers();
  const reports = store.getReports();

  if (activeTab === 'overview') {
    const totalTeachers = users.filter((u) => u.role === 'teacher').length;
    const totalStudents = users.filter((u) => u.role === 'student').length;
    const recentUsers = [...users].slice(0, 10);
    const recentSchools = [...schools].slice(0, 5);

    return `
      <div class="fade-in">
        <div class="content-header">
          <div>
            <h1 class="text-heading" style="font-size: 24px;">Platform Overview</h1>
            <p class="text-body" style="color: var(--c-text-2);">Real-time network telemetry across all registered institutions.</p>
          </div>
          <button class="btn btn-primary" onclick="window.SchoolHubApp.exportDataJSON()" style="background: #7C3AED;">
            <span>📥</span> Export Platform JSON
          </button>
        </div>

        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-label">TOTAL REGISTERED SCHOOLS</div>
            <div class="stat-value" data-count="${schools.length}">${schools.length}</div>
            <div class="stat-sub">Across 36 states + FCT</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">TOTAL TEACHERS</div>
            <div class="stat-value" data-count="${totalTeachers}">${totalTeachers}</div>
            <div class="stat-sub">Active faculty accounts</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">TOTAL STUDENTS</div>
            <div class="stat-value" data-count="${totalStudents}">${totalStudents}</div>
            <div class="stat-sub">Enrolled JSS1–SS3 pupils</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">REPORTS GENERATED</div>
            <div class="stat-value" data-count="${reports.length}">${reports.length}</div>
            <div class="stat-sub">Official term report cards</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; margin-top: 24px;">
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h2 class="text-subheading">Recent User Registrations (Last 10)</h2>
              <span class="badge badge-general">${users.length} total</span>
            </div>
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>School</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  ${recentUsers.map((u) => `
                    <tr>
                      <td style="font-weight: 500;">${u.name}</td>
                      <td style="color: var(--c-text-2);">${u.email}</td>
                      <td>
                        <span class="badge ${u.role === 'admin' ? 'badge-urgent' : u.role === 'teacher' ? 'badge-academic' : 'badge-event'}">
                          ${u.role}
                        </span>
                      </td>
                      <td style="font-size: 12px; color: var(--c-text-2);">${u.schoolId}</td>
                      <td style="color: var(--c-text-3); font-size: 12px;">${new Date(u.joinedAt).toLocaleDateString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h2 class="text-subheading">Latest School Growth</h2>
              <span class="badge badge-academic">${schools.length} Active</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${recentSchools.map((s) => `
                <div style="padding: 12px; background: var(--c-surface2); border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-weight: 600; font-size: 14px;">${s.name}</div>
                    <div style="font-size: 12px; color: var(--c-text-2);">${s.state} · Code: <code style="font-weight: 600; color: #7C3AED;">${s.code}</code></div>
                  </div>
                  <span class="badge ${s.status === 'active' ? 'badge-active' : 'badge-suspended'}">${s.status}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (activeTab === 'schools') {
    const query = searchFilter.toLowerCase();
    const filteredSchools = schools.filter(
      (s) => s.name.toLowerCase().includes(query) || s.code.toLowerCase().includes(query) || s.state.toLowerCase().includes(query)
    );

    return `
      <div class="fade-in">
        <div class="content-header">
          <div>
            <h1 class="text-heading" style="font-size: 24px;">Manage Institutions</h1>
            <p class="text-body" style="color: var(--c-text-2);">Audit, inspect, and configure schools nationwide.</p>
          </div>
        </div>

        <div class="card" style="margin-bottom: 20px; padding: 16px;">
          <input
            type="text"
            class="form-input"
            placeholder="Search by school name, code (SH-...), or state..."
            value="${searchFilter}"
            oninput="window.SchoolHubApp.filterSuperAdminSchools(this.value)"
            style="max-width: 400px;"
          />
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>School Name</th>
                <th>Code</th>
                <th>State</th>
                <th>Type</th>
                <th>Teachers</th>
                <th>Students</th>
                <th>Registered</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filteredSchools.length === 0 ? `
                <tr><td colspan="9" style="text-align: center; padding: 32px; color: var(--c-text-3);">No institutions matching criteria</td></tr>
              ` : filteredSchools.map((s) => {
                const schoolUsers = users.filter((u) => u.schoolId === s.id);
                const teachersCount = schoolUsers.filter((u) => u.role === 'teacher').length;
                const studentsCount = schoolUsers.filter((u) => u.role === 'student').length;

                return `
                  <tr>
                    <td style="font-weight: 600;">${s.name}</td>
                    <td><code style="font-weight: 600; color: #7C3AED; background: #F3E8FF; padding: 2px 6px; border-radius: 4px;">${s.code}</code></td>
                    <td>${s.state}</td>
                    <td><span class="badge badge-general">${s.type}</span></td>
                    <td><strong>${teachersCount}</strong></td>
                    <td><strong>${studentsCount}</strong></td>
                    <td style="font-size: 12px; color: var(--c-text-2);">${new Date(s.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span class="badge ${s.status === 'active' ? 'badge-active' : 'badge-suspended'}">${s.status}</span>
                    </td>
                    <td>
                      <div style="display: flex; gap: 6px;">
                        <button class="btn btn-ghost btn-sm" onclick="window.SchoolHubApp.viewSchoolDetails('${s.id}')">View</button>
                        <button class="btn btn-ghost btn-sm" onclick="window.SchoolHubApp.toggleSchoolStatus('${s.id}')">${s.status === 'active' ? 'Suspend' : 'Activate'}</button>
                        <button class="btn btn-danger btn-sm" onclick="window.SchoolHubApp.confirmDeleteSchool('${s.id}')">Delete</button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  if (activeTab === 'users') {
    const query = searchFilter.toLowerCase();
    const filteredUsers = users.filter((u) => {
      const matchQuery = u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchSchool = schoolFilter === 'all' || u.schoolId === schoolFilter;
      return matchQuery && matchRole && matchSchool;
    });

    return `
      <div class="fade-in">
        <div class="content-header">
          <div>
            <h1 class="text-heading" style="font-size: 24px;">Platform User Directory</h1>
            <p class="text-body" style="color: var(--c-text-2);">Complete global registry of administrators, educators, and students.</p>
          </div>
        </div>

        <div class="card" style="margin-bottom: 20px; padding: 16px; display: flex; gap: 16px; flex-wrap: wrap;">
          <input
            type="text"
            class="form-input"
            placeholder="Search by name or email..."
            value="${searchFilter}"
            oninput="window.SchoolHubApp.filterSuperAdminUsersSearch(this.value)"
            style="flex: 1; min-width: 200px;"
          />
          <select class="form-select" style="width: 160px;" onchange="window.SchoolHubApp.filterSuperAdminUsersRole(this.value)">
            <option value="all" ${roleFilter === 'all' ? 'selected' : ''}>All Roles</option>
            <option value="admin" ${roleFilter === 'admin' ? 'selected' : ''}>Admins</option>
            <option value="teacher" ${roleFilter === 'teacher' ? 'selected' : ''}>Teachers</option>
            <option value="student" ${roleFilter === 'student' ? 'selected' : ''}>Students</option>
          </select>
          <select class="form-select" style="width: 200px;" onchange="window.SchoolHubApp.filterSuperAdminUsersSchool(this.value)">
            <option value="all">All Schools</option>
            ${schools.map((s) => `<option value="${s.id}" ${schoolFilter === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
          </select>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>School Code</th>
                <th>Class / Specialty</th>
                <th>Verified</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filteredUsers.length === 0 ? `
                <tr><td colspan="9" style="text-align: center; padding: 32px; color: var(--c-text-3);">No matching users found</td></tr>
              ` : filteredUsers.map((u) => `
                <tr>
                  <td style="font-weight: 600;">${u.name}</td>
                  <td style="color: var(--c-text-2);">${u.email}</td>
                  <td>
                    <span class="badge ${u.role === 'admin' ? 'badge-urgent' : u.role === 'teacher' ? 'badge-academic' : 'badge-event'}">
                      ${u.role}
                    </span>
                  </td>
                  <td><code>${u.schoolId}</code></td>
                  <td>${u.studentClass || u.specialty || '—'}</td>
                  <td>
                    <span style="color: ${u.verified ? '#10B981' : '#F59E0B'}; font-weight: 600;">
                      ${u.verified ? '✓ Yes' : '⏳ Pending'}
                    </span>
                  </td>
                  <td style="font-size: 12px; color: var(--c-text-2);">${new Date(u.joinedAt).toLocaleDateString()}</td>
                  <td>
                    <span class="badge ${u.status === 'active' ? 'badge-active' : 'badge-suspended'}">${u.status}</span>
                  </td>
                  <td>
                    <div style="display: flex; gap: 6px;">
                      <button class="btn btn-ghost btn-sm" onclick="window.SchoolHubApp.toggleUserStatus('${u.id}')">${u.status === 'active' ? 'Suspend' : 'Activate'}</button>
                      <button class="btn btn-danger btn-sm" onclick="window.SchoolHubApp.confirmDeleteUser('${u.id}')">Delete</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  if (activeTab === 'stats') {
    // State distribution calculation
    const stateCounts: Record<string, number> = {};
    schools.forEach((s) => {
      stateCounts[s.state] = (stateCounts[s.state] || 0) + 1;
    });

    const publicCount = schools.filter((s) => s.type !== 'Private').length;
    const privateCount = schools.filter((s) => s.type === 'Private').length;

    return `
      <div class="fade-in">
        <div class="content-header">
          <div>
            <h1 class="text-heading" style="font-size: 24px;">Platform Analytics & Geo Distribution</h1>
            <p class="text-body" style="color: var(--c-text-2);">Statewide breakdown and institutional characteristics.</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1.6fr 1fr; gap: 24px;">
          <div class="card">
            <h2 class="text-subheading" style="margin-bottom: 16px;">Schools Distribution by State (Pure CSS Chart)</h2>
            <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 20px;">
              ${Object.entries(stateCounts).map(([state, count]) => {
                const max = Math.max(...Object.values(stateCounts), 1);
                const pct = Math.round((count / max) * 100);
                return `
                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px; font-weight: 500;">
                      <span>${state}</span>
                      <span><strong>${count}</strong> school${count > 1 ? 's' : ''}</span>
                    </div>
                    <div style="height: 12px; background: var(--c-surface2); border-radius: var(--radius-xl); overflow: hidden;">
                      <div style="height: 100%; width: ${pct}%; background: linear-gradient(90deg, #7C3AED, #A78BFA); border-radius: var(--radius-xl); transition: width 0.8s ease-out;"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 24px;">
            <div class="card">
              <h2 class="text-subheading" style="margin-bottom: 12px;">Ownership Model</h2>
              <div style="display: flex; gap: 12px; margin-top: 12px;">
                <div style="flex: 1; padding: 16px; background: #EDE9FE; border-radius: var(--radius-md); text-align: center;">
                  <div style="font-size: 12px; color: #5B21B6; font-weight: 600;">PRIVATE</div>
                  <div style="font-size: 24px; font-weight: 700; color: #7C3AED;">${privateCount}</div>
                </div>
                <div style="flex: 1; padding: 16px; background: #E0F2FE; border-radius: var(--radius-md); text-align: center;">
                  <div style="font-size: 12px; color: #075985; font-weight: 600;">PUBLIC / GOVT</div>
                  <div style="font-size: 24px; font-weight: 700; color: #0369A1;">${publicCount}</div>
                </div>
              </div>
            </div>

            <div class="card">
              <h2 class="text-subheading" style="margin-bottom: 8px;">System Health</h2>
              <div style="font-size: 13px; color: var(--c-text-2); margin-bottom: 12px;">
                Storage Driver: <code>localStorage (Native)</code>
              </div>
              <div style="padding: 12px; background: #D1FAE5; color: #065F46; border-radius: var(--radius-md); font-size: 13px; font-weight: 500;">
                ✓ 100% Client-Side Sync · Operational
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Settings
  const platformName = store.getPlatformName();
  const isMaintenance = store.isMaintenanceMode();

  return `
    <div class="fade-in">
      <div class="content-header">
        <div>
          <h1 class="text-heading" style="font-size: 24px;">System Settings</h1>
          <p class="text-body" style="color: var(--c-text-2);">Global platform configuration and maintenance controls.</p>
        </div>
      </div>

      <div class="card" style="max-width: 640px;">
        <form onsubmit="window.SchoolHubApp.handleSuperAdminSaveSettings(event)">
          <div class="form-group">
            <label class="form-label" for="setting-platform-name">Platform Display Name</label>
            <input class="form-input" id="setting-platform-name" type="text" value="${platformName}" required />
          </div>

          <div class="form-group" style="display: flex; align-items: center; justify-content: space-between; padding: 16px; background: var(--c-surface2); border-radius: var(--radius-md); margin-top: 20px;">
            <div>
              <div style="font-weight: 600;">Maintenance Mode</div>
              <div style="font-size: 12px; color: var(--c-text-2);">Temporarily lock non-admin user operations.</div>
            </div>
            <label style="position: relative; display: inline-block; width: 44px; height: 24px; cursor: pointer;">
              <input type="checkbox" id="setting-maintenance" ${isMaintenance ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;" />
              <span style="position: absolute; inset: 0; background-color: ${isMaintenance ? '#7C3AED' : '#D1D5DB'}; border-radius: 24px; transition: 0.3s;"></span>
            </label>
          </div>

          <div style="margin-top: 28px; display: flex; gap: 12px; flex-wrap: wrap;">
            <button type="submit" class="btn btn-primary" style="background: #7C3AED;">Save System Settings</button>
            <button type="button" class="btn btn-ghost" onclick="window.SchoolHubApp.exportDataJSON()">Export Backup (JSON)</button>
            <button type="button" class="btn btn-ghost" style="color: #DC2626; border-color: #FECACA;" onclick="window.SchoolHubApp.resetPlatformData()">Clear All Data</button>
          </div>
        </form>
      </div>
    </div>
  `;
}
