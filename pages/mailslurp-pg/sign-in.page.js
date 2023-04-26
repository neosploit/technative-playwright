module.exports = class SignInPage {
  constructor(page) {
    this.page = page

    // Locators
    this.emailAddress = page.getByTestId('username-input')
    this.password = page.getByTestId('sign-in-password-input')
    this.signIn = page.getByTestId('sign-in-sign-in-button')
    this.createAccount = page.getByTestId('sign-in-create-account-link')
  }
}
