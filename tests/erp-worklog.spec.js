const { test, expect } = require('@playwright/test')
const { faker } = require('@faker-js/faker')

const flow = {
  emailAddress: process.env.CODESEED_EMAIL,
  password: process.env.CODESEED_PASSWORD,
  worklog: [
    {
      date: '20-03-2023',
      hapinessScale: 5,
      hours: 8,
      work: faker.lorem.sentence(faker.datatype.number({ min: 3, max: 10 })),
      onCall: false,
      personalNotes: 'ALLH MIA VARETH MERA STH DOULEIA',
    },
    {
      date: '21-03-2023',
      hapinessScale: 4,
      hours: 8,
      work: [...Array(faker.datatype.number({ min: 1, max: 6 })).keys()]
        .map((_) => `MOBAPP-${faker.datatype.number({ min: 100, max: 999 })}`)
        .join(', '),
      onCall: false,
      personalNotes: 'ALLH MIA VARETH MERA STH DOULEIA (2)',
    },
    {
      date: '22-03-2023',
      hapinessScale: 3,
      hours: 8,
      work: [...Array(faker.datatype.number({ min: 1, max: 6 })).keys()]
        .map((_) => `MOBAPP-${faker.datatype.number({ min: 100, max: 999 })}`)
        .join(', '),
      onCall: false,
      personalNotes: 'ALLH MIA VARETH MERA STH DOULEIA (3)',
    },
  ],
  // worklog: {
  //   '20-03-2023': {
  //     hapinessScale: 5,
  //     hours: 7,
  //     work: faker.lorem.sentence(faker.datatype.number({ min: 3, max: 10 })),
  //     onCall: false,
  //     personalNotes: 'ALLH MIA VARETH MERA STH DOULEIA',
  //   },
  //   '21-03-2023': {
  //     hapinessScale: 4,
  //     hours: 6,
  //     work: [...Array(faker.datatype.number({ min: 1, max: 6 })).keys()]
  //       .map((_) => `MOBAPP-${faker.datatype.number({ min: 100, max: 999 })}`)
  //       .join(', '),
  //     onCall: false,
  //     personalNotes: 'ALLH MIA VARETH MERA STH DOULEIA (2)',
  //   },
  //   '22-03-2023': {
  //     hapinessScale: 3,
  //     hours: 7,
  //     work: [...Array(faker.datatype.number({ min: 1, max: 6 })).keys()]
  //       .map((_) => `MOBAPP-${faker.datatype.number({ min: 100, max: 999 })}`)
  //       .join(', '),
  //     onCall: false,
  //     personalNotes: 'ALLH MIA VARETH MERA STH DOULEIA (3)',
  //   },
  // },
}

let context, page

test.beforeAll(async ({ browser }, testInfo) => {
  context = await browser.newContext(
    process.env.SESSION_ID
      ? {
          storageState: {
            cookies: [
              {
                name: 'PHPSESSID',
                value: process.env.SESSION_ID,
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
})

test('login', async ({}, testInfo) => {
  test.skip(!!process.env.SESSION_ID)
  testInfo.setTimeout(120000)

  await test.step('navigate to login page', async () => {
    await page.goto('/login')
    await expect(page).toHaveTitle('ERP')
  })

  await test.step('fill in login credentials and click to sign in', async () => {
    await page.locator('#username').fill(flow.emailAddress)
    await page.locator('#password').fill(flow.password)
    await page.getByText('Sign in').click()
  })

  await test.step('perform 2FA check', async () => {
    await page.waitForURL('/2fa')
    // User should manually perform the 2FA check
    await page.waitForURL('/employee/my-profile', { timeout: 120000 })
  })
})

test('worklog', async () => {
  await test.step('navigate to worklog page', async () => {
    await page.goto('/employee/my-profile')
    await page.locator('#menumystuff').click()
    await page.locator('a[href="/employee/worklog"]').click()
    await page.waitForURL('/employee/worklog')
  })

  await test.step('fill worklog', async () => {
    // Gia to worklog se morfh object:
    // for (const [date, workday] of Object.entries(flow.worklog)) {
    //   const row = page.locator('tbody tr.vert-align', { hasText: date })
    for (const workday of flow.worklog) {
      const row = page.locator('tbody tr.vert-align', { hasText: workday.date })
      await row.getByRole('link', { name: 'Edit' }).click()
      await page.waitForURL(/\/worklog\/\d+\/edit$/)

      await page.locator(`span[data-rating="${workday.hapinessScale}"]`).click()
      await page.locator('.workday-hours').evaluate((el, hours) => {
        el.value = hours.toString()
      }, workday.hours)
      await page.getByPlaceholder('What did you work on?').fill(workday.work)
      if (workday.onCall) {
        await page.getByLabel('On call').check()
      }
      await page.locator('#workday_notes').fill(workday.personalNotes)

      await page.locator('button[type="submit"]').click()
      await page.locator('div.alert-success').waitFor()
      await page.getByRole('link', { name: 'Back to my workdays' }).click()
    }
  })
})
