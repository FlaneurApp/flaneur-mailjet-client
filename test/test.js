const FlaneurMailer = require('../flaneur-mailer')
const chai = require('chai')
const chaiAsPromised = require("chai-as-promised")
const Chance = require('chance')
const chance = new Chance()

chai.use(chaiAsPromised);
chai.should();

const myTemplateName = 'flaneur-mailjet-client-template'
let myTemplateID = undefined

const filterWithTemplateName = function(array, templateName) {
  return array.filter((template) => {
    return template.Name === templateName
  })
}

describe('FlaneurMailer', function() {
  let flaneurMailer = null;

  beforeEach(function() {
    flaneurMailer = new FlaneurMailer(
      process.env.MJ_FLANEUR_APIKEY_PUBLIC,
      process.env.MJ_FLANEUR_APIKEY_PRIVATE
    );
  });

  describe('#templates', function() {
    it('should create/update/send/delete templates OK', function(done) {
      this.timeout(15000)
      flaneurMailer.listMyTemplates(false)
      .then((templates) => {
        // We shouldn't find our template name here
        filterWithTemplateName(templates, myTemplateName).should.be.empty
        return
      })
      .then(() => {
        // Let's create a template
        return flaneurMailer.createNewTemplate(myTemplateName)
      })
      .then(() => {
        // Let's list the templates again
        return flaneurMailer.listMyTemplates(false)
      })
      .then((templates) => {
        // This time, we should find it
        const myTemplates = filterWithTemplateName(templates, myTemplateName)
        myTemplates.should.have.lengthOf(1)
        myTemplateID = myTemplates[0].ID
        myTemplateID.should.not.be.null
        return myTemplateID
      })
      .then((templateID) => {
        // Now, we update this new template with MJML
        return flaneurMailer.updateTemplate(templateID, 'resources/mocha-test.mjml')
      })
      .then((templateID) => {
        // And we send a campaign
        const emailsVars = {
          name: "World"
        }

        const randomSentence = chance.sentence({words: 3})
        return flaneurMailer.sendTemplate(
          templateID,
          process.env.MJ_FLANEUR_TEST_FROM_EMAIL,
          'flaneur-mailer',
          'flaneur-mailer Mocha test',
          emailsVars,
          [{
            Email: process.env.MJ_FLANEUR_TEST_DESTINATION_EMAIL,
            Vars: {
              name: "Mick"
            }
          }],
          process.env.MJ_FLANEUR_TEST_ERROR_REPORTING_EMAIL
        )
      })
      .then((sendResults) => {
        sendResults.should.be.an('array')
        sendResults.should.not.be.empty
        sendResults[0].should.have.property('Email')
        sendResults[0].should.have.property('MessageID')
        return
      })
      .then(() => {
        return flaneurMailer.deleteTemplate(myTemplateID)
      })
      .then((deleteSuccess) => {
        deleteSuccess.should.be.true
        return deleteSuccess
      })
      .should.eventually.be.true.notify(done)
    })
  })
})
