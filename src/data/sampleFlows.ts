/**
 * Sample Flows - Standard Mermaid Flowchart Templates
 *
 * All templates use standard Mermaid syntax with proper shapes:
 * - [Text] = rectangle (actions/processes)
 * - ([Text]) = stadium (triggers/outcomes)
 * - {Text} = diamond (decisions)
 * - ((Text)) = circle (delays/waits)
 * - [(Text)] = database/cylinder (storage/data)
 * - [[Text]] = subroutine (integrations/external)
 */

export interface SampleFlow {
  id: string;
  name: string;
  industry: string;
  description: string;
  mermaidCode: string;
}

// E-commerce Order Fulfillment
const ecommerceMermaid = `graph TB
    A([Order Received]) --> B[Verify Payment]
    B --> C{Payment Valid?}
    C -->|Failed| D[Notify Customer]
    D --> E([Order Cancelled])
    C -->|Success| F[Check Inventory]
    F --> G{In Stock?}
    G -->|No| H((Backorder Items))
    H --> I[Pick & Pack]
    G -->|Yes| I
    I --> J[[Ship Order]]
    J --> K([Order Delivered])
`;

// Healthcare Patient Intake
const healthcareMermaid = `graph TB
    A([Patient Arrives]) --> B[Verify Insurance]
    B --> C{Insurance Valid?}
    C -->|No| D[Self-Pay Options]
    C -->|Yes| E[Collect Copay]
    D --> F[Record Vitals]
    E --> F
    F --> G{Emergency?}
    G -->|Yes| H[Priority Treatment]
    G -->|No| I((Wait for Doctor))
    H --> J[Doctor Consultation]
    I --> J
    J --> K([Treatment Complete])
`;

// SaaS User Onboarding
const saasMermaid = `graph TB
    A([User Signs Up]) --> B[[Send Welcome Email]]
    B --> C{Email Verified?}
    C -->|No| D((Send Reminder))
    D --> C
    C -->|Yes| E[Show Product Tour]
    E --> F{Tour Completed?}
    F -->|Skip| G[Skip Tour]
    F -->|Complete| H[Create First Project]
    G --> I{Trial User?}
    H --> I
    I -->|Trial| J((Start Trial Timer))
    I -->|Paid| K[Activate Subscription]
    J --> L([User Onboarded])
    K --> L
`;

// HR Recruitment Process
const recruitmentMermaid = `graph TB
    A([Job Posted]) --> B[Applications Received]
    B --> C[Screen Resumes]
    C --> D{Meets Requirements?}
    D -->|No| E[[Send Rejection]]
    D -->|Yes| F[Phone Screen]
    F --> G{Passed Screen?}
    G -->|No| E
    G -->|Yes| H[Technical Interview]
    G -->|Yes| I[Culture Fit Interview]
    H --> J{Final Decision}
    I --> J
    J -->|Maybe Later| K[(Add to Talent Pool)]
    J -->|Hire| L[Send Offer]
    L --> M([Candidate Hired])
`;

// Restaurant Order Processing
const restaurantMermaid = `graph TB
    A([Order Placed]) --> B{Order Type?}
    B -->|Dine-in| C[Assign Table]
    B -->|Takeout| D[Prepare Packaging]
    B -->|Delivery| E[[Notify Driver]]
    C --> F[Send to Kitchen]
    D --> F
    E --> F
    F --> G((Prepare Food))
    G --> H[Quality Check]
    H --> I{Passed QC?}
    I -->|No| J[Remake Item]
    J --> G
    I -->|Yes| K[Serve or Dispatch]
    K --> L([Order Complete])
`;

// Customer Support Ticket
const supportMermaid = `graph TB
    A([Ticket Created]) --> B[[Auto-Categorize]]
    B --> C{Priority Level?}
    C -->|Low| D[Route to L1]
    C -->|Medium| E[Route to L2]
    C -->|High| F[Route to L3]
    D --> G[Investigate Issue]
    E --> G
    F --> G
    G --> H{Solution Found?}
    H -->|No| I[Escalate]
    I --> G
    H -->|Yes| J[Apply Fix]
    J --> K[Verify Resolution]
    K --> L([Ticket Closed])
`;

