module.exports = class ConfirmSignUpPage {
  constructor(page) {
    this.page = page

    // Locators
    this.confirmationCode = page.getByTestId(
      'confirm-sign-up-confirmation-code-input'
    )
    this.confirm = page.getByTestId('confirm-sign-up-confirm-button')
  }
}
