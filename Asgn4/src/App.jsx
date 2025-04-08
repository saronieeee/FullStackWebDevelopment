import Box from '@mui/material/Box';
import AppBar from './components/AppBar';
import NavBar from './components/NavBar';
import Content from './components/Content';
import {VisualProvider} from './contexts/VisualContext';

/**
 * This component was inspired by the lecture code
 * for creating contexts and using Grid:
 * 08.ReactExternalStateFunctionsHooks
 * Although, instead of Grid, I used Box :)
 */

/**
 * Main App component
 * @returns {object} The rendered App component
 */
export default function App() {
  return (
    <VisualProvider>
      <Box sx={{
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <AppBar />
        <Box sx={{
          display: 'flex',
          flexGrow: 1,
          overflow: 'hidden',
        }}>
          <NavBar />
          <Box sx={{
            flexGrow: 1,
            overflow: 'hidden',
          }}>
            <Content />
          </Box>
        </Box>
      </Box>
    </VisualProvider>
  );
}
