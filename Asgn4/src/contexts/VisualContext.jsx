import {createContext, useContext, useState, useEffect} from 'react';
import PropTypes from 'prop-types';

const VisualContext = createContext();

VisualProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Provider component for managing mobile and desktop view states
 * @param {object} props - Component properties
 * @param {object} props.children - components to wrap with the provider
 * @returns {object} Provider component that manages visual state
 */
export function VisualProvider({children}) {
  const [isMobile, setIsMobile] = useState(false);
  const [isEmailVisible, setIsEmailVisible] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [currentMailbox, setCurrentMailbox] = useState('Inbox');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleEmailSelection = (email) => {
    setSelectedEmail(email);
    if (isMobile) {
      setIsEmailVisible(true);
      setIsMenuVisible(false);
    }
  };

  const closeEmail = () => {
    if (isMobile) {
      setIsEmailVisible(false);
    }
    setSelectedEmail(null);
  };

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
    if (isMobile && isEmailVisible) {
      setIsEmailVisible(false);
    }
  };

  return (
    <VisualContext.Provider value={{
      isMobile,
      isEmailVisible,
      selectedEmail,
      isMenuVisible,
      currentMailbox,
      handleEmailSelection,
      closeEmail,
      toggleMenu,
      setCurrentMailbox,
    }}>
      {children}
    </VisualContext.Provider>
  );
}

/**
 * Hook to access the visual context
 * @returns {object} The visual context value
 */
export const useVisual = () => useContext(VisualContext);
