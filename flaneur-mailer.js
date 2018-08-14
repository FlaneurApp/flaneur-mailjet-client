'use strict';

/**
API Guides: https://dev.mailjet.com/guides/
API Reference: https://dev.mailjet.com/email-api/v3/
Node.js wrapper: https://github.com/mailjet/mailjet-apiv3-nodejs
MJML documentation: https://mjml.io/documentation/
*/
const colors = require('colors/safe');

class FlaneurMailer {
  constructor(mailjetAPIKeyPublic, mailjetAPIKeyPrivate) {
    if (mailjetAPIKeyPublic === undefined || mailjetAPIKeyPrivate === undefined) {
      throw new Error('mailjetAPIKeyPublic and mailjetAPIKeyPrivate must be set')
    }

    this.Mailjet = require('node-mailjet').connect(mailjetAPIKeyPublic, mailjetAPIKeyPrivate)
    this.mjml2html = require('mjml')
  }

  listMyTemplates(verbose = true) {
    const getTemplates = this.Mailjet.get('template')
    return getTemplates.request({Limit: 100})
    .then((result) => {
      result.body.Data.forEach((template) => {
        if (verbose) {
          var color = template.OwnerId === 1 ? colors.gray : colors.green
          console.log(color(`ID: ${template.ID}, Name: ${template.Name}, OwnerID: ${template.OwnerId}, OwnerType: ${template.OwnerType}`))
        }
      })
      return result.body.Data
    })
    .catch((e) => {
      console.error(e.errorMessage)
      throw new Error(e.errorMessage)
    })
  }

  createNewTemplate(templateName) {
    const postTemplate = this.Mailjet.post('template')

    const templateData = {
      'Name': templateName
    }

    return postTemplate.request(templateData)
    .then((result) => {
      return result.body.Data[0]
    })
    .catch((e) => {
      console.error(e)
      throw new Error(e.errorMessage)
    })
  }

  deleteTemplate(templateId) {
    const deleteTemplate = this.Mailjet.delete('template')
    return deleteTemplate.id(templateId).request()
    .then((result) => {
      return true
    })
    .catch((e) => {
      console.error(e.ErrorMessage)
      throw new Error(e)
    })
  }

  updateTemplate(templateId, mjmlTemplatePath) {
    const fs = require('fs')
    const postTemplate = this.Mailjet.post(`template/${templateId}/detailcontent`)

    const content = fs.readFileSync(mjmlTemplatePath).toString()
    const htmlContent = this.mjml2html(content)

    return postTemplate.request({ "Html-part": htmlContent.html })
    .then((result) => {
      return templateId
    })
    .catch((e) => {
      console.error(e.ErrorMessage)
      throw new Error(e.errorMessage)
    })
  }

  sendTemplate(templateId, fromEmail, fromName, subject, vars, recipients, errorReporting) {
    const send = this.Mailjet.post('send')
    const sendOptions = {
      'FromEmail': fromEmail,
      'FromName': fromName,
      'Subject': subject,
      'MJ-TemplateID': templateId,
      'MJ-TemplateLanguage': true,
      'MJ-TemplateErrorReporting': errorReporting,
      'MJ-TemplateErrorDeliver': 'deliver',
      'Vars': vars,
      'Recipients': recipients
    }

    return send.request(sendOptions)
      .then((result) => {
        return result.body.Sent
      })
      .catch((e) => {
        console.error(e)
        throw new Error(e.errorMessage)
      })
  }
}

module.exports = FlaneurMailer
