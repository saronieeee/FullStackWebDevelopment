/*
#######################################################################
#
# Copyright (C) 2020-2025 David C. Harrison. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
#######################################################################
*/
/*
#######################################################################
#######               DO NOT MODIFY THIS FILE               ###########
#######################################################################
*/

import React from 'react';
import Picker from './Picker';
import Entry from './Entry';

/**
 * Simple component with no state.
 */
class App extends React.Component {
  /**
   * Constructor
   * @param {object} props properties
   */
  constructor(props) {
    super(props);
    this.pickerRef = React.createRef();
  }

  /**
   * @returns {object} a <div> containing Picker and Entry components
   */
  render() {
    return (
      <div>
        <Picker ref={this.pickerRef} />
        <Entry pickerRef={this.pickerRef} />
      </div>
    );
  }
}

export default App;

