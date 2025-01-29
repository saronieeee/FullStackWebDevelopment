/*
#######################################################################
#
# Copyright (C) 2020-2025  David C. Harrison. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
#######################################################################
*/

import {useState} from 'react';
import Box from '@mui/material/Box';
import AppBar from './components/AppBar';
import NavBar from './components/NavBar';
import Content from './components/Content';

/**
 * Simple component with no state.
 *
 * See the basic-react from lecture for an example of adding and
 * reacting to changes in state.
 * @returns {object} JSX
 */
function App() {
  const [currentMailbox, setCurrentMailbox] = useState('Inbox');
  return (
    <Box display="grid" gridTemplateColumns="repeat(12,1fr)" gap={2}>
      <Box gridColumn="span 12">
        <AppBar mailbox={currentMailbox} />
      </Box>
      <Box gridColumn="span 2">
        <NavBar onMailboxSelect={setCurrentMailbox}
          currentMailbox={currentMailbox} />
      </Box>
      <Box gridColumn="span 10">
        <Content mailboxName={currentMailbox} />
      </Box>
    </Box>
  );
}

export default App;
