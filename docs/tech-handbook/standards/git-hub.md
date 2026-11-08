# GitHub

The below list of conventions may seem quite boring (and sometimes obvious) but once you start working in large orgs with thousand of repos, you start to appreciate such things.

- Branch names – Use `main` branch as default.
- Restrict `main` to be reviewed by at least one approver.
- Access must be granted to teams and not to individuals.
- Admin access must be granted only to central platform/infra teams. This will prevent anyone from messing with repo settings or deleting the repo.
- Codeowners file must be used.
- repos must be named with a naming convention:
  - A convention can be anything like - `{team-name}-{service-name}-{optional-value}`. Pick something and stick with it.
  - Names must be hyphenated.
  - Names must be reasonable and descriptive e.g. `platform-prefect-infra`. This name tells you that the repo contains infrastructure for Prefect owned by the Platform team.