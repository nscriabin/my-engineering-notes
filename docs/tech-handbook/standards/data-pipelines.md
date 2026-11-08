---
toc_max_heading_level: 5
---
# Data Pipelines

The purpose of this document is to provide consistency and form shared expectations. This in turn will speed up the delivery and make collaboration easier.

For majority of my career I have been extracting data from niche APIs/(S)FTP servers. 

So simple Python pipelines running in Prefect/Airflow were sufficient. Therefore, this doc is slightly biased towards this way.

:::info
Below operations must be abstracted and live in a common package that can be re-used across different pipelines or even repos. This will maintain consistency.
:::

## Dedicated ELT tool

I had an opportunity to work with [Fivetran](https://www.fivetran.com/) - an ELT tool. There are open source alternatives such as [Airbyte](https://airbyte.com/).

These kind of tools are incredibly valuable when extracting data from widely used systems/storage solutions e.g. Salesforce/RDBMS.

These sources and their associated ELT have been effectively commoditised across industries.

But hosted cloud versions can be very expensive.

## APIs

Use Python’s [requests](https://requests.readthedocs.io/en/latest/) library for all things API.

### async mode

In rare instances, when it is required to extract a lot of data from API using a large number of requests, Python’s [asyncio](https://docs.python.org/3/library/asyncio.html) library must be used.

:::info
Extracting a lot of data from API using large number of requests is an anti-pattern. Majority of data pipelines extract small amount of data from APIs. If a lot of data needs to be extracted from API, look for alternative sources first. Only use async mode if there are no alternatives.
:::

There are 2 async http libraries – [aiohttp](https://docs.aiohttp.org/en/stable/) and [httpx](https://www.python-httpx.org/). Both are stable and popular.

For now, it is best to use `aiohttp`, purely because `httpx` is not officially in v1 (even though it is stable).

For context there are some alternatives to async but none of them really better:

- [Multithreading](https://docs.python.org/3/library/threading.html) – would achieve the same thing but with a larger overhead, since each thread requires memory and cpu. Async mode runs in one thread and is more efficient for our case.
- [Multiprocessing](https://docs.python.org/3/library/multiprocessing.html) – each request would get spawned in its own subprocess. Significant overhead for each subprocess. Async mode is more efficient.

### Handling rate limits

As mentioned above, majority of pipelines don’t extract that much data to worry about API rate limits.

If this does become an issue, the solution is to split requests in batches and use `time.sleep()`.

In the case of async mode, `aiohttp` also has a neat functionality to limit number of [simultaneous requests](https://docs.aiohttp.org/en/stable/client_advanced.html#limiting-connection-pool-size).

## S3

### Bucket creation

There is a bad tendency I have observed in the industry of simply copy/pasting blocks of terraform code to create S3 buckets.

There are a lot of open source [terraform modules](https://registry.terraform.io/modules/terraform-aws-modules/s3-bucket/aws/latest) for creating S3 buckets. These modules follow the best practices.

### Writing and reading from S3 

Use [boto3](http://docs.aws.amazon.com/boto3/latest/) for all things S3.

There are numerous ways to write/read files to/from S3 using `boto3`, each suited for its own purpose. 

If there is a need to write a pandas dataframe to S3, there are 2 options:

- Write a dataframe to a csv and then use one of [boto3](#different-ways-to-write-to-s3-with-boto3) methods to write the csv to S3. 
- Use another library – [awswrangler](https://aws-sdk-pandas.readthedocs.io/en/stable/), which is an abstraction layer on top of `boto3`.

#### Different ways to write to S3 with boto3

There is also an Object-orientated [alternative](https://docs.aws.amazon.com/boto3/latest/reference/services/s3/object/) for each of the below methods.

##### [put_object](https://docs.aws.amazon.com/boto3/latest/reference/services/s3/client/put_object.html)

```python
import boto3

s3 = boto3.client('s3')

s3.put_object(
    Bucket='my-bucket',
    Key='file.txt',
    Body='Hello World!'
)
```

When to use:
- Best for small files or strings already in memory.

##### [upload_file](https://docs.aws.amazon.com/boto3/latest/reference/services/s3/client/upload_file.html#S3.Client.upload_file)

```python
import boto3

s3 = boto3.client('s3')

s3.upload_file(
    Filename='local_file.txt',
    Bucket='my-bucket',
    Key='file.txt'
)
```

When to use:
- Best for uploading large local files.
- Automatically uses multipart upload if needed.

##### [upload_fileobj](https://docs.aws.amazon.com/boto3/latest/reference/services/s3/client/upload_fileobj.html)

```python
import boto3
from io import BytesIO

file_obj = BytesIO(b'Hello from file-like object!')

s3 = boto3.client('s3')

s3.upload_fileobj(
    Fileobj=file_obj,
    Bucket='my-bucket',
    Key='file_from_obj.txt'
)
```

When to use:
- Best for when data is a file-like object e.g. `BytesIO`, `StringIO`, or open file.
- Best for in-memory streaming uploads e.g. zip files.

#### Different ways to read from S3 with boto3

There is also an Object-orientated [alternative](https://docs.aws.amazon.com/boto3/latest/reference/services/s3/object/) for each of the below methods.

##### [get_object](https://docs.aws.amazon.com/boto3/latest/reference/services/s3/client/get_object.html)

```python
import boto3

s3 = boto3.client('s3')

response = s3.get_object(
    Bucket='my-bucket',
    Key='file.txt'
)

content = response['Body'].read()
```

When to use:
- Best for small to medium-sized files to load entirely into memory.

##### [download_file](https://docs.aws.amazon.com/boto3/latest/reference/services/s3/client/download_file.html#S3.Client.download_file)

```python
import boto3

s3 = boto3.client('s3')

s3.download_file(
    Bucket='my-bucket',
    Key='file.txt',
    Filename='file.txt'
)
```

When to use:
- Best for saving a file from S3 to local storage (e.g. before passing to another tool).

##### [download_fileobj](https://docs.aws.amazon.com/boto3/latest/reference/services/s3/client/download_fileobj.html)

```python
import boto3
from io import BytesIO

s3 = boto3.client('s3')

file_obj = BytesIO()

s3.download_fileobj(
    Bucket='my-bucket',
    Key='file.txt',
    Fileobj=file_obj
)

file_obj.seek(0)
# May need to add .decode('utf-8')
content = file_obj.read()
```

When to use:
- Best for streaming data from S3 into memory or into a file-like object (no disk write).

## SFTP servers

Use Python’s [paramiko](https://www.paramiko.org/) library for all things SFTP.

Main use case is saving these files to an object store e.g. S3 bucket and then loading them to a data warehouse.

In rare cases there is a need to go into another direction e.g. to upload the firm's own generated files to an external SFTP. This usually happens when there is a need for regulatory reporting (think finance industry).

## FTP servers

Occasionally you will still see an FTP server.

The good news is you should not see these often, as they are dying out.

In case you will need to build a pipeline for the FTP server, use the in-built [ftplib](https://docs.python.org/3/library/ftplib.html) package for all things FTP server.

## Snowflake

### Pandas dataframes

Snowflake provides a [Python SDK](https://docs.snowflake.com/en/developer-guide/python-connector/python-connector-pandas) which allows to read Snowflake data to a pandas dataframe, as well as write a pandas dataframe to Snowflake.

Some tools like Prefect, also wrap this SDK into their own [functionality](https://docs.prefect.io/integrations/prefect-snowflake).

### COPY INTO 

Snowflake provides a managed service ([COPY INTO](https://docs.snowflake.com/en/sql-reference/sql/copy-into-table)) to load files from S3 (and other object storage solutions). 

The key benefit is that this solution allows to bypass reading the files into memory. Which is particularly useful for large files.

Some general points about loading files into Snowflake using this option:

- Practically, this command can be used in the same pipeline which loads the files to S3.
- Snowflake  supports (and in fact [prefers](https://docs.snowflake.com/en/user-guide/data-load-considerations-prepare#general-file-sizing-recommendations)) to upload compressed files. Snowflake will handle the decompression themselves. 
- Keep in mind [file sizing](https://docs.snowflake.com/en/user-guide/data-load-considerations-prepare#general-file-sizing-recommendations) best practices and recommendations.

### Files as dataframes

Technically it is possible to read a file (from S3) as a pandas dataframe, and then write the dataframe to Snowflake.

However, this will only work until certain scale. Reading larger files will require more memory – in some cases pandas will [require](https://pythonspeed.com/articles/estimating-pandas-memory/) more memory than the actual file size.

### Auto ingestion from S3

Snowflake also has an offering, called [Snowpipes](https://docs.snowflake.com/en/user-guide/data-load-snowpipe-intro), which allows to ingest files from S3 in a continuous manner. 

This is useful when files arrive to S3 throughout the day without a specific schedule when another team/third-party controls the process of uploading the files to the S3 bucket.

This solution allows to avoid the complexity of setting up logic to continuously check the availability of files throughout the day.

## Common use case summary

The below contain the most common use cases I observed in data pipelines.

### SFTP to S3 

Use [paramiko](https://www.paramiko.org/) to connect to the SFTP server, download the files and then one of the [methods](#different-ways-to-write-to-s3-with-boto3) to upload to S3.

### S3 to Data Warehouse - Hard option

The hard option is - where you do not control the file load to S3 **and/or** files are uploaded without a set schedule

Use an [auto ingestion](#auto-ingestion-from-s3) like option.

### S3 to Data Warehouse - Easy option

The easy option is - where you control the file load to S3.

Use [COPY INTO](#copy-into) like command to load these. Majority of warehouses will have such or similar functionality.

### API to Data warehouse

Usually there is no need to save the data to an intermediary location e.g. S3.

Use [requests](#apis) to extract data. Then use the necessary [SDK](#pandas-dataframes) to write the data to your warehouse.

### RDBMS to Data warehouse

There are multiple options for this case:

| Method      | Pros | Cons |
| ----------- | ----------- | ----------- |
| [Dedicated ELT tool](#dedicated-elt-tool) | - Handles scale well | - Requires the ELT tool to be setup in the org.<br/> - If you are using a hosted cloud option, this can become quite expensive.|
| Change Data Capture (CDC) with [Debezium](https://debezium.io/documentation/reference/stable/architecture.html) | - Handles scale well.<br/> - Less expensive than a hosted cloud ETL tool. | - Requires a lot of setup. |
| Basic python scripts | - The quickest way to replicate the data to data warehouse. Practically this would a simple `SELECT *` from source, and a full overwrites at destination. | - This works with small tables and won't scale. But can be set up with bare minimum tools during early days of any data platform. |