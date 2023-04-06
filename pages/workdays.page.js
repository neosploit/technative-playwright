module.exports = class WorkDaysPage {
  workDayLocator = 'tbody tr.vert-align'

  constructor(page) {
    this.page = page

    // Locators
    this.workDayEdit = page.getByRole('link', { name: 'Edit' })
  }

  workDay(date) {
    return this.page.locator(this.workDayLocator, { hasText: date })
  }
}
