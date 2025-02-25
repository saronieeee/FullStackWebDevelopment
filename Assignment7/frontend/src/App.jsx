import React, {useState, useEffect} from 'react';

/**
 * Main App component that fetches mailbox names and emails from the API.
 * @returns {React.ReactElement} The rendered App component.
 */
function App() {
  const [mailboxes, setMailboxes] = useState([]);
  const [currentMailbox, setCurrentMailbox] = useState('Inbox');
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);

  // Fetch mailbox names on component mount.
  useEffect(() => {
    fetch('/api/v0/mailbox')
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Error fetching mailboxes: ${res.statusText}`);
          }
          return res.json();
        })
        .then((data) => {
          setMailboxes(data);
          if (data.length > 0) {
            setCurrentMailbox(data[0]);
          }
        })
        .catch((err) => {
          console.error(err);
        });
  }, []);

  // Fetch emails whenever the current mailbox changes.
  useEffect(() => {
    if (!currentMailbox) return;
    fetch(`/api/v0/mail?mailbox=${encodeURIComponent(currentMailbox)}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Error fetching emails: ${res.statusText}`);
          }
          return res.json();
        })
        .then((data) => {
          setEmails(data);
          setSelectedEmail(null);
        })
        .catch((err) => {
          console.error(err);
          setEmails([]);
        });
  }, [currentMailbox]);

  return (
    <div>
      <header style={{backgroundColor: '#ddd', padding: '1rem'}}>
        <h1>CSE186 Mail - {currentMailbox}</h1>
      </header>
      <div style={{display: 'flex'}}>
        {/* Sidebar with mailbox names */}
        <nav style={{width: '200px', borderRight: '1px solid #ccc',
          padding: '1rem'}}>
          <ul style={{listStyle: 'none', padding: 0}}>
            {mailboxes.map((mailbox) => (
              <li key={mailbox}>
                <button onClick={() => setCurrentMailbox(mailbox)}>
                  {mailbox}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main content area */}
        <main style={{flex: 1, padding: '1rem'}}>
          <h2>Emails</h2>
          {emails.length === 0 ? (
            <p>No emails to display.</p>
          ) : (
            <ul style={{padding: 0, listStyle: 'none'}}>
              {emails.map((email) => (
                <li key={email.id} style={{marginBottom: '0.5rem'}}>
                  <button onClick={() => setSelectedEmail(email)}>
                    {email.subject} (from {email.from.name})
                  </button>
                </li>
              ))}
            </ul>
          )}

          {selectedEmail && (
            <div style={{border: '1px solid #ccc', padding: '1rem',
              marginTop: '1rem'}}>
              <button onClick={() => setSelectedEmail(null)}>Close</button>
              <h3>{selectedEmail.subject}</h3>
              <p>
                From: {selectedEmail.from.name} &lt;
                {selectedEmail.from.address}&gt;
              </p>
              <p>
                To: {selectedEmail.to.name} &lt;
                {selectedEmail.to.address}&gt;
              </p>
              <p>Received: {selectedEmail.received}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
