const { test, expect } = require('@playwright/test')
const { faker } = require('@faker-js/faker')
const URLs = require('../data/URLs')
const LoginPage = require('../pages/erp/login.page')
const TwoFactorAuthPage = require('../pages/erp/two-factor-auth.page')
const HomePage = require('../pages/erp/home.page')
const WorkDaysPage = require('../pages/erp/workdays.page')
const WorkLogPage = require('../pages/erp/worklog.page')

test.describe.configure({ mode: 'serial' })

const flow = {
  emailAddress: process.env.CODESEED_EMAIL,
  password: process.env.CODESEED_PASSWORD,
  worklog: [
    {
      date: '24-04-2023',
      happinessScale: 4,
      hours: 8,
      work: faker.lorem.sentence(faker.datatype.number({ min: 3, max: 10 })),
      onCall: false,
      personalNotes: '',
    },
    {
      date: '25-04-2023',
      happinessScale: 4,
      hours: 6,
      work: [...Array(faker.datatype.number({ min: 1, max: 6 })).keys()]
        .map((_) => `MOBAPP-${faker.datatype.number({ min: 100, max: 999 })}`)
        .join(', '),
      onCall: false,
      personalNotes: '',
    },
    {
      date: '26-04-2023',
      happinessScale: 3,
      hours: 8,
      work: [...Array(faker.datatype.number({ min: 1, max: 6 })).keys()]
        .map((_) => `MOBAPP-${faker.datatype.number({ min: 100, max: 999 })}`)
        .join(', '),
      onCall: false,
      personalNotes: '',
    },
  ],
  // worklog: {
  //   '24-04-2023': {
  //     happinessScale: 4,
  //     hours: 8,
  //     work: faker.lorem.sentence(faker.datatype.number({ min: 3, max: 10 })),
  //     onCall: false,
  //     personalNotes: '',
  //   },
  //   '25-04-2023': {
  //     happinessScale: 4,
  //     hours: 6,
  //     work: [...Array(faker.datatype.number({ min: 1, max: 6 })).keys()]
  //       .map((_) => `MOBAPP-${faker.datatype.number({ min: 100, max: 999 })}`)
  //       .join(', '),
  //     onCall: false,
  //     personalNotes: '',
  //   },
  //   '26-04-2023': {
  //     happinessScale: 3,
  //     hours: 8,
  //     work: [...Array(faker.datatype.number({ min: 1, max: 6 })).keys()]
  //       .map((_) => `MOBAPP-${faker.datatype.number({ min: 100, max: 999 })}`)
  //       .join(', '),
  //     onCall: false,
  //     personalNotes: '',
  //   },
  // },
}

let context, page
let loginPage, twoFactorAuthPage, homePage, workDaysPage, workLogPage

test.beforeAll(async ({ browser }, testInfo) => {
  context = await browser.newContext(
    process.env.ERP_SESSION_ID
      ? {
          storageState: {
            cookies: [
              {
                name: 'PHPSESSID',
                value: process.env.ERP_SESSION_ID,
                domain: new URL(testInfo.project.use.baseURL).hostname,
                path: '/',
              },
              {
                name: 'username',
                value: encodeURIComponent(flow.emailAddress),
                domain: new URL(testInfo.project.use.baseURL).hostname,
                path: '/',
              },
            ],
            origins: [],
          },
        }
      : {}
  )
  page = await context.newPage()
  loginPage = new LoginPage(page)
  twoFactorAuthPage = new TwoFactorAuthPage(page)
  homePage = new HomePage(page)
  workDaysPage = new WorkDaysPage(page)
  workLogPage = new WorkLogPage(page)
})

test('login', async ({}, testInfo) => {
  test.skip(!!process.env.ERP_SESSION_ID)
  testInfo.setTimeout(120000)

  await test.step('navigate to login page', async () => {
    await page.goto(URLs.login)
    await expect(page).toHaveTitle('ERP')
  })

  await test.step('fill in login credentials and click to sign in', async () => {
    await loginPage.username.fill(flow.emailAddress)
    await loginPage.password.fill(flow.password)
    await loginPage.signIn.click()
  })

  await test.step('2FA check', async () => {
    if (!testInfo.project.use.baseURL.includes('.acc.')) {
      await page.waitForURL(URLs.twoFactorAuth)
      // User should manually perform the 2FA check
      await page.waitForURL(URLs.myProfile, { timeout: 120000 })
    } else {
      await page.waitForURL(URLs.twoFactorAuth)

      const twoFactorAuthCode =
        await twoFactorAuthPage.parseAuthenticationCode()
      await twoFactorAuthPage.authenticationCodeInput.fill(twoFactorAuthCode)
      await twoFactorAuthPage.login.click()

      await page.waitForURL(URLs.myProfile)
    }
  })
})

test('worklog', async ({}, testInfo) => {
  await test.step('navigate to worklog page', async () => {
    await page.goto(URLs.myProfile)
    await homePage.goToWorkDaysPage()
    await page.waitForURL(URLs.workLog.main)
  })

  await test.step('fill worklog', async () => {
    // Gia to worklog se morfh object:
    // for (const [date, workday] of Object.entries(flow.worklog)) {
    //   const workDay = workDaysPage.workDay(workday.date)
    for (const workday of flow.worklog) {
      const workDay = workDaysPage.workDay(workday.date)
      await workDay.locator(workDaysPage.workDayEdit).click()
      await page.waitForURL(URLs.workLog.edit)

      // Required
      await workLogPage.happinessScale(workday.happinessScale).click()
      await workLogPage.hours.evaluate((el, hours) => {
        el.value = hours.toString()
      }, workday.hours)
      await workLogPage.workedOn.fill(workday.work)

      // Optional
      if (workday.onCall) {
        await workLogPage.onCall.check()
      }
      if (workday.personalNotes) {
        await workLogPage.personalNotes.fill(workday.personalNotes)
      }

      await workLogPage.save.click()
      await workLogPage.editSuccessAlert.waitFor()
      await workLogPage.backToWorkDays.click()
    }
  })
})
