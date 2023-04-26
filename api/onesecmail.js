const { request } = require('@playwright/test')

const ONESECMAIL_URL = 'https://www.1secmail.com/api/v1/'
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

module.exports = class OneSecMail {
  constructor(emailAddress, apiContext) {
    const [username, domain] = emailAddress.split('@')
    this.username = username
    this.domain = domain
    this.apiContext = apiContext
  }

  static async init(emailAddress) {
    const apiContext = await request.newContext({
      baseURL: ONESECMAIL_URL,
    })

    return new OneSecMail(emailAddress, apiContext)
  }

  async fetchMailbox() {
    const response = await this.apiContext.get('', {
      failOnStatusCode: true,
      params: {
        action: 'getMessages',
        login: this.username,
        domain: this.domain,
      },
    })

    return response.json()
  }

  async fetchMessage(id) {
    const response = await this.apiContext.get('', {
      failOnStatusCode: true,
      params: {
        action: 'readMessage',
        login: this.username,
        domain: this.domain,
        id,
      },
    })

    return response.json()
  }

  async waitForEmail({
    action,
    emailSubjectKeyboard,
    ignoredEmailIDs = [],
    maxAttempts = 1,
    interval = 10000,
  }) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await sleep(interval)
      let messages

      // Fetch mailbox from 1secMail
      try {
        messages = await this.fetchMailbox()
      } catch (error) {
        console.error(
          `[Attempt ${attempt}/${maxAttempts}]`,
          `Could not fetch 1secMail messages. Error: ${error}`
        )
        return null
      }

      if (messages.length) {
        const matchedMessage = messages.find(
          ({ id, subject }) =>
            subject.includes(emailSubjectKeyboard) && // WARNING: This won't work for languages other than English. Maybe we should consider filtering the messages by date or context.
            !ignoredEmailIDs.includes(id)
        )

        if (matchedMessage) {
          return this.fetchMessage(matchedMessage.id)
        }
      }

      console.warn(
        `[Attempt ${attempt}/${maxAttempts}]`,
        attempt < maxAttempts
          ? `${action} email was not found. Searching again in ${interval} milliseconds.`
          : `${action} email was not found. Aborting the search.`
      )
    }

    return null
  }
}