// GHL - Dental Practice Lead Nurture
const ghlDentalMermaid = `graph TB
    A([New Lead Captured]) --> B[[GoHighLevel CRM]]
    B --> C[[Add to Pipeline]]
    C --> D[[Send Welcome SMS]]
    D --> E((Wait 5 Minutes))
    E --> F[Call Attempt 1]
    F --> G{Answered?}
    G -->|Yes| H[Book Appointment]
    G -->|No| I[[Send Voicemail Drop]]
    I --> J((Wait 2 Hours))
    J --> K[[Send Follow-up Email]]
    K --> L[Call Attempt 2]
    L --> M{Connected?}
    M -->|No Answer| N[(Add to Long-term Nurture)]
    M -->|Connected| H
    H --> O[[Send Confirmation]]
    O --> P((Reminder 24hr Before))
    P --> Q[[Reminder 1hr Before]]
    Q --> R([Patient Arrives])
`;

// GHL - HVAC/Home Services Lead Flow
const ghlHvacMermaid = `graph TB
    A([Service Request]) --> B[[GoHighLevel CRM]]
    B --> C[Tag by Service Type]
    C --> D[[Instant SMS Response]]
    D --> E{Service Type?}
    E -->|Emergency| F[Emergency Queue]
    E -->|Repair| G[Same-Day Queue]
    E -->|Quote| H[Quote Request]
    F --> I[[Dispatch Tech Now]]
    G --> J[Book Time Slot]
    H --> K[[Send Quote Email]]
    I --> L[[Send Tech ETA]]
    J --> L
    K --> M((Wait 24 Hours))
    M --> N[[Quote Follow-up]]
    N --> O{Responded?}
    O -->|Yes| P[Book Service]
    O -->|No| Q[(Drip Campaign)]
    L --> R[Job Completed]
    P --> R
    R --> S[[Request Review]]
    S --> T([Add to Maintenance List])
`;

// GHL - Real Estate Agent Lead Nurture
const ghlRealEstateMermaid = `graph TB
    A([Lead Inquiry]) --> B[[GoHighLevel CRM]]
    B --> C[[Speed to Lead SMS]]
    C --> D[[AI Conversation]]
    D --> E{Lead Type?}
    E -->|Buyer| F[Buyer Qualification]
    E -->|Seller| G[Seller Qualification]
    F --> H{Pre-Approved?}
    H -->|No| I[[Send to Lender]]
    H -->|Yes| J[[Send Listings]]
    I --> J
    G --> K[Schedule CMA]
    J --> L{Hot Lead?}
    K --> L
    L -->|Not Yet| M[(Nurture Sequence)]
    L -->|Yes| N[Book Showing]
    N --> O((Appointment Reminder))
    O --> P[[Post-Showing Follow-up]]
    P --> Q([Deal in Progress])
`;

// GHL - Gym/Fitness Studio Lead Flow
const ghlGymMermaid = `graph TB
    A([Free Trial Signup]) --> B[[GoHighLevel CRM]]
    B --> C[[Welcome Text]]
    C --> D[[Send Waiver Link]]
    D --> E{Waiver Signed?}
    E -->|No| F((Reminder SMS))
    F --> E
    E -->|Yes| G[Book Trial Class]
    G --> H((Class Reminder))
    H --> I{Attended?}
    I -->|No| J[[No-Show Sequence]]
    J --> G
    I -->|Yes| K[[Post-Class Survey]]
    K --> L[[Send Membership Offer]]
    L --> M{Responded?}
    M -->|Interested| N[Sales Call]
    M -->|Hesitant| O[[Objection Handling]]
    N --> P{Signed Up?}
    O --> P
    P -->|No| Q[(Long-term Nurture)]
    P -->|Yes| R([New Member Onboard])
`;

