module.exports = class WorkLogPage {
  happinessScaleLocator = `span[data-rating="{{HAPPINESS_SCALE}}"]`

  constructor(page) {
    this.page = page

    // Locators
    this.hours = page.locator('.workday-hours')
    this.workedOn = page.getByPlaceholder('What did you work on?')
    this.onCall = page.getByLabel('On call')
    this.personalNotes = page.locator('#workday_notes')
    this.save = page.locator('button[type="submit"]')
    this.editSuccessAlert = page.locator('div.alert-success')
    this.backToWorkDays = page.getByRole('link', {
      name: 'Back to my workdays',
    })
  }

  happinessScale(scale = 5) {
    return this.page.locator(
      this.happinessScaleLocator.replace('{{HAPPINESS_SCALE}}', scale)
    )
  }
}
