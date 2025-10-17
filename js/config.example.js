// Configuration file template for API keys and secrets
// Copy this file to config.js and replace the placeholder values with your actual keys

const CONFIG = {
  web3forms: {
    accessKey: 'YOUR_ACCESS_KEY_HERE', // Get your access key from https://web3forms.com
  },
};

// Export for use in other modules
/* eslint-disable no-undef */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
/* eslint-enable no-undef */
