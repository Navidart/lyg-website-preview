const footerLogo = 'https://www.figma.com/api/mcp/asset/7f69e832-1293-43c0-9fb6-24fb84af5b3e';
const socialIconAssets = [
  {
    label: 'Instagram',
    href: '#',
    src: 'https://www.figma.com/api/mcp/asset/e3968fd0-3d5f-4f1f-80ec-9b8dbb737d40',
    width: 15.75,
  },
  {
    label: 'Facebook',
    href: '#',
    src: 'https://www.figma.com/api/mcp/asset/a26d2d0f-8620-4c77-899c-1cc3d3f243d8',
    width: 11.25,
  },
  {
    label: 'LinkedIn',
    href: '#',
    src: 'https://www.figma.com/api/mcp/asset/fb929815-4437-4594-b9df-c0ccc550cd19',
    width: 15.75,
  },
  {
    label: 'YouTube',
    href: '#',
    src: 'https://www.figma.com/api/mcp/asset/aa67f8a2-6a8f-4a51-aa92-260f98377c30',
    width: 20.25,
  },
];

const footerColumns = [
  {
    title: 'Sales',
    links: ['Brokerage', 'Yachts for Sale', 'New Construction', 'How to Buy', 'How to Sell', "Buyer's Guide"],
  },
  {
    title: 'Charter',
    links: ['Yacht Fleet', 'Charter Marketing', 'Destination Guides', 'Request Availability'],
  },
  {
    title: 'Yacht Support',
    links: [
      'Financial Services',
      'Payroll & Accounting',
      'Payroll Service Process',
      'Logistical Support',
      'Admin Services',
      'Price List',
      'Document Library',
    ],
  },
  {
    title: 'Crew',
    links: ['Find Work', 'Find Crew', 'Job Descriptions', 'Salary Guidelines', 'Crew FAQ'],
  },
  {
    title: 'Tools',
    links: ['Cost Calculator', 'Guides', 'Documents', 'Forms'],
  },
  {
    title: 'Company',
    links: ['About Us', 'Newsroom', 'Contact', 'Our Offices'],
    secondaryTitle: 'Accounts',
    secondaryLinks: ['Sign In', 'Register'],
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {footerColumns.map((column) => (
            <div className="footer-column" key={column.title}>
              <h3 className="footer-column-title">{column.title}</h3>
              <ul className="footer-link-list">
                {column.links.map((link) => (
                  <li key={link}>
                    <a className="footer-link" href="#">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
              {column.secondaryTitle && (
                <>
                  <h3 className="footer-column-title footer-column-title-secondary">{column.secondaryTitle}</h3>
                  <ul className="footer-link-list">
                    {column.secondaryLinks.map((link) => (
                      <li key={link}>
                        <a className="footer-link" href="#">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="footer-bottom-bar">
          <a className="footer-bottom-logo" href="/" aria-label="Luxury Yacht Group">
            <img src={footerLogo} alt="Luxury Yacht Group" />
          </a>

          <div className="footer-bottom-legal">
            <span className="footer-bottom-copy">© 2024 Luxury Yacht Group. All Rights Reserved.</span>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
          </div>

          <div className="footer-bottom-social" aria-label="Social links">
            {socialIconAssets.map(({ label, href, src, width }) => (
              <a key={label} href={href} aria-label={label}>
                <img src={src} alt="" style={{ width: `${width}px` }} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
