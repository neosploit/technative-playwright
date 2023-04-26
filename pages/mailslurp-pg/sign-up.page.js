module.exports = class SignUpPage {
  constructor(page) {
    this.page = page

    // Locators
    this.emailAddress = page.locator('[name="email"]')
    this.password = page.locator('[name="password"]')
    this.createAccount = page.getByTestId('sign-up-create-account-button')
  }
}
