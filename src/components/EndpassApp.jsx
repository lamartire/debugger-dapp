import React from 'react'
import Connect from '@endpass/connect'

import { withStyles } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'

import AuthForm from './AuthForm'
import EndpassForm from './EndpassForm'
import styles from '../styles'

class EndpassApp extends React.Component {
  constructor(props) {
    super(props)

    this.connect = new Connect({
      // appUrl: 'https://auth.endpass.com',
      appUrl: 'http://localhost:5000'
    })
    this.state = {
      form: {
        from: '',
        message: '',
        signature: '',
      },
      accounts: [],
      currentId: 1,
      authorized: null,
      error: null,
    }

    this.errorNotification = this.errorNotification.bind(this)
    this.sign = this.sign.bind(this)
    this.signTypedData = this.signTypedData.bind(this)
    this.personalSign = this.personalSign.bind(this)
    this.recover = this.recover.bind(this)
    this.requestAccount = this.requestAccount.bind(this)
    this.onClickSignInButton = this.onClickSignInButton.bind(this)
    this.onClickSignOutButton = this.onClickSignOutButton.bind(this)

    this.onChangeEndpassForm = this.onChangeEndpassForm.bind(this)
  }

  componentDidMount() {
    this.getAccountDataAndInjectWeb3()
  }

  async getAccountDataAndInjectWeb3() {
    try {
      const { activeAccount, activeNet } = await this.connect.getAccountData()
      
      this.connect.injectWeb3()
      this.connect.sendSettings({
        selectedAddress: activeAccount, 
        networkVersion: activeNet
      })

      this.setState({
        ...this.state,
        authorized: true,
        accounts: [activeAccount],
        form: {
          ...this.state.form,
          from: activeAccount
        }
      })
    } catch (err) {
      this.setState({
        ...this.state,
        authorized: false,
        accounts: [],
        accountData: null,
      })
    }
  }

  isNewWeb3() {
    return !Array.isArray(window.web3.accounts)
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
    ;(window.ethereum || window.web3.currentProvider).sendAsync(
      {
        id: currentId,
        jsonrpc: '2.0',
        method,
        params,
      },
      callback,
    )
  }

  recover() {
    const { message, signature } = this.state.form

    this.makeRequest(
      'personal_ecRecover',
      [message, signature],
      (err, { result }) => {
        if (err) {
          this.errorNotification()
          console.error(err)
          return
        }

        alert(`Address verified. Recovered address: ${result}`)
      },
    )
  }

  sign() {
    const { from, message } = this.state.form

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
      },
    )
  }

  signTypedData() {
    const { from } = this.state
    const typedData = [
      {
        type: 'string',
        name: 'Message',
        value: 'Hi, Alice!',
      },
      {
        type: 'uint32',
        name: 'A number',
        value: '1337',
      },
    ]

    this.setState({
      ...this.state,
      form: {
        ...this.state.form,
        message: JSON.stringify(typedData, null, 2),
      },
    })

    this.makeRequest('eth_signTypedData', [typedData, from], (err, res) => {
      if (err) {
        this.errorNotification()
        console.error(err)
        return
      }

      this.setState(state => ({
        ...state,
        form: {
          ...state.form,
          signature: res.result,
        },
      }))
    })
  }

  personalSign() {
    const { form } = this.state
    const isNewWeb3 = this.isNewWeb3()
    const params = [
      form.from,
      `0x${Buffer.from(form.message, 'utf8').toString('hex')}`,
    ]

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
          form: {
            ...state.form,
            signature: result,
          },
        }))
      },
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
        form: {
          ...state.form,
          from: result[0],
        },
      }))
    })
  }

  onChangeEndpassForm(data) {
    this.setState({
      ...this.state,
      form: {
        ...this.state.form,
        ...data,
      },
    })
  }

  async onClickSignInButton() {
    try {
      await this.connect.auth()
      await this.getAccountDataAndInjectWeb3()

      this.setState({
        ...this.state,
        error: null,
      })
    } catch (err) {
      this.setState({
        ...this.state,
        error: err.toString(),
      })
    }
  }

  async onClickSignOutButton() {
    try {
      await this.connect.logout()

      this.setState({
        ...this.state,
        form: {
          from: '',
          message: '',
          signature: '',
        },
        authorized: false,
        accountData: null,
      })
    } catch (err) {
      this.setState({
        ...this.state,
        error: err.toString(),
      })
    }
  }

  renderContent() {
    const { authorized, form, message, signature, accounts } = this.state
    const { classes } = this.props

    if (authorized === null) {
      return (
        <div className={classes.loader}>
          <CircularProgress />
        </div>
      )
    }

    return (
      <div>
        {authorized ? (
          <EndpassForm
            form={form}
            message={message}
            signature={signature}
            accounts={accounts}
            onSign={this.sign}
            onSignTypedData={this.signTypedData}
            onRecover={this.recover}
            onPresonalSign={this.personalSign}
            onRequestAccount={this.requestAccount}
            onSignOut={this.onClickSignOutButton}
            onChange={this.onChangeEndpassForm}
          />
        ) : (
          <AuthForm onSignIn={this.onClickSignInButton} />
        )}
      </div>
    )
  }

  render() {
    const { error } = this.state
    const { classes } = this.props

    return (
      <div>
        {error && (
          <Typography className={classes.row} color="error" variant="caption">
            {error}
          </Typography>
        )}
        {this.renderContent()}
      </div>
    )
  }
}

export default withStyles(styles)(EndpassApp)
