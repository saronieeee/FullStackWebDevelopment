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
import React from 'react';

/**
 * Simple JSX Component
 * @param {*} event
 */
class App extends React.Component {
  state = {
    name: '',
  };
  /**
   * @param {*} props
   */
  constructor(props) {
    super(props);
  }
  /**
   *
   * @return {object} a div containing a label, input, and 1st level header
   */
  render() {
    return (
      <div>
        <label>JSX Name: </label>
        <input
          type="text"
          aria-label="input"
          value={this.state.name}
          onInput={(event) => this.handleInput(event)}
        />
        <h1>Hello {this.state.name}!</h1>
      </div>
    );
  }
  handleInput = (event) => {
    this.setState({name: event.target.value});
  };
}

export default App;
