# Data Sense - Intelligent Data Lake Query Service - Architecture Diagram

## Mermaid Diagram Code

```mermaid
graph TB
    Start([Natural Language Query]) --> InputProcessor[Input Processor]

    InputProcessor --> |Validates & Normalizes Query| MetadataRetriever[Metadata Retriever]

    subgraph "Dual Knowledge Base Architecture"
        MetadataRetriever --> OSSearch[OpenSearch Query]
        MetadataRetriever --> GraphQuery[Neptune Graph Query]

        OSSearch --> KB1[(OpenSearch<br/>Semantic & Lexical Search)]
        GraphQuery --> KB2[(Neptune Graph DB<br/>Entity Relationships)]

        KB1 --> |Metadata Documents| Merger[Metadata Merger]
        KB2 --> |Relationship Context| Merger
    end

    Merger --> |Enriched Metadata Context| QGA[Query Generation Agent]

    subgraph "Agentic Framework"
        QGA --> |Analyzes User Intent| SQLGen[LLM SQL Generator]
        SQLGen --> |Generates SQL Query| SQLValidator[SQL Validator]

        SQLValidator --> |Valid?| Decision{SQL<br/>Valid?}
        Decision --> |No| Refiner[LLM Query Refiner]
        Refiner --> |Refined Prompt| SQLGen
        Decision --> |Yes| ValidSQL[Validated SQL Query]

        ValidSQL --> QEA[Query Execution Agent]
        QEA --> |Executes Query| Athena[(Amazon Athena<br/>Data Lake Query Engine)]

        Athena --> |Query Results| ResultProcessor[Result Processor]
        ResultProcessor --> InsightGen[LLM Insight Generator]
    end

    InsightGen --> |Synthesizes Natural Language| Response[Human-Readable Insights]

    Response --> End([API Response])

    subgraph "Metadata Enrichment Pipeline (Offline)"
        DataModels[(Service Data Models)] --> Ingestion[Metadata Ingestion]
        Ingestion --> LLMEval[LLM-Based Evaluation]
        LLMEval --> Enrichment[Metadata Enrichment]
        Enrichment --> Store1[Store in OpenSearch]
        Enrichment --> Store2[Store in Neptune]
        Store1 -.->|Feeds| KB1
        Store2 -.->|Feeds| KB2
    end

    style InputProcessor fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    style MetadataRetriever fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style KB1 fill:#f3e5f5,stroke:#4a148c,stroke-width:3px
    style KB2 fill:#f3e5f5,stroke:#4a148c,stroke-width:3px
    style Merger fill:#ffe0b2,stroke:#e65100,stroke-width:2px
    style QGA fill:#c8e6c9,stroke:#1b5e20,stroke-width:3px
    style SQLGen fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style SQLValidator fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    style Decision fill:#ffcdd2,stroke:#b71c1c,stroke-width:3px
    style Refiner fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style ValidSQL fill:#c8e6c9,stroke:#1b5e20,stroke-width:2px
    style QEA fill:#c8e6c9,stroke:#1b5e20,stroke-width:3px
    style Athena fill:#f3e5f5,stroke:#4a148c,stroke-width:3px
    style ResultProcessor fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    style InsightGen fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style Response fill:#c8e6c9,stroke:#1b5e20,stroke-width:3px
    style Start fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style End fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style DataModels fill:#ffcdd2,stroke:#b71c1c,stroke-width:2px
    style Ingestion fill:#ffe0b2,stroke:#e65100,stroke-width:2px
    style LLMEval fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style Enrichment fill:#ffe0b2,stroke:#e65100,stroke-width:2px
    style Store1 fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    style Store2 fill:#e1f5ff,stroke:#01579b,stroke-width:2px
```

## Process Flow Description

### 1. Input Processor

- **Purpose**: Receive and validate natural language queries from users
- **Function**:
  - Validates incoming query format
  - Normalizes query text
  - Prepares query for metadata retrieval
- **Output**: Validated natural language query

### 2. Metadata Retriever (Dual Knowledge Base)

- **Purpose**: Retrieve relevant data lake metadata from dual knowledge bases
- **Process**:
  - **OpenSearch Query**: Performs semantic and lexical search on metadata documents
  - **Neptune Graph Query**: Traverses entity relationships to understand data context
- **Data Sources**:
  - **OpenSearch**: Stores metadata as vector embeddings for semantic search
  - **Neptune Graph DB**: Maintains entity relationships and dependencies
