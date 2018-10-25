import React, { Component, Fragment } from 'react'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      from: '',
      message: '',
      signature: '',
      accounts: [],
      error: false,
    }
    this.checkWeb3 = this.checkWeb3.bind(this)
    this.errorNotification = this.errorNotification.bind(this)
    this.sign = this.sign.bind(this)
    this.personalSign = this.personalSign.bind(this)
    this.verify = this.verify.bind(this)
    this.reset = this.reset.bind(this)
    this.requestAccount = this.requestAccount.bind(this)
  }

  unsafe_componentWillMount() {
    Notification.requestPermission()

    this.checkWeb3()
  }

  checkWeb3() {
    if (!window.web3) {
      this.setState({
        ...this.state,
        error: true,
      })
      return
    }

    if (web3.eth.accounts.length === 0) {
      console.info(
        'Your web3 has not any accounts. Enter some manually or request it.'
      )
      return
    }

    this.setState({
      ...this.state,
      accounts: web3.eth.accounts || [],
    })
  }

  errorNotification() {
    /* eslint-disable */
    new Notification('Action denied', {
      body: 'An error occured, see console for more details',
    })
    /* eslint-enable */
  }

  verify() {
    const { message, signature } = this.state

    web3.currentProvider.sendAsync(
      {
        method: 'personal_ecRecover',
        params: [message, signature],
      },
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

    web3.currentProvider.sendAsync(
      {
        method: 'eth_sign',
        params: [from, `0x${Buffer.from(message, 'utf8').toString('hex')}`],
      },
      (err, { result }) => {
        if (err) {
          this.errorNotification()
          console.error(err)
          return
        }

        this.setState({
          ...this.state,
          signature: result,
        })
      }
    )
  }

  personalSign() {
    const { from, message } = this.state

    web3.currentProvider.sendAsync(
      {
        method: 'personal_sign',
        params: [from, `0x${Buffer.from(message, 'utf8').toString('hex')}`],
      },
      (err, { result }) => {
        if (err) {
          this.errorNotification()
          console.error(err)
          return
        }

        this.setState({
          ...this.state,
          signature: result,
        })
      }
    )
  }

  requestAccount() {
    web3.currentProvider.sendAsync(
      {
        method: 'eth_accounts',
        params: [],
      },
      (err, { result }) => {
        if (err) {
          this.errorNotification()
          console.error(err)
          return
        }

        this.setState({
          ...this.state,
          accounts: result,
          from: result[0],
        })
      }
    )
  }

  reset() {
    this.setState({
      ...this.state,
      message: '',
      signature: '',
    })
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
    )
  }

  renderSignForm() {
    const { from, message, signature } = this.state

    return (
      <Fragment>
        <h1>Sign</h1>
        <section>{this.renderAccountsSelect()}</section>
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
    const { error } = this.state

    return (
      <div className="dapp">
        {error ? this.renderWeb3Error() : this.renderSignForm()}
      </div>
    )
  }
}

export default App
