# Sponsor Property Listing Process - Implementation Plan

## Overview
This document outlines the complete workflow for property sponsors to list commercial real estate on the Commertize platform, from initial onboarding through successful property funding.

---

## Phase 1: Sponsor Onboarding & KYC

### Step 1.1: Account Creation
**Action:** Sponsor creates account on platform
- Email/password registration
- Company information collection
  - Legal entity name
  - Entity type (LLC, Corporation, Partnership, etc.)
  - EIN/Tax ID
  - Business address
  - Years in business
  - Previous CRE experience

**Technical:**
- User registration API
- Company profile database schema
- Email verification system

---

### Step 1.2: KYC/AML Verification (Required)
**Action:** Sponsor completes identity and business verification

**Individual Verification (Key Personnel):**
- Government-issued ID (Driver's License, Passport)
- Proof of address (Utility bill, Bank statement)
- SSN verification
- Sanctions screening (OFAC, PEP lists)

**Entity Verification:**
- Articles of Incorporation/Organization
- EIN confirmation letter
- Operating Agreement/Bylaws
- Ownership structure (Beneficial Ownership)
- Good standing certificate from state

**Integration Partner:**
- Plaid (financial verification)
- Chainalysis (AML screening)
- Third-party KYC provider (Jumio, Persona, Onfido)

**Approval Timeline:** 2-5 business days

---

### Step 1.3: Sponsor Accreditation (if applicable)
**Action:** Verify entity meets accreditation requirements

**Entity Accreditation Criteria:**
- $5M+ in total assets (for entities)
- All equity owners are accredited individuals
- OR entity is bank, insurance company, registered investment company

**Documentation:**
- Recent financial statements
- Bank verification letters
- CPA attestation

---

## Phase 2: Property Submission

### Step 2.1: Property Information
**Action:** Sponsor submits comprehensive property details

**Basic Information:**
- Property name
- Property type (Office, Multi-Family, Industrial, Retail, Data Center, Cold Storage)
- Address and legal description
- Total square footage
- Year built / renovated
- Current occupancy rate

**Financial Information:**
- Purchase price / Current valuation
- Total investment required
- Sponsor equity contribution
- Target raise amount
- Projected distributions (Annual, Quarterly)
- Target IRR / APY
- Hold period (e.g., 5-7 years)
- Exit strategy

**Operational Details:**
- Major tenants
- Lease expiration schedule
- Current NOI (Net Operating Income)
- Property management plan
- CapEx requirements

**Media Assets:**
- Professional property photos (minimum 10)
- Drone footage (if available)
- Property video tour
- Floor plans
- Site maps

---

### Step 2.2: Due Diligence Documentation
**Action:** Upload all required legal and financial documents

**Required Documents:**
- Phase I Environmental Assessment
- Property appraisal (within 6 months)
- Title report and insurance
- Property insurance certificates
- Survey and site plans
- Tenant lease agreements
- Rent roll
- Operating statements (last 3 years)
- Property tax records
- CapEx budget and schedule
- Private Placement Memorandum (PPM) draft
- Subscription Agreement draft

**Sponsor Track Record:**
- Previous projects completed
- References from past investors
- Portfolio performance summary

---

### Step 2.3: Legal Structure Setup
**Action:** Establish offering structure with legal counsel

**Offering Type:**
- Reg D 506(c) - Accredited investors only, general solicitation allowed
- OR Reg A+ - Semi-public offering (if larger raise)

**SPV Creation:**
- Special Purpose Vehicle (LLC/LP) for property ownership
- Operating agreement
- Capital stack structure
- Distribution waterfall terms
- Sponsor promote/carried interest

**Securities Documentation:**
- Private Placement Memorandum (PPM)
- Subscription Agreement
- Operating Agreement amendments

**Legal Review:** Commertize legal team or approved counsel

---

## Phase 3: Commertize Review & Approval

### Step 3.1: Initial Screening
**Action:** Commertize team performs preliminary review

**Review Criteria:**
- Property quality and location
- Sponsor track record
- Financial projections reasonableness
- Market comparables
- Documentation completeness

**Decision:** Proceed, Request More Info, or Decline

---

### Step 3.2: Due Diligence
**Action:** Comprehensive third-party due diligence

**Financial Review:**
- Independent appraisal verification
- Financial model validation
- Market analysis
- Rent roll verification
- Underwriting review

**Legal Review:**
- Title search confirmation
- Environmental report review
- Zoning compliance
- PPM and subscription agreement review

**Technical Review:**
- Property condition assessment
- CapEx budget validation
- Property management evaluation

**Timeline:** 2-4 weeks

---

### Step 3.3: Approval & Terms
**Action:** Commertize approves listing with final terms

**Platform Terms Agreement:**
- Listing fee structure (e.g., 1-2% of raise)
- Annual management fee (e.g., 1% of AUM)
- Success fee (if applicable)
- Minimum raise threshold
- Maximum raise cap
- Funding timeline (e.g., 60-90 days)

**Tokenization Parameters:**
- Token name and symbol
- Total token supply
- Price per token
- Minimum investment per investor
- Lock-up period (if any)
- Transfer restrictions

---

## Phase 4: Tokenization & Smart Contract Deployment

### Step 4.1: Security Token Creation
**Action:** Deploy ERC-3643 compliant security token on Hedera

**Token Specifications:**
- Token standard: ERC-3643 (T-REX)
- Compliance rules encoded:
  - Investor accreditation check
  - Transfer restrictions (lock-ups)
  - Investor limits (e.g., max 2,000 investors for 506(c))
  - Jurisdiction restrictions

**Smart Contract Features:**
- Whitelist management (approved investors only)
- Automated compliance checks
- Distribution mechanism
- Governance rights (if applicable)

**Custody Setup:**
- Fireblocks integration for token custody
- Multi-sig wallet configuration
- Reserve wallet for distributions

---

### Step 4.2: Escrow Setup
**Action:** Configure escrow for investor funds

**Escrow Account (Propy Integration):**
- Third-party escrow agent
- Minimum raise escrow release condition
- Failure-to-fund return mechanism
- Closing coordination

**Smart Escrow Contract:**
- On-chain fund holding
- Automatic release upon conditions met
- Investor refund mechanism if minimum not reached

---

## Phase 5: Marketing & Launch

### Step 5.1: Listing Page Creation
**Action:** Commertize creates property listing page

**Page Components:**
- Hero image carousel
- Property overview video
- Key metrics dashboard (IRR, APY, Min Investment)
- Interactive location map
- Financial projections chart
- Document library (PPM, Subscription Agreement)
- Sponsor profile
- Investment timeline
- FAQ section
- "Invest Now" CTA

**SEO Optimization:**
- Property-specific landing page
- Schema.org markup for real estate
- Social sharing meta tags

---

### Step 5.2: Marketing Campaign
**Action:** Launch multi-channel marketing campaign

**Email Marketing:**
- Announcement to Commertize investor base (14,000+)
- Segment by property type preference
- Drip campaign (Announcement → Deadline → Last Chance)

**Platform Features:**
- Featured placement on marketplace
- Homepage banner (if premium listing)
- "New Listing" badge

**External Marketing (Sponsor-led):**
- Sponsor's existing investor network
- Social media promotion
- Press release (if significant property)
- Webinar/Q&A sessions

---

### Step 5.3: Investor Q&A
**Action:** Host informational sessions

**Formats:**
- Live webinar with sponsor presentation
- Recorded video walkthrough
- Written FAQ updates
- 1-on-1 sponsor calls (for large investors)

**Platform Tools:**
- In-platform messaging system
- Scheduled Q&A sessions
- Document updates as questions arise

---

## Phase 6: Fundraising

### Step 6.1: Investor Onboarding
**Action:** Investors complete subscription process

**Investor Side Steps:**
1. Complete KYC/AML (if not already done)
2. Verify accreditation
3. Review offering documents (PPM)
4. Sign Subscription Agreement (e-signature)
5. Fund investment (ACH or wire)
6. Receive token allocation confirmation

**Compliance Checks:**
- Accreditation verified before investment
- Suitability questionnaire
- Investment limits enforced
- Holding period disclosed

---

### Step 6.2: Progress Tracking
**Action:** Monitor fundraising progress

**Dashboard Metrics:**
- Total raised vs. target
- Number of investors
- Average investment size
- Days remaining in offering
- Funding velocity

**Milestones:**
- 25% funded
- 50% funded (minimum threshold)
- 75% funded
- 100% funded (fully subscribed)

---

### Step 6.3: Fundraising Completion
**Action:** Close the offering and finalize

**Success Scenario (Minimum Raised):**
1. Close subscription period
2. Release funds from escrow
3. Purchase/close on property
4. Distribute tokens to investors
5. Record ownership on blockchain
6. Begin property operations

**Failure Scenario (Minimum Not Reached):**
1. Cancel offering
2. Return all funds to investors from escrow
3. Sponsor notified of outcome
4. Option to re-launch with revised terms

---

## Phase 7: Post-Funding Operations

### Step 7.1: Property Acquisition
**Action:** Complete property purchase

**Steps:**
- Wire funds from escrow to closing
- Sign purchase agreement
- Record deed with SPV as owner
- Obtain title insurance
- Set up property management
- Activate insurance policies

---

### Step 7.2: Investor Reporting
**Action:** Ongoing communication and distributions

**Monthly Updates:**
- Property performance summary
- Occupancy updates
- Major events (new leases, CapEx projects)

**Quarterly Distributions:**
- Calculate distributable cash flow
- Execute distribution via smart contract
- Automated payments (ACH or USDC)
- Tax reporting (K-1 generation)

**Annual Reporting:**
- Audited financial statements
- Property valuation update
- Investor tax documents (K-1s)

---

### Step 7.3: Secondary Market Liquidity
**Action:** Enable token trading on regulated secondary market

**Trading Enablement:**
- Lock-up period expires (e.g., 6-12 months)
- Tokens become transferable
- Listed on Commertize secondary marketplace
- Price discovery via order book or AMM

**Compliance:**
- Transfer restrictions remain enforced
- Only accredited investors can buy
- Blockchain-verified ownership transfers
- Automated compliance checks on each trade

---

## Technical Architecture Summary

### Database Schema
```
Sponsors Table:
- sponsor_id, company_name, ein, kyc_status, approval_date

Properties Table:
- property_id, sponsor_id, property_type, address, status, target_raise, current_raise

KYC_Records Table:
- record_id, user_id, verification_type, status, documents[], verified_date

Transactions Table:
- tx_id, property_id, investor_id, amount, token_quantity, timestamp

Smart_Contracts Table:
- contract_id, property_id, contract_address, network, deployment_date
```

### API Endpoints
```
POST /api/sponsor/register - Create sponsor account
POST /api/sponsor/kyc - Submit KYC documents
POST /api/property/submit - Submit property listing
GET /api/property/:id/status - Check listing status
POST /api/property/:id/approve - Admin approval
POST /api/tokenize - Deploy security token
POST /api/invest/:property_id - Investor subscription
GET /api/sponsor/dashboard - Sponsor metrics
```

### Blockchain Integration
- **Hedera Network:** ERC-3643 token deployment
- **Smart Contracts:** Compliance, distribution, escrow
- **Events:** PropertyTokenized, InvestmentMade, DistributionPaid

---

## Timeline Estimate

| Phase | Estimated Duration |
|-------|-------------------|
| Sponsor Onboarding & KYC | 3-7 days |
| Property Submission | 1-5 days (sponsor prep time) |
| Commertize Review & Approval | 2-4 weeks |
| Tokenization & Setup | 3-5 days |
| Marketing & Launch | 1-2 weeks (concurrent) |
| Fundraising Period | 30-90 days |
| Post-Funding Closing | 2-4 weeks |

**Total:** ~8-16 weeks from application to funded

---

## Success Metrics

**Sponsor KPIs:**
- Time to approval
- Approval rate
- Average raise amount
- Funding success rate
- Time to fully funded

**Platform KPIs:**
- Properties listed
- Total capital raised
- Average investment per property
- Secondary market liquidity
- Sponsor satisfaction score

---

## Regulatory Compliance Checklist

- [ ] Reg D 506(c) filing with SEC (Form D)
- [ ] Accreditation verification for all investors
- [ ] Blue sky law compliance (state securities)
- [ ] FINRA broker-dealer registration (if required)
- [ ] FinCEN AML program
- [ ] Privacy policy compliance (GDPR, CCPA)
- [ ] Securities law disclaimers on all materials
- [ ] Whistleblower policy
- [ ] Cybersecurity and data protection

---

## Next Steps for Implementation

1. **Design sponsor dashboard UI/UX**
2. **Build property submission form**
3. **Integrate KYC provider API**
4. **Develop admin review workflow**
5. **Create tokenization smart contracts**
6. **Build investor subscription flow**
7. **Set up escrow integration**
8. **Implement distribution automation**
9. **Create reporting templates**
10. **Build secondary market interface**

---

**Document Version:** 1.0
**Last Updated:** November 21, 2025
**Owner:** Commertize Platform Team
