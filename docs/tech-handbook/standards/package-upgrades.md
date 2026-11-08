# Package Upgrades

At some point the versions of the packages will become deprecated and unsupported.

Majority of organisations only upgrade these packages when things start failing. Or when there is a need to use the functionality from the newer version of the package.

There are 2 reasons for such behaviour:.
1. [Let the sleeping dogs lie](https://en.wikipedia.org/wiki/Let_sleeping_dogs_lie) principle.
2. The official direction from the senior management is to prioritise delivery of features with business impact and fix things only when they break. Surprisingly, this kind of setup can work for years.

The alternative is to proactively upgrading all packages every x months. This sounds appealing but requires a lot of pre-requisites:
- Management to be on-board and allows engineers to actually do this.
- For small teams this could be a big task.
- Dev environment to be present. From my personal experience, I didn't see many useful dev environment in the data engineering world. Teams, usually yolo package upgrades in prod, observe if anything fails and respond accordingly (either with a quick fix or a revert)