import React from 'react'

import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

import CommonForm from './CommonForm'
import styles from '../styles'

class CommonApp extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      form: {
        from: '',
        message: '',
        signature: '',
      },
      accounts: [],
      currentId: 1,
      error: null,
    }

    this.errorNotification = this.errorNotification.bind(this)
    this.sign = this.sign.bind(this)
    this.signTypedData = this.signTypedData.bind(this)
    this.personalSign = this.personalSign.bind(this)
    this.recover = this.recover.bind(this)
    this.requestAccount = this.requestAccount.bind(this)

    this.onChangeCommonForm = this.onChangeCommonForm.bind(this)
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

  onChangeCommonForm(data) {
    this.setState({
      ...this.state,
      form: {
        ...this.state.form,
        ...data,
      },
    })
  }

  renderContent() {
    const { form, message, signature, accounts } = this.state

    return (
      <div>
        {window.web3 ? (
          <CommonForm
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
            onChange={this.onChangeCommonForm}
          />
        ) : (
          <Typography variant="caption" color="error">
            Provide web3 before testing or reload page if you switched back from
            Endpass mode
          </Typography>
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

export default withStyles(styles)(CommonApp)
