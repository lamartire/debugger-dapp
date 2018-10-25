<script>
export default {
  data: () => ({
    from: '',
    message: '',
    signature: '',
    accounts: [],
    error: false,
  }),

  created() {
    Notification.requestPermission()

    this.checkWeb3()
  },

  methods: {
    checkWeb3() {
      const { web3 } = window

      if (!web3) {
        this.error = true
        return
      }

      if (web3.eth.accounts.length === 0) {
        console.info(
          'Your web3 has not any accounts. Enter some manually or request it.'
        )
        return
      }

      this.accounts = web3.eth.accounts || []
    },

    errorNotification() {
      new Notification('Action denied', {
        body: 'An error occured, see console for more details',
      })
    },

    verify() {
      window.web3.currentProvider.sendAsync(
        {
          method: 'personal_ecRecover',
          params: [this.message, this.signature],
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
    },

    sign() {
      window.web3.currentProvider.sendAsync(
        {
          method: 'eth_sign',
          params: [this.from, window.web3.toHex(this.message)],
        },
        (err, { result }) => {
          if (err) {
            this.errorNotification()
            console.error(err)
            return
          }

          this.signature = result
        }
      )
    },

    personalSign() {
      window.web3.currentProvider.sendAsync(
        {
          method: 'personal_sign',
          params: [this.from, window.web3.toHex(this.message)],
        },
        (err, { result }) => {
          if (err) {
            this.errorNotification()
            console.error(err)
            return
          }

          this.signature = result
        }
      )
    },

    requestAccount() {
      window.web3.currentProvider.sendAsync(
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

          this.accounts = result
          this.from = result[0]
        }
      )
    },

    reset() {
      this.message = ''
      this.signature = ''
    },
  },
}
</script>

<template>
  <div class="dapp">
    <template v-if="!error">
      <h1>Sign</h1>
      <section>
        <select
          v-model="from"
          :disabled="accounts.length === 0"
        >
          <option
            value=""
            disabled
          >
            Select account
          </option>
          <option
            v-for="account in accounts"
            :key="account"
            :value="account"
          >
            {{ account }}
          </option>
        </select>
      </section>
      <section>
        <input
          v-model="from"
          type="text"
          placeholder="Or enter it manually"
        >
      </section>
      <section>
        <textarea
          v-model="message"
          :disabled="!from"
          placeholder="Enter message to sign..."
        />
        <textarea
          v-model="signature"
          placeholder="Signed data..."
          readonly
        />
      </section>
      <section>
        <button @click="requestAccount">
          Request account
        </button>
      </section>
      <section>
        <!-- <button
          :disabled="!from || !message"
          @click="sign"
        >
          Sign
        </button> -->
        <button
          :disabled="!from || !message"
          @click="personalSign"
        >
          Personal sign
        </button>
        <button
          :disabled="!signature"
          @click="verify"
        >
          Verify
        </button>
      </section>
      <section>
        <button @click="reset">Reset</button>
      </section>
    </template>
    <h1 v-else>Web3 is not exist, provide it before testing!</h1>
  </div>
</template>

<style>
body {
  font-family: monospace;
  background-color: #efdb21;
}
</style>

<style scoped lang="postcss">
.dapp {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  max-width: 480px;
  padding: 15px;
  border: 1px solid #000;
  text-align: center;
  background-color: #ffec44;
}

.dapp section {
  margin-bottom: 10px;
}

.dapp input,
.dapp select {
  width: 100%;
  box-sizing: border-box;
}

.dapp textarea {
  width: 200px;
  height: 300px;
  resize: none;
}
</style>
