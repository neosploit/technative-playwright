module.exports = class LoginPage {
  constructor(page) {
    this.page = page

    // Locators
    this.username = page.locator('#username')
    this.password = page.locator('#password')
    this.signIn = page.getByText('Sign in')
  }
}
