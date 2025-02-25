import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

/* ======= Visual Context ======= */

/**
 * @typedef {object} VisualContextType
 * @property {string} currentMailbox - The currently selected mailbox.
 * @property {function(string): void} setCurrentMailbox - Update the mailbox.
 * @property {object|null} selectedEmail - The currently selected email.
 * @property {function(object): void} handleEmailSelection - Select an email.
 * @property {Array} emails - Array of emails in the mailbox.
 * @property {Array} mailboxes - Array of available mailbox names.
 */

const VisualContext = createContext(/** @type {VisualContextType} */ ({}));

/**
 * VisualProvider component that provides visual state.
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Child components.
 * @returns {React.ReactElement} The provider wrapping children.
 */
function VisualProvider({children}) {
  const [currentMailbox, setCurrentMailbox] = useState('Inbox');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [emails, setEmails] = useState([]);
  const [mailboxes, setMailboxes] = useState([]);

  // Fetch mailbox names from backend.
  useEffect(() => {
    axios
        .get('http://localhost:3010/api/v0/mailbox')
        .then((response) => setMailboxes(response.data))
        .catch((error) =>
          console.error('Error fetching mailboxes:', error),
        );
  }, []);

  // Fetch emails for the current mailbox.
  useEffect(() => {
    axios
        .get('http://localhost:3010/api/v0/mail', {
          params: {mailbox: currentMailbox},
        })
        .then((response) => {
          setEmails(response.data);
          if (response.data.length > 0) {
            setSelectedEmail(response.data[0]);
          } else {
            setSelectedEmail(null);
          }
        })
        .catch((error) =>
          console.error('Error fetching emails:', error),
        );
  }, [currentMailbox]);

  /**
   * Sets the selected email.
   * @param {object} email - The email object to select.
   */
  const handleEmailSelection = (email) => {
    setSelectedEmail(email);
  };

  return (
    <VisualContext.Provider
      value={{
        currentMailbox,
        setCurrentMailbox,
        selectedEmail,
        handleEmailSelection,
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

/**
 * Hook to access the visual context.
 * @returns {VisualContextType} The visual context value.
 */
const useVisual = () => useContext(VisualContext);

/* ======= MyAppBar Component ======= */

/**
 * MyAppBar renders the application header.
 * @returns {React.ReactElement} The rendered header.
 */
function MyAppBar() {
  const {currentMailbox} = useVisual();
  return (
    <header
      style={{
        backgroundColor: '#eee',
        padding: '10px',
        borderBottom: '1px solid #ccc',
      }}
    >
      <h1 style={{margin: 0}}>CSE186 Mail - {currentMailbox}</h1>
    </header>
  );
}

/* ======= MyNavBar Component ======= */

/**
 * MyNavBar renders the mailbox sidebar.
 * @returns {React.ReactElement} The rendered sidebar.
 */
function MyNavBar() {
  const {currentMailbox, setCurrentMailbox, mailboxes} = useVisual();

  /**
   * Handles clicking on a mailbox.
   * @param {string} mailboxName - The mailbox to select.
   */
  const handleMailboxClick = (mailboxName) => {
    setCurrentMailbox(mailboxName);
  };

  return (
    <nav
      style={{
        width: '200px',
        borderRight: '1px solid #ccc',
        padding: '10px',
      }}
    >
      <h2 style={{marginTop: 0}}>Mailboxes</h2>
      <ul style={{listStyleType: 'none', padding: 0}}>
        {mailboxes.map((mailbox) => (
          <li key={mailbox} style={{marginBottom: '5px'}}>
            <button
              onClick={() => handleMailboxClick(mailbox)}
              style={{
                width: '100%',
                padding: '5px',
                textAlign: 'left',
                fontWeight: currentMailbox === mailbox ? 'bold' : 'normal',
              }}
            >
              {mailbox}
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
  const {emails, selectedEmail, handleEmailSelection} = useVisual();

  /**
   * Formats a date string for list view.
   * @param {string} dateStr - The ISO date string.
   * @returns {string} The formatted date string.
   */
  const formatListDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <main style={{flex: 1, padding: '10px', display: 'flex'}}>
      <section style={{width: '50%', overflowY: 'auto'}}>
        <h2>Email List</h2>
        {emails.map((email) => (
          <div
            key={email.id}
            onClick={() => handleEmailSelection(email)}
            style={{
              border: '1px solid #ccc',
              padding: '5px',
              marginBottom: '5px',
              cursor: 'pointer',
            }}
          >
            <div>
              <strong>From:</strong> {email.from.name}
            </div>
            <div>
              <strong>Subject:</strong> {email.subject}
            </div>
            <div style={{fontSize: '0.8em'}}>
              {formatListDate(email.received)}
            </div>
          </div>
        ))}
      </section>
      <section style={{width: '50%', paddingLeft: '10px'}}>
        <h2>Email Details</h2>
        {selectedEmail ? (
          <div
            style={{
              border: '1px solid #ccc',
              padding: '10px',
            }}
          >
            <div>
              <strong>Subject:</strong> {selectedEmail.subject}
            </div>
            <div>
              <strong>From:</strong> {selectedEmail.from.name} (
              {selectedEmail.from.address})
            </div>
            <div>
              <strong>To:</strong> {selectedEmail.to.name} (
              {selectedEmail.to.address})
            </div>
            <div>
              <strong>Received:</strong>{' '}
              {new Date(selectedEmail.received).toLocaleString()}
            </div>
            <div style={{marginTop: '10px', whiteSpace: 'pre-wrap'}}>
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
 * Main App component that renders the entire application.
 * @returns {React.ReactElement} The rendered App component.
 */
export default function App() {
  return (
    <VisualProvider>
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <MyAppBar />
        <div style={{display: 'flex', flexGrow: 1}}>
          <MyNavBar />
          <MyContent />
        </div>
      </div>
    </VisualProvider>
  );
}