// GHL - Law Firm / Legal Services Lead Flow
const ghlLegalMermaid = `graph TB
    A([Case Inquiry]) --> B[[GoHighLevel CRM]]
    B --> C[[Instant Response]]
    C --> D{Case Type?}
    D -->|PI| E[Personal Injury]
    D -->|Family| F[Family Law]
    D -->|Criminal| G[Criminal Defense]
    D -->|Other| H[Business or Other]
    E --> I[Intake Specialist Call]
    F --> I
    G --> I
    H --> I
    I --> J{Qualified Case?}
    J -->|No| K[[Refer Out]]
    J -->|Yes| L[Schedule Consultation]
    L --> M[[Send Intake Forms]]
    M --> N((Consultation Reminder))
    N --> O[Attorney Consult]
    O --> P{Retained?}
    P -->|Not Yet| Q[(Follow-up Sequence)]
    P -->|Yes| R([Client Onboarding])
`;

// GHL - Med Spa / Aesthetics Lead Flow
const ghlMedSpaMermaid = `graph TB
    A([Lead Captured]) --> B[[GoHighLevel CRM]]
    B --> C[[Add to CRM]]
    C --> D[[Send Offer SMS]]
    D --> E{Interest Area?}
    E -->|Injectables| F[Injectables Track]
    E -->|Body| G[Body Contouring]
    E -->|Skin| H[Skin Treatments]
    F --> I[[Send Treatment Guide]]
    G --> I
    H --> I
    I --> J((Wait 1 Hour))
    J --> K[[Book Consult CTA]]
    K --> L{Booked?}
    L -->|No| M[Phone Follow-up]
    L -->|Yes| N[[Send Confirmation]]
    M --> O{Reached?}
    O -->|No| P[(Drip Sequence)]
    O -->|Booked| N
    N --> Q[[Pre-Consult Prep]]
    Q --> R[Consultation]
    R --> S([Treatment Booked])
`;

export const sampleFlows: SampleFlow[] = [
  // GHL Automation Flows (Featured)
  {
    id: 'ghl-dental',
    name: 'Dental Lead Nurture',
    industry: 'GHL - Dental',
    description: 'Speed-to-lead with appointment booking',
    mermaidCode: ghlDentalMermaid,
  },
  {
    id: 'ghl-hvac',
    name: 'Home Services Lead',
    industry: 'GHL - HVAC',
    description: 'Emergency, repair & quote routing',
    mermaidCode: ghlHvacMermaid,
  },
  {
    id: 'ghl-realestate',
    name: 'Real Estate Nurture',
    industry: 'GHL - Realty',
    description: 'Buyer & seller qualification flow',
    mermaidCode: ghlRealEstateMermaid,
  },
  {
    id: 'ghl-gym',
    name: 'Gym Trial Conversion',
    industry: 'GHL - Fitness',
    description: 'Free trial to membership flow',
    mermaidCode: ghlGymMermaid,
  },
  {
    id: 'ghl-legal',
    name: 'Law Firm Intake',
    industry: 'GHL - Legal',
    description: 'Case routing and consultation booking',
    mermaidCode: ghlLegalMermaid,
  },
  {
    id: 'ghl-medspa',
    name: 'Med Spa Leads',
    industry: 'GHL - Med Spa',
    description: 'Treatment interest to consultation',
    mermaidCode: ghlMedSpaMermaid,
  },
  // General Industry Flows
  {
    id: 'ecommerce',
    name: 'Order Fulfillment',
    industry: 'E-commerce',
    description: 'Complete order processing from payment to delivery',
    mermaidCode: ecommerceMermaid,
  },
  {
    id: 'healthcare',
    name: 'Patient Intake',
    industry: 'Healthcare',
    description: 'Patient check-in and treatment workflow',
    mermaidCode: healthcareMermaid,
  },
  {
    id: 'saas',
    name: 'User Onboarding',
    industry: 'SaaS',
    description: 'New user signup and activation flow',
    mermaidCode: saasMermaid,
  },
  {
    id: 'recruitment',
    name: 'Hiring Process',
    industry: 'HR',
    description: 'End-to-end recruitment workflow',
    mermaidCode: recruitmentMermaid,
  },
  {
    id: 'restaurant',
    name: 'Order Processing',
    industry: 'Restaurant',
    description: 'Kitchen order flow for all order types',
    mermaidCode: restaurantMermaid,
  },
  {
    id: 'support',
    name: 'Support Ticket',
    industry: 'Customer Service',
    description: 'Multi-tier support escalation process',
    mermaidCode: supportMermaid,
  },
];
