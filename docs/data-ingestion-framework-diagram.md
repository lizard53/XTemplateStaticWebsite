# Standardized Data Ingestion Framework - Architecture Diagram

## Mermaid Diagram Code

```mermaid
graph TB
    subgraph Sources["Data Sources"]
        SQL[(SQL Databases<br/>RDS, Aurora)]
        NoSQL[(NoSQL Databases<br/>DynamoDB, MongoDB)]
        Stream[Streaming Sources<br/>Kinesis, Kafka]
        API[REST/GraphQL APIs<br/>Third-party Services]
        Files[File-based Sources<br/>S3, SFTP, FTP]
    end

    subgraph Framework["CDK Ingestion Framework"]
        CDK[CDK Constructs<br/>Infrastructure as Code]

        subgraph Connectors["Source Connectors"]
            SQLConn[SQL Connector]
            NoSQLConn[NoSQL Connector]
            StreamConn[Stream Connector]
            APIConn[API Connector]
            FileConn[File Connector]
        end

        subgraph Parsers["Format Parsers"]
            CSV[CSV Parser]
            JSON[JSON Parser]
            XML[XML Parser]
            Parquet[Parquet Parser]
            Avro[Avro Parser]
            HTML[HTML Parser]
            PDF[PDF Parser]
        end

        Orchestration[Pipeline Orchestration<br/>Step Functions]
        Validation[Data Validation<br/>& Quality Checks]
    end

    subgraph Target["Data Lake"]
        Raw[Raw Zone<br/>S3 Bucket]
        Processed[Processed Zone<br/>S3 Bucket]
        Catalog[Data Catalog<br/>AWS Glue]
    end

    SQL --> SQLConn
    NoSQL --> NoSQLConn
    Stream --> StreamConn
    API --> APIConn
    Files --> FileConn

    SQLConn --> Orchestration
    NoSQLConn --> Orchestration
    StreamConn --> Orchestration
    APIConn --> Orchestration
    FileConn --> Orchestration

    Orchestration --> CSV
    Orchestration --> JSON
    Orchestration --> XML
    Orchestration --> Parquet
    Orchestration --> Avro
    Orchestration --> HTML
    Orchestration --> PDF

    CSV --> Validation
    JSON --> Validation
    XML --> Validation
    Parquet --> Validation
    Avro --> Validation
    HTML --> Validation
    PDF --> Validation

    Validation --> Raw
    Raw --> Processed
    Processed --> Catalog

    CDK -.->|Deploys| Connectors
    CDK -.->|Deploys| Parsers
    CDK -.->|Deploys| Orchestration
    CDK -.->|Deploys| Validation

    style Sources fill:#e1f5ff
    style Framework fill:#fff4e1
    style Target fill:#e8f5e9
    style CDK fill:#ff9800,color:#fff
```

## Key Components

### 1. Data Sources (5 Types)

- **SQL Databases**: RDS, Aurora, PostgreSQL, MySQL
- **NoSQL Databases**: DynamoDB, MongoDB, Cassandra
- **Streaming Sources**: Kinesis Data Streams, Apache Kafka, MSK
- **REST/GraphQL APIs**: Third-party services, internal APIs
- **File-based Sources**: S3, SFTP, FTP servers

### 2. CDK Ingestion Framework

- **CDK Constructs**: Infrastructure as Code for repeatable deployments
- **Source Connectors**: Specialized connectors for each source type
- **Format Parsers**: Support for 7+ file formats
  - CSV, JSON, XML (structured)
  - Parquet, Avro (columnar)
  - HTML, PDF (semi-structured)
- **Pipeline Orchestration**: AWS Step Functions for workflow management
- **Data Validation**: Quality checks and schema validation

### 3. Data Lake Architecture

- **Raw Zone**: Landing area for ingested data (S3)
- **Processed Zone**: Cleaned and transformed data (S3)
- **Data Catalog**: AWS Glue for metadata management

## Impact Metrics

- **20% reduction** in development timeline
- **Standardized scaffolding** for initial pipeline development
- **10+ source types** supported
- **7 file formats** handled seamlessly
- **First-party and third-party** system integration

## Usage Instructions

1. Visit [Mermaid Live Editor](https://mermaid.live/)
2. Copy the mermaid code block above
3. Paste into the editor
4. Export as PNG or SVG
5. Save to `/assets/images/data_ingestion_framework__architecture.png`

## Alternative: Simplified View

For a more compact view, use this simplified version:

```mermaid
graph LR
    subgraph Sources
        S1[SQL/NoSQL<br/>Databases]
        S2[Streaming<br/>Kinesis/Kafka]
        S3[APIs & Files]
    end

    subgraph Framework["CDK Framework"]
        CDK[CDK Constructs]
        Connectors[Source Connectors]
        Parsers[Format Parsers<br/>CSV/JSON/XML/Parquet<br/>Avro/HTML/PDF]
        Pipeline[Orchestration]
    end

    subgraph Lake["Data Lake"]
        Raw[Raw Zone]
        Processed[Processed Zone]
    end

    S1 --> Connectors
    S2 --> Connectors
    S3 --> Connectors

    Connectors --> Parsers
    Parsers --> Pipeline
    Pipeline --> Raw
    Raw --> Processed

    CDK -.->|Deploys| Framework

    style Sources fill:#e1f5ff
    style Framework fill:#fff4e1
    style Lake fill:#e8f5e9
```

## Notes

- The framework supports both first-party (internal AWS services) and third-party systems
- CDK constructs enable rapid scaffolding of new ingestion pipelines
- Standardized approach reduces development time by 20%
- Infrastructure as Code ensures consistency across environments
