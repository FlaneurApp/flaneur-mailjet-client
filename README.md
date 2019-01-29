# flaneur-mailjet-client

A wrapper for sending transactional emails via the MJML format.

## Installation

Use `npm` or `yarn` to install:

    npm install flaneur-mailjet-client
    yarn add flaneur-mailjet-client

## Usage

```js
const FlaneurMailer = require("flaneur-mailjet-client");

const MAILJET_APIKEY_PUBLIC = "foo";
const MAILJET_APIKEY_PRIVATE = "bar";

const mailer = new FlaneurMailer(MAILJET_APIKEY_PUBLIC, MAILJET_APIKEY_PRIVATE);
const templateName = "My template";

mailer
  .listMyTemplates()
  .then(allTemplates => {
    const filter = allTemplates.filter(template => {
      return template.Name === templateName;
    });
    if (filter.length === 1) {
      return filter[0];
    } else if (filter.length > 1) {
      throw new Error(`More than 1 template found with name ${templateName}`);
    } else {
      return undefined;
    }
  })
  .then(template => {
    if (template === undefined) {
      return mailer.createNewTemplate(templateName);
    }
    return template;
  })
  .then(template => {
    return mailer.updateTemplate(
      template.ID,
      "resources/mjml-templates/${templateName}.mjml"
    );
  })
  .then(templateId => {
    return mailer.sendTemplate(
      templateId,
      "from@example.tld",
      "My Name",
      "My Email Subject",
      {
        foo: "bar"
      },
      [
        {
          Email: "to@example.tld",
          Vars: {
            foo: "Hello World"
          }
        }
      ],
      "support@example.tld"
    );
  })
  .then(() => {
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
```

## Contributing

This project uses a `Makefile` for all common tasks ie: 

* `make install`: install dependencies;
* `make test`: run tests;
* `make lint`: check the code style.

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

### Running tests

In order to run tests, you should have the following environment variables set up. Using `.env` is recommended.

* `MJ_FLANEUR_APIKEY_PUBLIC`;
* `MJ_FLANEUR_APIKEY_PRIVATE`;
* `MJ_FLANEUR_TEST_FROM_EMAIL`;
* `MJ_FLANEUR_TEST_DESTINATION_EMAIL`;
* `MJ_FLANEUR_TEST_ERROR_REPORTING_EMAIL`.

## License

[MIT](https://choosealicense.com/licenses/mit/)
