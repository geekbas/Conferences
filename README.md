# Conferences

This is a system for keeping track of academic conferences and workshops.
Even within a limited research field, there are often several conferences to select from.
Sometimes the periods between submission and notification overlap, making it non-obvious where and when to submit a paper.
It is of course also not possible to attend more than one conference at a time, which could affect where to submit and where to attend.

## Use cases

* Track a conference or workshop.
* Find a fitting venue for new papers, and see where they could be resubmitted if rejected.
* Register a paper as submitted to a CFP.

## Model

* The main concept is a conference, which has instances one or more years.
* Each conference instance is optionally connected to workshop instances. The connection is on instance level and not on the top level, as the same workshop may be connected to different conferences over the years (e.g. [DEBS](https://debs.org/debs-conferences)).
* For each instance there is a Call For Papers (CFP), with one or more alternatives (typically research and industry), with different deadlines, page limits and other requirements.
* Each CFP has a list of topics and a committee with a list of members.
* Just about everything should have a user specific freeform note field.

Maybe the topics should be possible to relate in a hierarchy or in some other way.

## Architecture

* Backend in [node.js](https://nodejs.org).
* Probably a [React](https://reactjs.org) frontend.
* Nicer HTML using [Bootstrap](http://getbootstrap.com).

## Open questions

* How should tracking notification be done? Some sort of event queue?
* What is the semantics for conferences with multiple submission dates?

## Environment variables

Some environment variables must be set.
For development, this can be done in the IntelliJ run configuration.
For deployment at Heroku, use "heroku config:set".

* BASE_URL: The base url, e.g. http://example.com/
* GOOGLE_AUTH_CLIENT_ID
* GOOGLE_AUTH_CLIENT_SECRET
* DATABASE_URL: The Postgres database, e.g. postgres://conf@localhost:5432/confs
