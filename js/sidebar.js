/* 侧边栏生成器 */
function buildSidebar(role, activePage) {
  const configs = {
    student: {
      roleLabel: '张同学',
      roleType: '学生 · 信息工程学院',
      roleAvatar: '张',
      nav: [
        { icon: '🏠', label: '成长首页', href: 'student-home.html', key: 'student-home' },
        { icon: '👤', label: '我的成长画像', href: 'student-profile.html', key: 'student-profile' },
        { icon: '⭐', label: '五育评价', href: 'student-wuyu.html', key: 'student-wuyu' },
        { icon: '📚', label: '学业发展', href: 'student-academic.html', key: 'student-academic' },
        { icon: '🔔', label: '提醒与推荐', href: 'student-remind.html', key: 'student-remind', badge: '3' },
      ]
    },
    counselor: {
      roleLabel: '李老师',
      roleType: '辅导员 · 信息工程学院',
      roleAvatar: '李',
      nav: [
        { icon: '📊', label: '带班总览', href: 'counselor-overview.html', key: 'counselor-overview' },
        { icon: '📋', label: '重点关注名单', href: 'counselor-list.html', key: 'counselor-list', badge: '12' },
        { icon: '👤', label: '学生画像详情', href: 'student-detail.html', key: 'student-detail' },
        { icon: '📈', label: '班级群体分析', href: 'counselor-class.html', key: 'counselor-class' },
      ]
    },
    dean: {
      roleLabel: '王院长',
      roleType: '学院管理 · 信息工程学院',
      roleAvatar: '王',
      nav: [
        { icon: '🏫', label: '学院画像分析', href: 'college-analysis.html', key: 'college-analysis' },
        { icon: '🔍', label: '专题分析', href: 'topic-analysis.html', key: 'topic-analysis' },
        { icon: '📊', label: '支持成效分析', href: 'effect-analysis.html', key: 'effect-analysis' },
      ]
    },
    leader: {
      roleLabel: '陈校长',
      roleType: '学校领导 · 学生工作处',
      roleAvatar: '陈',
      nav: [
        { icon: '🖥️', label: '校级驾驶舱', href: 'dashboard.html', key: 'dashboard' },
        { icon: '📄', label: '规则与口径说明', href: 'rules.html', key: 'rules' },
      ]
    }
  };

  const allRoles = [
    { key: 'student', label: '🎓 学生视角', href: 'student-home.html' },
    { key: 'counselor', label: '👩‍🏫 辅导员视角', href: 'counselor-overview.html' },
    { key: 'dean', label: '🏫 学院管理视角', href: 'college-analysis.html' },
    { key: 'leader', label: '🖥️ 校级领导视角', href: 'dashboard.html' },
  ];

  const cfg = configs[role];
  if (!cfg) return;

  const navHtml = cfg.nav.map(item => `
    <a href="${item.href}" class="${activePage === item.key ? 'active' : ''}">
      <span class="nav-icon">${item.icon}</span>
      ${item.label}
      ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
    </a>
  `).join('');

  const roleBtns = allRoles.map(r => `
    <a href="${r.href}" class="role-btn ${r.key === role ? 'current' : ''}">${r.label}</a>
  `).join('');

  return `
    <div class="sidebar-logo">
      <div class="logo-icon">🌱</div>
      <div class="logo-title">学生成长画像</div>
      <div class="logo-sub">精准支持分析平台</div>
    </div>
    <div class="sidebar-role">
      <div class="role-avatar">${cfg.roleAvatar}</div>
      <div>
        <div class="role-name">${cfg.roleLabel}</div>
        <div class="role-type">${cfg.roleType}</div>
      </div>
    </div>
    <div class="sidebar-section">
      <div class="sidebar-section-title">功能导航</div>
      <nav class="sidebar-nav">${navHtml}</nav>
    </div>
    <div class="sidebar-footer">
      <div class="sidebar-section-title" style="padding:0 4px 6px;">切换视角</div>
      <div class="role-switcher">${roleBtns}</div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar && sidebar.dataset.role) {
    sidebar.innerHTML = buildSidebar(sidebar.dataset.role, sidebar.dataset.active);
  }
});
