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
import React from "react";

class App extends React.Component {
  state = {
    name: '',
  };
  constructor(props) {
    super(props); 
    this.onInputChange = this.onInputChange.bind(this);
  }
  onInputChange(event)  {
    this.setState({ name: event.target.value });
  }
  render() {
    return React.createElement('div', null,
      React.createElement('label', null, 'React Name: '),
      React.createElement('input',
        { type: 'text', value: this.state.name, onChange: this.onInputChange}),
      React.createElement('h1', null,
        'Hello ', this.state.name, '!')
      );
  }
}

export default App;
