module.exports = class TabBar {
  constructor(page) {
    this.page = page

    // Locators
    this.myStuff = page.locator('#menumystuff')
    this.myWorkDays = page.locator('a[href="/employee/worklog"]')
  }
}
