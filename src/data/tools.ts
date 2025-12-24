// Common SMB tools/apps with logo.dev integration
// Logo URL format: https://img.logo.dev/{domain}?token={API_KEY}

export const LOGO_DEV_TOKEN = 'pk_KQoFyUYxR0G5tYpoPPW_7g';

export interface Tool {
  id: string;
  name: string;
  domain: string; // Used for logo.dev URL
  category: ToolCategory;
}

export type ToolCategory =
  | 'crm'
  | 'marketing'
  | 'automation'
  | 'communication'
  | 'payments'
  | 'scheduling'
  | 'forms'
  | 'storage'
  | 'analytics'
  | 'ecommerce'
  | 'social'
  | 'support'
  | 'accounting'
  | 'hr'
  | 'productivity';

export const TOOL_CATEGORIES: { id: ToolCategory; label: string }[] = [
  { id: 'crm', label: 'CRM' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'automation', label: 'Automation' },
  { id: 'communication', label: 'Communication' },
  { id: 'payments', label: 'Payments' },
  { id: 'scheduling', label: 'Scheduling' },
  { id: 'forms', label: 'Forms' },
  { id: 'storage', label: 'Storage' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'ecommerce', label: 'E-commerce' },
  { id: 'social', label: 'Social Media' },
  { id: 'support', label: 'Support' },
  { id: 'accounting', label: 'Accounting' },
  { id: 'hr', label: 'HR' },
  { id: 'productivity', label: 'Productivity' },
];

