# AI Content Moderation Platform

A full-stack, event-driven content moderation platform that leverages AWS AI services (Rekognition & Comprehend) to automatically analyze user-generated text and image content. Built to reduce manual review overhead by flagging toxic, explicit, or highly negative content in real-time.

## Architecture Overview

```text
[ React Frontend ] 
       │ 
       ▼ (HTTP POST /api/posts)
[ Node.js/Express Backend ] ───(Image)──► [ AWS S3 ]
       │ 
       ▼ (Saves to DB)
[ MongoDB (Status: pending) ]
       │ 
       ▼ (Publishes Event)
[ AWS SQS Queue ]
       │
       ▼ (Triggers via Event Source Mapping)
[ AWS Lambda (Moderation Processor) ]
       ├──► [ AWS Rekognition ] (Image Moderation Labels)
       ├──► [ AWS Comprehend ] (Sentiment & PII Analysis)
       │
       ▼ (Updates DB)
[ MongoDB (Status: flagged | needs_review | clean) ]
       │
       ▼ (If severity > 90%)
[ AWS SNS Topic ] ──► [ Email / Slack Alerts ]
```

## Tech Stack

- **Frontend:** React (Vite), TypeScript, Tailwind CSS, Recharts, React Router
- **Backend:** Node.js, Express, TypeScript, Mongoose
- **Database:** MongoDB
- **Cloud/Infra (AWS):** S3, SQS, Lambda, SNS, Rekognition, Comprehend
- **Infrastructure as Code:** Terraform

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- Terraform installed
- AWS CLI configured with active credentials
- A MongoDB cluster (e.g., MongoDB Atlas)

### 2. Infrastructure Setup
Navigate to the `infra` folder and deploy the AWS resources:
```bash
cd infra
terraform init
terraform apply -var="mongodb_uri=YOUR_MONGODB_URI" -var="admin_email=YOUR_EMAIL"
```
*Note: Make sure to check your email and confirm the SNS subscription!*

### 3. Environment Variables
Copy `.env.example` to `.env` in the root directory and fill in your details:
```bash
cp .env.example .env
```

### 4. Build and Run
**Start the Backend:**
```bash
cd server
npm install
npm run dev
```

**Start the Frontend:**
```bash
cd client
npm install
npm run dev
```

### 5. Lambda Deployment
If you make changes to the Lambda processor:
```bash
cd lambda
npm install
npm run zip
cd ../infra
terraform apply -var="mongodb_uri=YOUR_MONGODB_URI"
```

## Results

*This section highlights the business impact of the platform during testing/production.*

- **Manual Review Reduction:** Reduced manual review time by __X%__.
- **AI/Human Agreement Rate:** Achieved a __Y%__ AI accuracy rate (where human admins agreed with the AI's final verdict).
- **Average Resolution Time:** High-severity content is now processed and alerted within __Z seconds__.
