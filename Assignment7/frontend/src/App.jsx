import React, {createContext, useContext, useState, useEffect}
  from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

/* ======= Visual Context ======= */
/**
 * @typedef {object} VisualContextType
 * @property {string} currentMailbox - The currently selected mailbox.
 * @property {function(string): void} setCurrentMailbox - Update mailbox.
 * @property {object|null} selectedEmail - The currently selected email.
 * @property {function(object): void} handleEmailSelection - Select an email.
 * @property {function(object): void} handleDelete - Delete an email.
 * @property {Array} emails - Array of emails.
 * @property {Array} mailboxes - Array of available mailbox names.
 */
const VisualContext = createContext({});

/**
 * VisualProvider fetches mailbox names and emails from the backend.
 * It also implements deletion by moving an email to Trash.
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Child components.
 * @returns {React.ReactElement} Provider wrapping children.
 */
function VisualProvider({children}) {
  // Start with Inbox selected.
  const [currentMailbox, setCurrentMailbox] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [emails, setEmails] = useState([]);
  const [mailboxes, setMailboxes] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3010/api/v0/mailbox')
        .then((response) => setMailboxes(response.data))
        .catch((error) => console.error(
            'Error fetching mailboxes:', error));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:3010/api/v0/mail', {
      params: {mailbox: currentMailbox},
    }).then((response) => {
      setEmails(response.data);
      if (response.data.length > 0) {
        setSelectedEmail(response.data[0]);
      } else {
        setSelectedEmail(null);
      }
    }).catch((error) => console.error(
        'Error fetching emails:', error));
  }, [currentMailbox]);

  const handleEmailSelection = (email) => {
    setSelectedEmail(email);
  };

  const handleDelete = (email) => {
    if (currentMailbox.toLowerCase() === 'trash') {
      console.error('Cannot delete email from Trash.');
      return;
    }
    axios.put(`http://localhost:3010/api/v0/mail/${email.id}`, null, {
      params: {mailbox: 'Trash'},
    }).then(() => {
      setEmails((prev) => prev.filter((e) => e.id !== email.id));
      if (selectedEmail && selectedEmail.id === email.id) {
        setSelectedEmail(null);
      }
    }).catch((error) => console.error(
        'Error deleting email:', error));
  };

  return (
    <VisualContext.Provider
      value={{
        currentMailbox,
        setCurrentMailbox,
        selectedEmail,
        handleEmailSelection,
        handleDelete,
        emails,
        mailboxes,
      }}
    >
      {children}
    </VisualContext.Provider>
  );
}

VisualProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

const useVisual = () => useContext(VisualContext);

/* ======= Helper Functions ======= */
/**
 * Capitalizes the first letter of a string.
 * @param {string} str - The string to capitalize.
 * @returns {string} The capitalized string.
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formats a date string as "Mon DD" (e.g. "Jun 27").
 * @param {string} dateStr - The ISO date string.
 * @returns {string} Formatted date.
 */
function formatShortDate(dateStr) {
  const options = {month: 'short', day: '2-digit'};
  return new Date(dateStr)
      .toLocaleDateString('en-US', options);
}

/* ======= MyAppBar Component ======= */
/**
 * MyAppBar renders a header displaying the current mailbox.
 * @returns {React.ReactElement} The rendered header.
 */
function MyAppBar() {
  const {currentMailbox} = useVisual();
  return (
    <header style={{
      backgroundColor: '#eee',
      padding: '10px',
      borderBottom: '1px solid #ccc',
    }}>
      <h1 style={{margin: 0}}>
        CSE186 Full Stack Mail - {capitalize(currentMailbox)}
      </h1>
    </header>
  );
}

/* ======= MyNavBar Component ======= */
/**
 * MyNavBar renders a sidebar for mailbox selection.
 * @returns {React.ReactElement} The rendered sidebar.
 */
