# flaneur-mailjet-client

A wrapper for sending transactional emails via the MJML format.

## Getting Started

### Prerequisites

You should have recent versions of `node` & `npm` installed.

You should have a valid Mailjet account. For tests to pass, please setup the following environment variables:

* `MJ_FLANEUR_APIKEY_PUBLIC`
* `MJ_FLANEUR_APIKEY_PRIVATE`

And the following custom fields:

* `MJ_FLANEUR_TEST_FROM_EMAIL`
* `MJ_FLANEUR_TEST_DESTINATION_EMAIL`
* `MJ_FLANEUR_TEST_ERROR_REPORTING_EMAIL`