- **Output**: Metadata from both sources

### 3. Metadata Merger

- **Purpose**: Combine metadata from OpenSearch and Neptune into unified context
- **Function**:
  - Merges semantic search results with relationship context
  - Deduplicates and ranks metadata by relevance
  - Creates comprehensive metadata context for query generation
- **Output**: Enriched metadata context

### 4. Query Generation Agent (Agentic Framework)

- **Purpose**: Translate natural language query to SQL using metadata context
- **Process**:
  1. **Analyzes User Intent**: Uses LLM to understand what user is asking for
  2. **LLM SQL Generator**: Generates SQL query based on intent and metadata
  3. **SQL Validator**: Validates SQL syntax and semantic correctness
  4. **Decision**: Checks if SQL is valid
  5. **LLM Query Refiner** (if invalid): Refines prompt and regenerates SQL
  6. **Validated SQL Query**: Final SQL ready for execution
- **Technology**: Amazon Bedrock for LLM inference
- **Output**: Validated SQL query

### 5. Query Execution Agent

- **Purpose**: Execute SQL query and process results
- **Process**:
  - Executes validated SQL query in Amazon Athena
  - Retrieves query results from data lake
  - Processes results for insight generation
- **Technology**: Amazon Athena (serverless query engine for S3 data lakes)
- **Output**: Raw query results

### 6. Result Processor

- **Purpose**: Prepare query results for natural language synthesis
- **Function**:
  - Formats query results
  - Identifies key patterns and insights
  - Prepares data for LLM insight generation
- **Output**: Processed results

### 7. LLM Insight Generator

- **Purpose**: Transform raw query results into human-readable insights
- **Process**:
  - Uses LLM to analyze query results
  - Generates natural language explanations
  - Highlights key findings and patterns
  - Creates actionable recommendations
- **Technology**: Amazon Bedrock
- **Output**: Human-readable insights in natural language

### 8. Metadata Enrichment Pipeline (Offline Process)

- **Purpose**: Continuously enrich and maintain metadata in knowledge bases
- **Process**:
  1. **Service Data Models**: Source data model definitions from services
  2. **Metadata Ingestion**: Ingest metadata from various data sources
  3. **LLM-Based Evaluation**: Use LLM to evaluate and enhance metadata quality
  4. **Metadata Enrichment**: Add descriptions, tags, relationships, business context
  5. **Store in OpenSearch**: Index enriched metadata as vector embeddings
  6. **Store in Neptune**: Store entity relationships in graph database
- **Frequency**: Runs on schedule or triggered by data model changes
- **Technology**: AWS Glue, Amazon Bedrock, OpenSearch, Neptune

## Key Technologies

- **Natural Language Processing**: Amazon Bedrock (Claude, other LLMs)
- **Semantic Search**: Amazon OpenSearch (vector embeddings)
- **Graph Database**: Amazon Neptune (entity relationships)
- **Query Engine**: Amazon Athena (serverless SQL on S3 data lakes)
- **Metadata Enrichment**: AWS Glue, Amazon Bedrock
- **Agentic Framework**: Multi-agent orchestration with LLM-powered agents

## Agentic Framework Benefits

1. **Query Generation Agent**: Specializes in understanding user intent and generating accurate SQL
2. **Query Execution Agent**: Focuses on executing queries and processing results
3. **Separation of Concerns**: Each agent handles specific responsibilities
4. **Iterative Refinement**: Query refinement loop ensures high-quality SQL generation
5. **Context-Aware**: Dual knowledge base provides rich metadata context

## System Benefits

1. **Zero SQL Knowledge Required**: Users ask questions in natural language
2. **10x Faster Data Discovery**: Automated query generation vs manual SQL writing
3. **Dual Knowledge Base**: Combines semantic search (OpenSearch) with relationship context (Neptune)
4. **High-Quality Metadata**: Rigorous LLM-based evaluation and enrichment
5. **Actionable Insights**: Natural language insights, not just raw data
6. **Scalable**: Serverless Athena queries across petabyte-scale data lakes

## Export Instructions

To generate PNG diagram:

1. Visit https://mermaid.live/
2. Paste the Mermaid code above
3. Use "Actions" → "Export as PNG" or "Export as SVG"
4. Save as `/assets/images/data_sense__architecture.png`
5. Update `modal.js` imageMap with:
   ```javascript
   'data-sense': {
     architecture: '/assets/images/data_sense__architecture.png',
   }
   ```
