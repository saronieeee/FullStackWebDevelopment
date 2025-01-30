import {useState} from 'react';
import Box from '@mui/material/Box';
import AppBar from './components/AppBar';
import NavBar from './components/NavBar';
import Content from './components/Content';
import {VisualProvider} from './contexts/VisualContext';

/**
 * Main App component
 * @returns {object} The rendered App component
 */
function App() {
  const [currentMailbox, setCurrentMailbox] = useState('Inbox');

  return (
    <VisualProvider>
      <Box sx={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
        <AppBar mailbox={currentMailbox} />
        <Box sx={{
          display: 'flex',
          flexGrow: 1,
          overflow: 'hidden',
        }}>
          <NavBar
            onMailboxSelect={setCurrentMailbox}
            currentMailbox={currentMailbox}
          />
          <Box sx={{flexGrow: 1}}>
            <Content mailboxName={currentMailbox} />
          </Box>
        </Box>
      </Box>
    </VisualProvider>
  );
}

export default App;
