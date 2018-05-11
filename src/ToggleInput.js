import React, { Component } from 'react'

class ToggleInput extends Component {

  constructor(props) {
    super(props)

    this.state = {
      value: 1
    }

    this.decreaseValue = this.decreaseValue.bind(this);
    this.increaseValue = this.increaseValue.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  decreaseValue() {
    // can set to use props minVal later
    if (this.state.value <= 1) return false
    this.setState({
      value: this.state.value - 1
    })
  }

  increaseValue() {
    // can set to use props maxVal later
    if (this.state.value >= 20) return false
    this.setState({
      value: this.state.value + 1
    })
  }

  handleInputChange(e) {
    let value = e.target.value
    if (value <= 0) value = 1
    if (value >= 20) value = 20
    this.setState({
      value
    })
  }

  render() {
    return (
      <div className="input-group control-input">
        <label>{this.props.label}</label>
        <div>
          <button type="button" onClick={this.decreaseValue} data-type="minus" data-field="price">
            <span className="ic icon-minus"></span>
          </button>
          <input type="text" value={this.state.value} onChange={this.handleInputChange} name="price" ref="inputValue" className="form-control input-number" />
          <button type="button" onClick={this.increaseValue} data-type="plus" data-field="price">
              <span className="ic icon-plus"></span>
          </button>
        </div>
      </div>
    )
  }
}

export default ToggleInput
