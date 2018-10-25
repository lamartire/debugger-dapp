import React, { Component, Fragment } from 'react'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      from: '',
      message: '',
      signature: '',
      accounts: [],
      currentId: 1,
    }
    this.errorNotification = this.errorNotification.bind(this)
    this.sign = this.sign.bind(this)
    this.personalSign = this.personalSign.bind(this)
    this.verify = this.verify.bind(this)
    this.reset = this.reset.bind(this)
    this.requestAccount = this.requestAccount.bind(this)
  }

  isNewWeb3() {
    return !Array.isArray(web3.accounts)
  }

  errorNotification() {
    /* eslint-disable */
    new Notification('Action denied', {
      body: 'An error occured, see console for more details',
    })
    /* eslint-enable */
  }

  makeRequest(method, params, callback) {
    const { currentId } = this.state

    web3.currentProvider.sendAsync(
      {
        id: currentId,
        method,
        params,
      },
      callback
    )

    this.setState(state => ({
      ...state,
      currentId: state.currentId + 1,
    }))
  }

  verify() {
    const { message, signature } = this.state

    this.makeRequest(
      'personal_ecRecover',
      [`0x${Buffer.from(message, 'utf8').toString('hex')}`, signature],
      (err, { result }) => {
        if (err) {
          this.errorNotification()
          console.error(err)
          return
        }

        alert(`Recovered address: ${result}`)
      }
    )
  }

  sign() {
    const { from, message } = this.state

    this.makeRequest(
      'eth_sign',
      [from, `0x${Buffer.from(message, 'utf8').toString('hex')}`],
      (err, { result }) => {
        if (err) {
          this.errorNotification()
          console.error(err)
          return
        }

        this.setState(state => ({
          ...state,
          signature: result,
        }))
      }
    )
  }

  personalSign() {
    const { from, message } = this.state
    const isNewWeb3 = this.isNewWeb3()
    const params = [from, `0x${Buffer.from(message, 'utf8').toString('hex')}`]

    this.makeRequest(
      'personal_sign',
      isNewWeb3 ? params.reverse() : params,
      (err, { result }) => {
        if (err) {
          this.errorNotification()
          console.error(err)
          return
        }

        this.setState(state => ({
          ...state,
          signature: result,
        }))
      }
    )
  }

  requestAccount() {
    this.makeRequest('eth_accounts', [], (err, { result }) => {
      if (err) {
        this.errorNotification()
        console.error(err)
        return
      }

      this.setState(state => ({
        ...state,
        accounts: result,
        from: result[0],
      }))
    })
  }

  reset() {
    this.setState(state => ({
      ...state,
      message: '',
      signature: '',
    }))
  }

  onChangeInputByName(name) {
    return e => {
      this.setState({
        ...this.state,
        [name]: e.target.value,
      })
    }
  }

  renderWeb3Error() {
    return <h1>Web3 is not exist, provide it before testing!</h1>
  }

  renderAccountsSelect() {
    const { accounts, from } = this.state

    return (
      <section>
        <select
          value={from}
          disabled={accounts.length === 0}
          onChange={this.onChangeInputByName('from')}
        >
          <option value="" disabled>
            Select account
          </option>
          {accounts.map(account => (
            <option key={account} value={account}>
              {account}
            </option>
          ))}
        </select>
      </section>
    )
  }

  renderSignForm() {
    const { from, message, signature } = this.state

    return (
      <Fragment>
        <h1>Sign</h1>
        {this.renderAccountsSelect()}
        <section>
          <input
            value={from}
            type="text"
            placeholder="Or enter it manually"
            onChange={this.onChangeInputByName('from')}
          />
        </section>
        <section>
          <textarea
            disabled={!from}
            value={message}
            placeholder="Enter message to sign..."
            onChange={this.onChangeInputByName('message')}
          />
          <textarea
            value={signature}
            placeholder="Signed data..."
            onChange={this.onChangeInputByName('signature')}
          />
        </section>
        <section>
          <button onClick={this.requestAccount}>Request account</button>
        </section>
        <section>
          <span>Signing with eth_sign:</span>
          <button disabled={!from || !message} onClick={this.sign}>
            Sign
          </button>
        </section>
        <section>
          <span>Personal signing:</span>
          <button disabled={!from || !message} onClick={this.personalSign}>
            Personal sign
          </button>
          <button disabled={!signature} onClick={this.verify}>
            Verify
          </button>
        </section>
        <section>
          <span>Reset form:</span>
          <button onClick={this.reset}>Reset</button>
        </section>
      </Fragment>
    )
  }

  render() {
    return (
      <div className="dapp">
        {!window.web3 ? this.renderWeb3Error() : this.renderSignForm()}
      </div>
    )
  }
}

export default App
