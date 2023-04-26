const { test } = require('@playwright/test')
const { faker } = require('@faker-js/faker')
const SignInPage = require('../pages/mailslurp-pg/sign-in.page')
const SignUpPage = require('../pages/mailslurp-pg/sign-up.page')
const ConfirmSignUpPage = require('../pages/mailslurp-pg/confirm-sign-up.page')
const OneSecMail = require('../api/onesecmail')
const HomePage = require('../pages/mailslurp-pg/home.page')

test.describe.configure({ mode: 'serial' })

const flow = {
  credentials: {
    emailAddress: `${faker.internet.userName()}@1secmail.com`,
    password: '111aaa!!!',
  },
}

let context, page
let signInPage, signUpPage, confirmSignUpPage, homePage
let oneSecMailService

test.beforeAll(async ({ browser }, testInfo) => {
  context = await browser.newContext()
  page = await context.newPage()

  signInPage = new SignInPage(page)
  signUpPage = new SignUpPage(page)
  confirmSignUpPage = new ConfirmSignUpPage(page)
  homePage = new HomePage(page)

  oneSecMailService = await OneSecMail.init(flow.credentials.emailAddress)
})

test('register an account', async ({}, testInfo) => {
  await test.step('click on "Create account" button', async () => {
    await page.goto(testInfo.project.use.baseURL)
    await signInPage.createAccount.click()
  })

  await test.step('fill in registration credentials', async () => {
    await signUpPage.emailAddress.fill(flow.credentials.emailAddress)
    await signUpPage.password.fill(flow.credentials.password)
    await signUpPage.createAccount.click()
  })

  await test.step('wait for account verification email', async () => {
    const email = await oneSecMailService.waitForEmail({
      action: 'Email verification',
      emailSubjectKeyboard: 'Please confirm your email address',
    })
    flow.verificationCode = email.body.match(/\d+/)[0]
  })

  await test.step('fill verification code', async () => {
    await confirmSignUpPage.confirmationCode.fill(flow.verificationCode)
    await confirmSignUpPage.confirm.click()
  })
})

test('sign in', async () => {
  await signInPage.emailAddress.fill(flow.credentials.emailAddress)
  await signInPage.password.fill(flow.credentials.password)
  await signInPage.signIn.click()
  await homePage.signOut.waitFor()
})
