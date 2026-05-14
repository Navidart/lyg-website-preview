import React from 'react';

const statLabels = {
  Dashboard: ['Published yachts', 'Open inquiries', 'Active charters', 'Pending reviews'],
  Yachts: ['Listed yachts', 'Draft listings', 'Featured yachts', 'Updated this week'],
  Charters: ['Charter yachts', 'Availability requests', 'Featured vessels', 'Destination matches'],
  Destinations: ['Destinations', 'Featured regions', 'Seasonal edits', 'Draft guides'],
  News: ['Articles', 'Draft posts', 'Scheduled posts', 'Categories'],
  Users: ['Registered users', 'Admin users', 'New this month', 'Pending profiles'],
  Inquiries: ['New inquiries', 'In review', 'Assigned', 'Closed'],
};

function getStatLabels(title) {
  return statLabels[title] ?? statLabels.Dashboard;
}

export default function AdminPage({ title = 'Dashboard' }) {
  const labels = getStatLabels(title);

  return (
    <>
      <p className="shell-copy">
        Protected admin foundation is in place. Management tools for this area can be added next.
      </p>

      <div className="admin-stats-grid" aria-label={`${title} summary`}>
        {labels.map((label, index) => (
          <article className="admin-stat-card" key={label}>
            <span>{label}</span>
            <strong>{index === 0 ? '0' : '—'}</strong>
          </article>
        ))}
      </div>

      <div className="admin-workspace-grid">
        <section className="admin-card">
          <div className="admin-card-header">
            <h3>Recent Activity</h3>
            <span>Placeholder</span>
          </div>
          <ul className="admin-activity-list">
            <li>No activity yet.</li>
            <li>Future edits, inquiries, and content changes will appear here.</li>
            <li>Audit events can be connected once CRUD is introduced.</li>
          </ul>
        </section>

        <section className="admin-card admin-table-card">
          <div className="admin-card-header">
            <h3>Content Management</h3>
            <span>{title}</span>
          </div>
          <div className="admin-table-placeholder">
            <div className="admin-table-row admin-table-head">
              <span>Title</span>
              <span>Status</span>
              <span>Updated</span>
            </div>
            <div className="admin-table-row">
              <span>No records yet</span>
              <span>Pending setup</span>
              <span>—</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