// 50 most commonly used apps for SMBs
export const TOOLS: Tool[] = [
  // CRM
  { id: 'gohighlevel', name: 'GoHighLevel', domain: 'gohighlevel.com', category: 'crm' },
  { id: 'salesforce', name: 'Salesforce', domain: 'salesforce.com', category: 'crm' },
  { id: 'hubspot', name: 'HubSpot', domain: 'hubspot.com', category: 'crm' },
  { id: 'pipedrive', name: 'Pipedrive', domain: 'pipedrive.com', category: 'crm' },
  { id: 'zoho', name: 'Zoho CRM', domain: 'zoho.com', category: 'crm' },

  // Automation
  { id: 'zapier', name: 'Zapier', domain: 'zapier.com', category: 'automation' },
  { id: 'make', name: 'Make', domain: 'make.com', category: 'automation' },
  { id: 'n8n', name: 'n8n', domain: 'n8n.io', category: 'automation' },
  { id: 'activepieces', name: 'Activepieces', domain: 'activepieces.com', category: 'automation' },
  { id: 'pabbly', name: 'Pabbly Connect', domain: 'pabbly.com', category: 'automation' },

  // Marketing
  { id: 'mailchimp', name: 'Mailchimp', domain: 'mailchimp.com', category: 'marketing' },
  { id: 'activecampaign', name: 'ActiveCampaign', domain: 'activecampaign.com', category: 'marketing' },
  { id: 'klaviyo', name: 'Klaviyo', domain: 'klaviyo.com', category: 'marketing' },
  { id: 'convertkit', name: 'ConvertKit', domain: 'convertkit.com', category: 'marketing' },
  { id: 'sendgrid', name: 'SendGrid', domain: 'sendgrid.com', category: 'marketing' },

  // Communication
  { id: 'slack', name: 'Slack', domain: 'slack.com', category: 'communication' },
  { id: 'twilio', name: 'Twilio', domain: 'twilio.com', category: 'communication' },
  { id: 'zoom', name: 'Zoom', domain: 'zoom.us', category: 'communication' },
  { id: 'teams', name: 'Microsoft Teams', domain: 'microsoft.com', category: 'communication' },
  { id: 'intercom', name: 'Intercom', domain: 'intercom.com', category: 'communication' },

  // Payments
  { id: 'stripe', name: 'Stripe', domain: 'stripe.com', category: 'payments' },
  { id: 'paypal', name: 'PayPal', domain: 'paypal.com', category: 'payments' },
  { id: 'square', name: 'Square', domain: 'squareup.com', category: 'payments' },
  { id: 'gocardless', name: 'GoCardless', domain: 'gocardless.com', category: 'payments' },

  // Scheduling
  { id: 'calendly', name: 'Calendly', domain: 'calendly.com', category: 'scheduling' },
  { id: 'acuity', name: 'Acuity Scheduling', domain: 'acuityscheduling.com', category: 'scheduling' },
  { id: 'cal', name: 'Cal.com', domain: 'cal.com', category: 'scheduling' },

  // Forms & Surveys
  { id: 'typeform', name: 'Typeform', domain: 'typeform.com', category: 'forms' },
  { id: 'jotform', name: 'JotForm', domain: 'jotform.com', category: 'forms' },
  { id: 'googleforms', name: 'Google Forms', domain: 'google.com', category: 'forms' },
  { id: 'surveymonkey', name: 'SurveyMonkey', domain: 'surveymonkey.com', category: 'forms' },

  // Storage & Database
  { id: 'airtable', name: 'Airtable', domain: 'airtable.com', category: 'storage' },
  { id: 'notion', name: 'Notion', domain: 'notion.so', category: 'storage' },
  { id: 'googlesheets', name: 'Google Sheets', domain: 'google.com', category: 'storage' },
  { id: 'dropbox', name: 'Dropbox', domain: 'dropbox.com', category: 'storage' },
  { id: 'googledrive', name: 'Google Drive', domain: 'google.com', category: 'storage' },

  // Analytics
  { id: 'googleanalytics', name: 'Google Analytics', domain: 'google.com', category: 'analytics' },
  { id: 'mixpanel', name: 'Mixpanel', domain: 'mixpanel.com', category: 'analytics' },
  { id: 'hotjar', name: 'Hotjar', domain: 'hotjar.com', category: 'analytics' },

  // E-commerce
  { id: 'shopify', name: 'Shopify', domain: 'shopify.com', category: 'ecommerce' },
  { id: 'woocommerce', name: 'WooCommerce', domain: 'woocommerce.com', category: 'ecommerce' },
  { id: 'bigcommerce', name: 'BigCommerce', domain: 'bigcommerce.com', category: 'ecommerce' },

  // Social Media
  { id: 'facebook', name: 'Facebook', domain: 'facebook.com', category: 'social' },
  { id: 'instagram', name: 'Instagram', domain: 'instagram.com', category: 'social' },
  { id: 'linkedin', name: 'LinkedIn', domain: 'linkedin.com', category: 'social' },
  { id: 'twitter', name: 'X (Twitter)', domain: 'x.com', category: 'social' },

  // Support
  { id: 'zendesk', name: 'Zendesk', domain: 'zendesk.com', category: 'support' },
  { id: 'freshdesk', name: 'Freshdesk', domain: 'freshdesk.com', category: 'support' },
  { id: 'helpscout', name: 'Help Scout', domain: 'helpscout.com', category: 'support' },

  // Accounting
  { id: 'quickbooks', name: 'QuickBooks', domain: 'quickbooks.intuit.com', category: 'accounting' },
  { id: 'xero', name: 'Xero', domain: 'xero.com', category: 'accounting' },
  { id: 'freshbooks', name: 'FreshBooks', domain: 'freshbooks.com', category: 'accounting' },

  // HR
  { id: 'gusto', name: 'Gusto', domain: 'gusto.com', category: 'hr' },
  { id: 'bamboohr', name: 'BambooHR', domain: 'bamboohr.com', category: 'hr' },

  // Productivity
  { id: 'asana', name: 'Asana', domain: 'asana.com', category: 'productivity' },
  { id: 'trello', name: 'Trello', domain: 'trello.com', category: 'productivity' },
  { id: 'monday', name: 'Monday.com', domain: 'monday.com', category: 'productivity' },
  { id: 'clickup', name: 'ClickUp', domain: 'clickup.com', category: 'productivity' },
];

// Default CRM tool - GoHighLevel
export const DEFAULT_CRM = TOOLS.find(t => t.id === 'gohighlevel')!;

// Helper to get logo URL for a tool
export function getToolLogoUrl(domain: string, size: number = 64): string {
  return `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=${size}`;
}

// Get tools by category
export function getToolsByCategory(category: ToolCategory): Tool[] {
  return TOOLS.filter(tool => tool.category === category);
}

// Find tool by ID
export function getToolById(id: string): Tool | undefined {
  return TOOLS.find(tool => tool.id === id);
}
