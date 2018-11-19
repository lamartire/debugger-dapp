import React, { Component, Fragment } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Input from '@material-ui/core/Input'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'

const styles = theme => ({
  row: {
    marginBottom: theme.spacing.unit,
  },
  card: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translateX(-50%) translateY(-50%)',
    padding: theme.spacing.unit,
    maxWidth: 480,
    margin: `${theme.spacing.unit}px auto`,
  },
  fluid: {
    width: '100%',
  },
  inlineButton: {
    marginLeft: theme.spacing.unit,
  },
})

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
    this.signTypedData = this.signTypedData.bind(this)
    this.personalSign = this.personalSign.bind(this)
    this.verify = this.verify.bind(this)
    this.reset = this.reset.bind(this)
    this.requestAccount = this.requestAccount.bind(this)
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

    if (window.ethereum) {
      window.ethereum.sendAsync(
        {
          id: currentId,
          method,
          params,
        },
        callback,
      )

      this.setState(state => ({
        ...state,
        currentId: state.currentId + 1,
      }))
    } else {
      window.web3.currentProvider.sendAsync(
        {
          id: currentId,
          method,
          params,
        },
        callback,
      )

      this.setState(state => ({
        ...state,
        currentId: state.currentId + 1,
      }))
    }
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
      },
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
      },
    )
  }

  signTypedData() {
    const { from } = this.state

    this.makeRequest(
      'eth_signTypedData',
      [
        JSON.stringify({
          foo: 'bar',
        }),
        from,
      ],
      (err, res) => {
        if (err) {
          this.errorNotification()
          console.error(err)
          return
        }

        console.log(res)

        // this.setState(state => ({
        //   ...state,
        //   signature: result,
        // }))
      },
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
    return (
      <Typography align="center" variant="h4">
        Web3 is not exist, provide it before testing!
      </Typography>
    )
  }

  renderAccountsSelect() {
    const { classes } = this.props
    const { accounts, from } = this.state

    return (
      <Select
        className={classes.fluid}
        value={from}
        disabled={accounts.length === 0}
        onChange={this.onChangeInputByName('from')}
      >
        <MenuItem value="" disabled>
          Select account
        </MenuItem>
        {accounts.map(account => (
          <MenuItem key={account} value={account}>
            {account}
          </MenuItem>
        ))}
      </Select>
    )
  }

  renderSignForm() {
    const { classes } = this.props
    const { from, message, signature } = this.state

    return (
      <Fragment>
        <Typography align="center" variant="h4">
          Debug something
        </Typography>
        {this.renderAccountsSelect()}
        <Grid className={classes.row} container>
          <Grid item xs={6}>
            <Input
              multiline
              rows={5}
              maxRows={5}
              className={classes.fluid}
              disabled={!from}
              value={message}
              placeholder="Enter message to sign..."
              onChange={this.onChangeInputByName('message')}
            />
          </Grid>
          <Grid item xs={6}>
            <Input
              multiline
              rows={5}
              maxRows={5}
              className={classes.fluid}
              value={signature}
              placeholder="Signed data..."
              onChange={this.onChangeInputByName('signature')}
            />
          </Grid>
        </Grid>
        <Button
          className={[classes.fluid, classes.row]}
          color="primary"
          variant="contained"
          onClick={this.requestAccount}
        >
          Request account
        </Button>
        <FormControlLabel
          className={classes.row}
          label="Signing with eth_sign:"
          labelPlacement="start"
          control={
            <Button
              className={classes.inlineButton}
              variant="contained"
              disabled={!from || !message}
              onClick={this.sign}
            >
              Sign
            </Button>
          }
        />
        <FormControlLabel
          className={classes.row}
          label="Signing typed data (eth_signTypedData):"
          labelPlacement="start"
          control={
            <Button
              className={classes.inlineButton}
              variant="contained"
              disabled={!from}
              onClick={this.signTypedData}
            >
              Sign typed data
            </Button>
          }
        />
        <FormControlLabel
          className={classes.row}
          label="Personal signing:"
          labelPlacement="start"
          control={
            <Button
              className={classes.inlineButton}
              variant="contained"
              disabled={!from || !message}
              onClick={this.personalSign}
            >
              Personal sign
            </Button>
          }
        />
        <FormControlLabel
          className={classes.row}
          label="Verify signed message:"
          labelPlacement="start"
          control={
            <Button
              className={classes.inlineButton}
              variant="contained"
              disabled={!signature}
              onClick={this.verify}
            >
              Verify
            </Button>
          }
        />
        <Button
          className={classes.fluid}
          variant="contained"
          onClick={this.reset}
        >
          Reset
        </Button>
      </Fragment>
    )
  }

  render() {
    const { classes } = this.props

    return (
      <Card className={classes.card}>
        {!window.web3 ? this.renderWeb3Error() : this.renderSignForm()}
      </Card>
    )
  }
}

export default withStyles(styles)(App)
