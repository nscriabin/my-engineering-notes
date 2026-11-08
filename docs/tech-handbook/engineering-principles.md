---
sidebar_position: 1
---

# Engineering Principles

Near-philosophical principles that I found useful in my engineering career.

## Technical

### Make small code changes

Making small code changes carries a lower risk than single large deployments.

Small changes can be undone easier.

Reviewing small changes is easier and more enjoyable.

### Write code to be read

The best code explains complex ideas in a simple manner.

If the code is hard to understand, it is too complex and will lead to bugs in long term.

### Write code to be debugged

At some point you will encounter a bug that will require you to intensively debug the software. You can prepare for this day:

- Handle errors explicitly 
- Use logging liberally
- Set up monitoring metrics
- Use comments to explain the deeper context

### Documentation is important

Write and review documentation as you would code.

High quality documentation brings many benefits. 
- Less time “figuring things out”.
- Investigating and fixing issues becomes easier and quicker. 
- Business critical knowledge becomes widespread, as a result, key person risk is mitigated.
- On-call becomes less stressful with runbooks covering most failure modes. 
- New engineers can get up to speed quickly.

### Don’t optimise too early

Go for the performance only when it is necessary. Both in code and in architecture.

- In code - a triple for loop is much easier to understand than a complex algo. If the complex algo saves only a few seconds, it is not worth it.
- In architecture - The simplest solution will work in 99% cases. There is no need to start with hundreds of microservices communicating over a message queue - unless you are solving planetary scale challenges.

## Behavioural

### Unblock others

Helping others, if they are stuck has a long term benefit:
- Knowledge is spread throughout the team.
- Motivation improves, since engineers know they are not alone in this.
- Long term, quality of the end product is improved.

Reviewing code of other engineers is just as important as writing new code yourself. 

### Manage technical debt 

Technical debt is a risk. 

Some risks can never be eliminated, only managed.

When shipping fast, tech debt naturally accumulates. But in some cases, it is preferential e.g. to beat your competitors to the market.

But care must be taken. Much like with financial debt, technical debt must be repaid before the interest becomes unbearable and bankrupts the company.

### Understand the value

Understand the value of what you are building.

This way you will know what to prioritise to deliver the most impact, without relying on anyone else.

### Learn

Learn how your organisation, product, industry works. 

Learn from your users. 

Learn regardless of your title and experience.

Otherwise, you will not be able to build the right things, without relying on someone else telling you what to do.

### Leave it better than you found it

Improve the code, documentation, processes or anything else that is not up to the standard.

You will enjoy this process. It will make you proud. But more importantly, it will make the lives of future engineers easier, allowing them to do even greater things!

If you observe a bug/issue whilst working on something else, the worst thing you can do is to ignore it. It is easy to convince yourself "that it is not my problem". Don't fall into this trap. Take time to investigate the issue and at the very least document it and communicate it with the team.