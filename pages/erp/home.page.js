const TabBar = require('../../page-objects/tabbar.page')

module.exports = class HomePage {
  constructor(page) {
    this.page = page
    this.tabBar = new TabBar(page)

    // Locators
  }

  async goToWorkDaysPage() {
    await this.tabBar.myStuff.click()
    await this.tabBar.myWorkDays.click()
  }
}
