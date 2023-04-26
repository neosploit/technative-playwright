module.exports = class TwoFactorAuthPage {
  constructor(page) {
    this.page = page

    // Locators
    this.authenticationCodeText = page.getByText('Code is')
    this.authenticationCodeInput = page.getByLabel('Authentication Code email')
    this.login = page.getByText('Login')
  }

  async parseAuthenticationCode() {
    const twoFactorText = await this.authenticationCodeText.textContent()
    return twoFactorText.match('\\d+')[0]
  }
}
