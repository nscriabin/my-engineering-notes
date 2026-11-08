# Data Source - (S)FTP

This template **must** be used across all pipelines that extract data from an SFTP/FTP server.

It is meant to make it easier for engineers to understand the behaviour of the SFTP/FTP server. This will lead to better understanding of the pipeline’s code and design decisions.

Copy paste this template and store it in the central location.

Add the link to the newly created document in the GitHub repo where pipeline’s code lives.

:::info
This template can be customised depending on the pipeline.
:::

## Use case

Short description of how the data from server is used.

## Hosts

Host(s) of the server (including IP address).

## Credentials

This section must tell users where to find login credentials for local testing.

## Contents

Brief description of what the files on the server actually contain. Add an example file for user convenience.

## File format

What file formats are found on the server? Are files compressed?

## Data dictionary

Ideally, there will be a data dictionary for files on the server provided by the server owner. If there isn't one, explicitly acknowledge this.

## Directory structure and file naming convention

Some servers have just 1 directory with all the files there. 

Some servers have layered-directory that follow a convention e.g. each directory corresponding to a region, with file name inside each directory containing a date.

## File delivery SLA

When are files expected to be delivered to the server? Are these SLAs contractual or non-binding?

## File expiration policy

Do files get deleted from the server after specific period of time? If yes, what is this period?

## Historical files

If there is a file expiration policy, is it possible to get historical files? If yes, what is the detailed procedure?

Some things to consider:

- Will the files appear in the same host?
- Will these files follow the same naming convention?
- What is the ETA/SLA on provision of historical files after the request has been made?

## File regeneration policy

In case there are any issues with the files, will the server provider regenerate and re-upload the files? If yes, what is the detailed procedure?

Some things to consider:

- Will the affected files be overwritten or a new file will be produced? If the latter, what will be the naming convention of the file?
- Is there any communication from the server provider about the regenerated files? Or it happens only as a response to issues flagged by users?

## Escalation procedure

Who to contact when there are any issues?

## Other items

Anything else that is unique to this particular S(FTP) that doesn’t fall in the above categories.