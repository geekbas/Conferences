# Conferences

System for keeping track of academic conferences and workshops.
Even within a limited research field, there are often several conferences to select from.
Sometimes the periods between submission and notification overlaps, making it non-obvious where and when to submit a paper.
It is of course also not possible to attend more than one conference at a time, which could affect where to submit and where to attend.

## Use cases

* Track a conference or workshop.
* Find a fitting venue for new papers, and see where they could be resubmitted if rejected.
* Track conference or workshop topics.
* Track committee members.
* Register a paper as submitted to a CFP.

It is possible to register information in the system, but a moderator needs to verify it before it becomes available to other users.
This is intended to avoid duplicates.

## Model

* The main concept is a conference, which has instances one or more years.
* Each conference instance is optionally connected to workshop instances. The connection is on instance level and not on the top level, as the same workshop may be connected to different conferences over the years (e.g. DEBS).
* For each instance there is a Call For Papers (CFP), with one or more alternatives (typically research and industry), with different deadlines, page limits and other requirements.
* Each CFP has a list of topic and a committee with a list of members.

Maybe the topics should be possible to relate in a hierarchy or in some other way.

## Architecture

* Probably a React frontend.
* Backend in node.js?

## Open questions

* What type of SQL, NoSQL or other storage system is suitable?
* How should tracking notification be done? Some sort of event queue?
