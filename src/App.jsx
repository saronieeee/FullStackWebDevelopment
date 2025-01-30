import {useState} from 'react';
import Box from '@mui/material/Box';
import AppBar from './components/AppBar';
import NavBar from './components/NavBar';
import Content from './components/Content';
import {VisualProvider} from './contexts/VisualContext';

/**
 *  @returns {object} The rendered full app
 */
function App() {
  const [currentMailbox, setCurrentMailbox] = useState('Inbox');

  return (
    <VisualProvider>
      <Box display="grid" gridTemplateColumns="repeat(12,1fr)" gap={2}>
        <Box gridColumn="span 12">
          <AppBar mailbox={currentMailbox} />
        </Box>
        <Box gridColumn="span 2">
          <NavBar
            onMailboxSelect={setCurrentMailbox}
            currentMailbox={currentMailbox}
          />
        </Box>
        <Box gridColumn="span 10">
          <Content mailboxName={currentMailbox} />
        </Box>
      </Box>
    </VisualProvider>
  );
}

export default App;
