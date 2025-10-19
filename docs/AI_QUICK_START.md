# AI Agent Quick Start - Portfolio Template

**🤖 This is a reference card for AI agents helping users set up this template**

---

## Is This a Template?

**YES** - This is a reusable portfolio template with placeholder content.

---

## Quick Detection

Check if setup has been run:

```bash
# Template state: File doesn't exist
ls template-config.json

# Production state: File exists
# If exists, setup has been run → treat as normal project
```

---

## Setup Workflow (5 Steps)

### 1️⃣ Information Gathering

Ask user for:

- Full name
- Domain name
- Professional title
- Email
- AWS Account ID (12 digits)
- GitHub/LinkedIn usernames

### 2️⃣ Create Config

```bash
cp template-config.example.json template-config.json
# Then edit with user's information
```

### 3️⃣ Run Automation

```bash
npm run setup
```

This replaces ALL placeholders automatically.

### 4️⃣ AWS Setup

```bash
# Create ACM certificate (us-east-1 REQUIRED)
aws acm request-certificate --domain-name example.com --region us-east-1

# Deploy infrastructure
npm run infra:bootstrap
npm run infra:deploy
```

### 5️⃣ Deploy Website

```bash
npm run deploy
```

---

## Critical Files

| File                            | Purpose                 | When to Use             |
| ------------------------------- | ----------------------- | ----------------------- |
| `docs/AI_AGENT_INSTRUCTIONS.md` | Complete AI agent guide | Full details            |
| `TEMPLATE_GUIDE.md`             | User setup guide        | Share with users        |
| `template-config.example.json`  | Config template         | Copy to create config   |
| `setup.js`                      | Automation script       | Run via `npm run setup` |

---

## Common User Questions

**Q: "How do I use this template?"**
→ Guide them through 5-step workflow above

**Q: "Do I need AWS?"**
→ Yes, this template deploys to AWS (S3 + CloudFront)

**Q: "Can I change the design/colors?"**
→ Yes, after setup. Edit `src/css/themes.css`

**Q: "How much does it cost?"**
→ AWS Free Tier covers most usage. ~$1-5/month for domain + ACM cert

**Q: "How long does setup take?"**
→ 10 min automated + 2-3 hours AWS setup + content

---

## Critical Don'ts

❌ Don't skip ACM certificate creation (breaks CloudFront)
❌ Don't forget to configure form backend service (if adding contact form)
❌ Don't deploy without testing locally first
❌ Don't use regions other than us-east-1 for ACM cert

---

## Quick Commands

```bash
# Setup
npm run setup                  # Run template configuration

# Development
npm run dev                    # Start dev server
npm run lint                   # Check code
npm run validate:all           # Full validation

# AWS
npm run infra:bootstrap        # Bootstrap CDK
npm run infra:deploy           # Deploy infrastructure

# Deploy
npm run deploy                 # Full deployment
```

---

## Validation Checklist

Before deployment, verify:

- [ ] Website content customized in src/index.html
- [ ] ACM certificate validated in us-east-1
- [ ] Environment variables set (account ID, region, certificate ARN)
- [ ] Tested locally (`npm run dev`)
- [ ] Form backend configured (if adding contact form)
- [ ] Placeholder images replaced with actual images

---

## Emergency Troubleshooting

**Deploy fails**:
→ Check AWS credentials: `aws sts get-caller-identity`

**403 errors**:
→ Check CloudFlare proxy enabled (orange cloud)

**Contact form broken** (if implemented):
→ Check form backend service configuration and redirect URL

**Theme not saving**:
→ Check storage key is unique in `theme-toggle.js`

---

## Success Criteria

✅ User can view site locally
✅ All linters pass
✅ Infrastructure deployed to AWS
✅ Domain resolves correctly
✅ Contact form submits
✅ Lighthouse score 95+

---

**For full details**: Read `docs/AI_AGENT_INSTRUCTIONS.md`
