module.exports = class HomePage {
  constructor(page) {
    this.page = page

    // Locators
    this.signOut = page.getByTestId('sign-out-button')
  }
}
