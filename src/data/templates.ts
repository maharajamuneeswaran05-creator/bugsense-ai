import { BugTemplate } from "../types";

export const BUG_TEMPLATES: BugTemplate[] = [
  {
    id: "payment-map-crash",
    name: "Blank Screen (Reading 'map')",
    shortDescription: "A classic client-side crash on missing or null initial state properties.",
    badge: "React Crash",
    bug_report: "Our payment page goes completely blank and crashes when new users visit it. Curiously, it works perfect for our returning customers who already have previous payment records, but breaks instantly on newly registered premium signups.",
    logs: `TypeError: Cannot read properties of undefined (reading 'map')
    at PaymentHistory (PaymentHistory.tsx:42:24)
    at renderWithHooks (react-dom.development.js:15486)
    at updateFunctionComponent (react-dom.development.js:17357)
    at beginWork (react-dom.development.js:19124)`,
    code_context: `import React from 'react';

export function PaymentHistory({ transactions }) {
  return (
    <div className="payment-history-container">
      <h3 className="section-title">Past Invoices & billing updates</h3>
      <div className="invoice-grid">
        {/* CRASH POINT BELOW: */}
        {transactions.map(tx => (
          <div key={tx.id} className="invoice-row">
            <span>Invoice #{tx.id}</span>
            <span>{tx.amount} — {tx.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}`
  },
  {
    id: "express-double-send",
    name: "Server Crash (Headers Already Sent)",
    shortDescription: "A typical full-stack bug where response streams are executed twice.",
    badge: "Express / Node",
    bug_report: "Our authorization server crashes intermittently. It seems that whenever a user types in incorrect password characters twice, the server completely goes offline and all logged-in workers get disconnected with a Gateway error.",
    logs: `Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
    at ServerResponse.setHeader (_http_outgoing.js:561:11)
    at ServerResponse.writeHead (_http_outgoing.js:591:21)
    at ServerResponse.status (express/lib/response.js:101:10)
    at /controllers/auth.ts:24:18
    at processTicksAndRejections (node:internal/process/task_queues:95:5)`,
    code_context: `app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await db.findUser(username);
  
  if (!user) {
    res.status(404).json({ error: 'No user found with the given ID' });
  }

  const isValid = await verifyPassword(password, user?.hash);
  if (!isValid) {
    res.status(401).json({ error: 'Incorrect credential structure' });
  }

  // Crash occurs if either condition above is met because res.json runs anyway!
  res.json({ token: generateToken(user), user });
});`
  },
  {
    id: "infinite-depth-mem",
    name: "In-Browser Lag (Infinite Hook Re-render)",
    shortDescription: "Memory strain caused by unintentional state changes inside a useEffect callback.",
    badge: "React Hooks",
    bug_report: "Users are reporting severe slowdowns when they open the admin workspace panel. Laptop fans start spinning at maximum speed, CPU core temperatures spike to 95°C, and Chrome eventually crashes with an 'Out of Memory' status code.",
    logs: `Warning: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.`,
    code_context: `import { useState, useEffect } from 'react';

export function UserDashboard() {
  const [userData, setUserData] = useState([]);
  const [filters, setFilters] = useState({ role: 'member' });

  useEffect(() => {
    fetch(\`/api/users?role=\${filters.role}\`)
      .then(res => res.json())
      .then(data => {
        setUserData(data);
        // Infinite re-fetch triggers here because filters is a new object reference!
        setFilters({ role: 'member' }); 
      });
  }, [filters]);

  return (
    <div className="dashboard-view">
      <h4>{userData ? userData.length : 0} Live Members</h4>
    </div>
  );
}`
  }
];
