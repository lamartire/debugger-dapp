const path = require('path')
const ghPages = require('gh-pages')

console.info('Publishing started! 🚀')

ghPages.publish(path.resolve(__dirname, '../dist'), err => {
  if (err) {
    console.error('Publishing failed! 💥')
    console.error(err)
  } else {
    console.info('Successfully published! ✨')
    console.info(
      `Check result here: https://lamartire.github.io/web3-debugger-dapp/`
    )
  }
})
