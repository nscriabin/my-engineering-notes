# Documentation

Documentation directly affects business outcomes:

- **Key person risk** – Business critical knowledge stays in people’s heads. When these people leave the business, this knowledge gets lost.
- **Incident response** – It is unclear how to investigate and fix issues. As a result, incidents take a lot of time to resolve.
- **General productivity** – When it is unclear how things work, each engineer needs to spend time “figuring things out” before actually doing work. This time could be spent more efficiently.
- **Onboarding** – onboarding of new engineers takes times and isn’t smooth.

Any documentation that is written by the engineers or is written for the engineers, is in scope of the documentation strategy.

## Incentives for the teams

A natural question to ask is – “What’s in it for me?”

3 main incentives:

1. By closing your documentation gaps, you solve the problems outlined previously. In long-term yours (and everyone elses) quality of life will be improved. Practically, this means less time fighting fires and more time to work on exciting things.
2. Documentation can be one of your goals for the quarter/year against which you will be assessed.
3. If documentation is a top priority for the senior management, it naturally becomes your priority.

## Technical writers

From my experience, having a technical writer trying to solve documentation problems doesn't yield any significant results.

There were 2 main reasons:

1. Too much documentation to produce for 1 person.
2. The nature of documentation is too technical. The technical writer end ups simply organising and editing existing documents, without addressing the root cause of the problems.
   - For example - learning, understanding and thoughtfully documenting how Prefect flows (running on K8s) will take time even for experienced engineers.

Therefore, it is best if engineers write the documentation themselves.

## Observations

Having observed the documentation efforts for several years at several organisations. Below are some axioms.

### Operations-heavy teams were most keen on writing docs

Perhaps not surprising but operations-heavy teams benefit the most from documentation, since it simplifies their job. These teams were most keen on writing docs as well.

Other teams struggled to systematically find time for documentation.

### Diataxis is not the best but there are no alternatives

[diataxis](https://diataxis.fr/) is still confusing people. 

But sadly, there are no credible alternatives.

As the saying goes, better the devil you know.

### Incentives and contradictions

Soft power approach has limited impact. Sheer enthusiasm of specific individuals will only get you so far.

Documentation is often declared a priority by management but there are no consequences for not doing it.

Linking bonuses to documentation completion is usually considered "too radical".

Including documentation in quarterly goals seemed to work for some teams. The problem is that majority of teams in majority of orgs don't set any goals.

Bottom line - if you want to get things done, rather than talk about getting things done, set appropriate incentives. Carrots and Sticks.

### Confluence doesn't work 

Confluence as a documentation platform is usually chosen for simplicity and familiarity.

There is a [plugin](https://www.appfox.io/products/approvals-for-confluence/) that allows to add page approvals to Confluence, which kind of replicates the GitHub PR behaviour.

The problem is that unlike GitHub PR approval, this is still post-factum.

Anyone can publish first and seek approval later. Imagine if this would be done for code. As a result, some individuals develop a bad habit - dumping of docs without any approval at all. This behaviour is reinforced by absence of clear incentives.

[Docs as Code](https://www.writethedocs.org/guide/docs-as-code/) forces a proper review before merging the PR.