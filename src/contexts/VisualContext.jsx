import {createContext, useContext, useState, useEffect} from 'react';
import PropTypes from 'prop-types';

const VisualContext = createContext();

/**
 * Provider component for managing mobile and desktop view states
 * @param {object} props - Component properties
 * @param {object} props.children - wrap with the provider
 * @returns {object} Provider component that manages visual state
 */
export function VisualProvider({children}) {
  const [isMobile, setIsMobile] = useState(false);
  const [isEmailVisible, setIsEmailVisible] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);

  // Handle screen resize and set mobile state
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Standard mobile breakpoint
    };

    // Initial check
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleEmailSelection = (email) => {
    setSelectedEmail(email);
    if (isMobile) {
      setIsEmailVisible(true);
    }
  };

  const closeEmail = () => {
    if (isMobile) {
      setIsEmailVisible(false);
    }
    setSelectedEmail(null);
  };

  return (
    <VisualContext.Provider value={{
      isMobile,
      isEmailVisible,
      selectedEmail,
      handleEmailSelection,
      closeEmail,
    }}>
      {children}
    </VisualContext.Provider>
  );
}

export const useVisual = () => useContext(VisualContext);

VisualProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
