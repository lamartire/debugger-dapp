import React from 'react'

import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'

import EndpassApp from './components/EndpassApp'
import CommonApp from './components/CommonApp'
import styles from './styles'

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      endpassMode: false,
    }
    this.cachedWeb3 = null

    this.onSwitchEndpassMode = this.onSwitchEndpassMode.bind(this)
  }

  onSwitchEndpassMode() {
    const { endpassMode } = this.state

    if (endpassMode) {
      window.web3 = undefined
    }

    this.setState({
      ...this.state,
      endpassMode: !endpassMode,
    })
  }

  render() {
    const { endpassMode } = this.state
    const { classes } = this.props

    return (
      <div className={classes.appWrapper}>
        <Card className={classes.card}>
          <Grid className={classes.row} container>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={endpassMode}
                    onChange={this.onSwitchEndpassMode}
                    color="primary"
                    value="endpassMode"
                  />
                }
                label="Enable Endpass mode"
              />
            </Grid>
          </Grid>
          <Grid container>
            <Grid xs={12} item>
              {endpassMode ? <EndpassApp /> : <CommonApp />}
            </Grid>
          </Grid>
        </Card>
      </div>
    )
  }
}

export default withStyles(styles)(App)
