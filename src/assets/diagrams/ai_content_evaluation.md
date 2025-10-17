# AI-Generated Content Evaluation Service - Architecture Diagram

## Mermaid Diagram Code

```mermaid
graph TB
    Start([API Request]) --> IP[Input Processor]

    IP --> |Validates & Sets Defaults| RDR[Reference Document Retriever]

    subgraph "Iterative Document Retrieval Loop"
        RDR --> KB[(Knowledge Base<br/>OpenSearch Vector Store)]
        KB --> |Retrieved Documents| QG[LLM Quality Grader]
        QG --> |Quality Check| Decision{Quality<br/>Meets<br/>Standards?}
        Decision --> |No| Rephraser[LLM Query Rephraser]
        Rephraser --> |Rephrased Query| RDR
        Decision --> |Yes| Docs[Quality Reference Documents]
    end

    Docs --> IPred[Initial Predictor]
    IP --> |Original Input| IPred

    subgraph "Dual LLM Evaluation"
        IPred --> LLM1[LLM 1: Evaluation<br/>WITH Reference Docs]
        IPred --> LLM2[LLM 2: Evaluation<br/>WITHOUT Reference Docs]
    end

    LLM1 --> |Assessment 1| FP[Final Predictor]
    LLM2 --> |Assessment 2| FP

    FP --> |Analyzes Both Evaluations| FA[Final Assessment<br/>+ Detailed Explanation]

    FA --> RPP[Response Post Processor]
    RPP --> |Formats Output| Response([API Response])

    style IP fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    style RDR fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style KB fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    style QG fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style Decision fill:#ffcdd2,stroke:#b71c1c,stroke-width:3px
    style Rephraser fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style Docs fill:#c8e6c9,stroke:#1b5e20,stroke-width:2px
    style IPred fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    style LLM1 fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
    style LLM2 fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
    style FP fill:#ffe0b2,stroke:#e65100,stroke-width:2px
    style FA fill:#c8e6c9,stroke:#1b5e20,stroke-width:3px
    style RPP fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    style Start fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style Response fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
```

## Process Flow Description

### 1. Input Processor

- **Purpose**: Validates incoming API requests
- **Function**: Fills missing optional fields with default values
- **Output**: Validated input data

### 2. Reference Document Retriever (Iterative Loop)

- **Purpose**: Obtain high-quality reference materials
- **Process**:
  1. Fetches documents from Knowledge Base (OpenSearch Vector Store)
  2. LLM Quality Grader evaluates document relevance/quality
  3. If quality standards not met:
     - LLM Query Rephraser reformulates the query
     - Process restarts with new query
  4. If quality standards met:
     - Proceeds with quality reference documents

### 3. Initial Predictor (Dual LLM Evaluation)

- **Purpose**: Generate initial content assessments
- **Inputs**:
  - Original input from Input Processor
  - Quality reference documents from retriever
- **Process**:
  - **LLM 1**: Evaluates content WITH reference documents
  - **LLM 2**: Evaluates content WITHOUT reference documents
- **Output**: Two independent assessments

### 4. Final Predictor

- **Purpose**: Synthesize final judgment
- **Process**: Analyzes both LLM evaluations (with/without references)
- **Output**:
  - Final assessment score/verdict
  - Detailed explanation of correctness

### 5. Response Post Processor

- **Purpose**: Format and standardize output
- **Function**: Handles LLM output formatting
- **Output**: Structured API response to caller

## Key Technologies

- **OpenSearch**: Vector storage for AWS documentation knowledge base
- **Amazon Bedrock**: LLM inference for quality grading, rephrasing, and evaluation
- **Multi-LLM Architecture**: Dual evaluation (with/without context) for robust assessment

## Iterative Quality Loop Benefit

The iterative document retrieval ensures that the evaluation is based on the most relevant and accurate AWS documentation, improving the reliability of the LLM-as-a-judge correctness metrics.

````

## Export Instructions

To generate PNG diagram:
1. Visit https://mermaid.live/
2. Paste the Mermaid code above
3. Use "Actions" → "Export as PNG" or "Export as SVG"
4. Save as `/assets/images/ai_content_evaluation__architecture.png`
5. Update `modal.js` imageMap with:
   ```javascript
   'ai-content-evaluation': {
     architecture: '/assets/images/ai_content_evaluation__architecture.png',
   }
````