function MyNavBar() {
  const {currentMailbox, setCurrentMailbox, mailboxes} = useVisual();
  return (
    <nav style={{
      width: '200px',
      borderRight: '1px solid #ccc',
      padding: '10px',
    }}>
      <h2 style={{marginTop: 0}}>Mailboxes</h2>
      <ul style={{listStyleType: 'none', padding: 0}}>
        {mailboxes.map((mailbox) => (
          <li key={mailbox} style={{marginBottom: '5px'}}>
            <button
              onClick={() => setCurrentMailbox(mailbox)}
              style={{
                width: '100%',
                padding: '5px',
                textAlign: 'left',
                fontWeight: currentMailbox === mailbox ?
                  'bold' : 'normal',
              }}
            >
              {capitalize(mailbox)}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ======= MyContent Component ======= */
/**
 * MyContent renders the email list and details.
 * @returns {React.ReactElement} The rendered content.
 */
function MyContent() {
  const {
    emails,
    selectedEmail,
    handleEmailSelection,
    handleDelete,
    currentMailbox,
  } = useVisual();
  return (
    <main style={{
      flex: 1,
      padding: '10px',
      display: 'flex',
    }}>
      <section style={{width: '50%', overflowY: 'auto'}}>
        <h2>Email List</h2>
        {emails.map((email) => {
          const shortDate = formatShortDate(email.received);
          const deleteLabel =
            currentMailbox.toLowerCase() === 'sent' ?
              `Delete mail to ${email.to.name} sent ${shortDate}` :
              `Delete mail from ${email.from.name} received ${shortDate}`;
          return (
            <div key={email.id}
              onClick={() => handleEmailSelection(email)}
              style={{
                border: '1px solid #ccc',
                padding: '5px',
                marginBottom: '5px',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <div>
                <strong>
                  {currentMailbox.toLowerCase() === 'sent' ?
                    email.to.name :
                    email.from.name}
                </strong> - {email.subject}
              </div>
              <div style={{fontSize: '0.8em'}}>
                {shortDate}
              </div>
              {currentMailbox.toLowerCase() !== 'trash' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(email);
                  }}
                  aria-label={deleteLabel}
                  style={{
                    position: 'absolute',
                    right: '5px',
                    top: '5px',
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          );
        })}
      </section>
      <section style={{width: '50%', paddingLeft: '10px'}}>
        <h2>Email Details</h2>
        {selectedEmail ? (
          <div style={{
            border: '1px solid #ccc',
            padding: '10px',
          }}>
            <div>
              <strong>Subject:</strong> {selectedEmail.subject}
            </div>
            {(() => {
              const detailString =
                currentMailbox.toLowerCase() === 'sent' ?
                  'CSE186 Student to ' +
                    `${selectedEmail.to.name} ` +
                    `(${selectedEmail.to.address})` :
                  `${selectedEmail.from.name} to ` +
                    'CSE186 Student ' +
                    `(${selectedEmail.from.address})`;
              return (
                <div>
                  <strong>
                    {currentMailbox.toLowerCase() === 'sent' ?
                      'To:' :
                      'From:'}
                  </strong>{' '}
                  {detailString}
                </div>
              );
            })()}
            <div>
              <strong>Received:</strong>{' '}
              {new Date(selectedEmail.received)
                  .toLocaleString()}
            </div>
            <div style={{
              marginTop: '10px',
              whiteSpace: 'pre-wrap',
            }}>
              {selectedEmail.content}
            </div>
          </div>
        ) : (
          <p>Select an email to read</p>
        )}
      </section>
    </main>
  );
}

/* ======= Main App Component ======= */
/**
 * Main App renders the entire application.
 * @returns {React.ReactElement} The rendered App.
 */
export default function App() {
  return (
    <VisualProvider>
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <MyAppBar />
        <div style={{display: 'flex', flexGrow: 1}}>
          <MyNavBar />
          <MyContent />
        </div>
      </div>
    </VisualProvider>
  );
}
