import { ProcessEdge } from '@/types/flow';
import { Node } from '@xyflow/react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyNode = Node<any, string>;

export interface SampleFlow {
  id: string;
  name: string;
  industry: string;
  description: string;
  nodes: AnyNode[];
  edges: ProcessEdge[];
}

// Spacing constants matching Mermaid defaults
const RANK_SEP = 150;  // Vertical spacing between rows
const NODE_SEP = 280;  // Horizontal spacing between columns

// E-commerce Order Fulfillment
const ecommerceNodes: AnyNode[] = [
  { id: 'ec_1', type: 'processNode', position: { x: 0, y: 0 }, data: { label: 'Order Received', description: 'New order placed on website', nodeType: 'trigger', shape: 'stadium' } },
  { id: 'ec_2', type: 'processNode', position: { x: 0, y: RANK_SEP }, data: { label: 'Verify Payment', description: 'Check payment status', nodeType: 'action', shape: 'rectangle' } },
  { id: 'ec_3', type: 'processNode', position: { x: 0, y: RANK_SEP * 2 }, data: { label: 'Payment Valid?', description: 'Is payment successful?', nodeType: 'decision', shape: 'diamond' } },
  { id: 'ec_4', type: 'processNode', position: { x: -NODE_SEP, y: RANK_SEP * 3 }, data: { label: 'Notify Customer', description: 'Send payment failure email', nodeType: 'action', shape: 'rectangle' } },
  { id: 'ec_5', type: 'processNode', position: { x: -NODE_SEP, y: RANK_SEP * 4 }, data: { label: 'Order Cancelled', description: 'Cancel and refund order', nodeType: 'outcome', shape: 'stadium' } },
  { id: 'ec_6', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 3 }, data: { label: 'Check Inventory', description: 'Verify stock availability', nodeType: 'action', shape: 'rectangle' } },
  { id: 'ec_7', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 4 }, data: { label: 'In Stock?', description: 'Items available?', nodeType: 'decision', shape: 'diamond' } },
  { id: 'ec_8', type: 'processNode', position: { x: 0, y: RANK_SEP * 5 }, data: { label: 'Backorder Items', description: 'Place backorder with supplier', nodeType: 'delay', shape: 'circle' } },
  { id: 'ec_9', type: 'processNode', position: { x: NODE_SEP * 1.5, y: RANK_SEP * 5 }, data: { label: 'Pick & Pack', description: 'Prepare items for shipping', nodeType: 'action', shape: 'rectangle' } },
  { id: 'ec_10', type: 'processNode', position: { x: NODE_SEP * 1.5, y: RANK_SEP * 6 }, data: { label: 'Ship Order', description: 'Hand off to carrier', nodeType: 'integration', shape: 'subroutine' } },
  { id: 'ec_11', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 7 }, data: { label: 'Order Delivered', description: 'Customer receives package', nodeType: 'outcome', shape: 'stadium' } },
];

const ecommerceEdges: ProcessEdge[] = [
  { id: 'e_ec_1-2', source: 'ec_1', target: 'ec_2', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_ec_2-3', source: 'ec_2', target: 'ec_3', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_ec_3-4', source: 'ec_3', target: 'ec_4', sourceHandle: 'left', targetHandle: 'top', type: 'animated', data: { label: 'Failed' } },
  { id: 'e_ec_4-5', source: 'ec_4', target: 'ec_5', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_ec_3-6', source: 'ec_3', target: 'ec_6', sourceHandle: 'right', targetHandle: 'top', type: 'animated', data: { label: 'Success' } },
  { id: 'e_ec_6-7', source: 'ec_6', target: 'ec_7', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_ec_7-8', source: 'ec_7', target: 'ec_8', sourceHandle: 'left', targetHandle: 'top', type: 'animated', data: { label: 'No' } },
  { id: 'e_ec_7-9', source: 'ec_7', target: 'ec_9', sourceHandle: 'right', targetHandle: 'top', type: 'animated', data: { label: 'Yes' } },
  { id: 'e_ec_8-9', source: 'ec_8', target: 'ec_9', sourceHandle: 'right', targetHandle: 'left', type: 'animated' },
  { id: 'e_ec_9-10', source: 'ec_9', target: 'ec_10', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_ec_10-11', source: 'ec_10', target: 'ec_11', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
];

// Healthcare Patient Intake
const healthcareNodes: AnyNode[] = [
  { id: 'hc_1', type: 'processNode', position: { x: 0, y: 0 }, data: { label: 'Patient Arrives', description: 'Patient checks in at reception', nodeType: 'trigger', shape: 'stadium' } },
  { id: 'hc_2', type: 'processNode', position: { x: 0, y: RANK_SEP }, data: { label: 'Verify Insurance', description: 'Check coverage and eligibility', nodeType: 'action', shape: 'rectangle' } },
  { id: 'hc_3', type: 'processNode', position: { x: 0, y: RANK_SEP * 2 }, data: { label: 'Insurance Valid?', description: 'Coverage confirmed?', nodeType: 'decision', shape: 'diamond' } },
  { id: 'hc_4', type: 'processNode', position: { x: -NODE_SEP, y: RANK_SEP * 3 }, data: { label: 'Self-Pay Options', description: 'Discuss payment plans', nodeType: 'action', shape: 'rectangle' } },
  { id: 'hc_5', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 3 }, data: { label: 'Collect Copay', description: 'Process insurance copay', nodeType: 'action', shape: 'rectangle' } },
  { id: 'hc_6', type: 'processNode', position: { x: 0, y: RANK_SEP * 4 }, data: { label: 'Record Vitals', description: 'Blood pressure, weight, etc.', nodeType: 'action', shape: 'rectangle' } },
  { id: 'hc_7', type: 'processNode', position: { x: 0, y: RANK_SEP * 5 }, data: { label: 'Emergency?', description: 'Urgent care needed?', nodeType: 'decision', shape: 'diamond' } },
  { id: 'hc_8', type: 'processNode', position: { x: -NODE_SEP, y: RANK_SEP * 6 }, data: { label: 'Priority Treatment', description: 'Immediate medical attention', nodeType: 'action', shape: 'rectangle' } },
  { id: 'hc_9', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 6 }, data: { label: 'Wait for Doctor', description: 'Standard wait time', nodeType: 'delay', shape: 'circle' } },
  { id: 'hc_10', type: 'processNode', position: { x: 0, y: RANK_SEP * 7 }, data: { label: 'Doctor Consultation', description: 'Medical examination', nodeType: 'action', shape: 'rectangle' } },
  { id: 'hc_11', type: 'processNode', position: { x: 0, y: RANK_SEP * 8 }, data: { label: 'Treatment Complete', description: 'Patient discharged', nodeType: 'outcome', shape: 'stadium' } },
];

const healthcareEdges: ProcessEdge[] = [
  { id: 'e_hc_1-2', source: 'hc_1', target: 'hc_2', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_hc_2-3', source: 'hc_2', target: 'hc_3', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_hc_3-4', source: 'hc_3', target: 'hc_4', sourceHandle: 'left', targetHandle: 'top', type: 'animated', data: { label: 'No' } },
  { id: 'e_hc_3-5', source: 'hc_3', target: 'hc_5', sourceHandle: 'right', targetHandle: 'top', type: 'animated', data: { label: 'Yes' } },
  { id: 'e_hc_4-6', source: 'hc_4', target: 'hc_6', sourceHandle: 'bottom', targetHandle: 'left', type: 'animated' },
  { id: 'e_hc_5-6', source: 'hc_5', target: 'hc_6', sourceHandle: 'bottom', targetHandle: 'right', type: 'animated' },
  { id: 'e_hc_6-7', source: 'hc_6', target: 'hc_7', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_hc_7-8', source: 'hc_7', target: 'hc_8', sourceHandle: 'left', targetHandle: 'top', type: 'animated', data: { label: 'Yes' } },
  { id: 'e_hc_7-9', source: 'hc_7', target: 'hc_9', sourceHandle: 'right', targetHandle: 'top', type: 'animated', data: { label: 'No' } },
  { id: 'e_hc_8-10', source: 'hc_8', target: 'hc_10', sourceHandle: 'bottom', targetHandle: 'left', type: 'animated' },
  { id: 'e_hc_9-10', source: 'hc_9', target: 'hc_10', sourceHandle: 'bottom', targetHandle: 'right', type: 'animated' },
  { id: 'e_hc_10-11', source: 'hc_10', target: 'hc_11', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
];

// SaaS User Onboarding
const saasNodes: AnyNode[] = [
  { id: 'saas_1', type: 'processNode', position: { x: 0, y: 0 }, data: { label: 'User Signs Up', description: 'New account created', nodeType: 'trigger', shape: 'stadium' } },
  { id: 'saas_2', type: 'processNode', position: { x: 0, y: RANK_SEP }, data: { label: 'Send Welcome Email', description: 'Automated welcome message', nodeType: 'integration', shape: 'subroutine' } },
  { id: 'saas_3', type: 'processNode', position: { x: 0, y: RANK_SEP * 2 }, data: { label: 'Email Verified?', description: 'User confirms email', nodeType: 'decision', shape: 'diamond' } },
  { id: 'saas_4', type: 'processNode', position: { x: -NODE_SEP, y: RANK_SEP * 3 }, data: { label: 'Send Reminder', description: 'Follow-up verification email', nodeType: 'delay', shape: 'circle' } },
  { id: 'saas_5', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 3 }, data: { label: 'Show Product Tour', description: 'Interactive walkthrough', nodeType: 'action', shape: 'rectangle' } },
  { id: 'saas_6', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 4 }, data: { label: 'Tour Completed?', description: 'User finishes tour', nodeType: 'decision', shape: 'diamond' } },
  { id: 'saas_7', type: 'processNode', position: { x: 0, y: RANK_SEP * 5 }, data: { label: 'Skip Tour', description: 'User skips onboarding', nodeType: 'action', shape: 'rectangle' } },
  { id: 'saas_8', type: 'processNode', position: { x: NODE_SEP * 1.5, y: RANK_SEP * 5 }, data: { label: 'Create First Project', description: 'Guided project setup', nodeType: 'action', shape: 'rectangle' } },
  { id: 'saas_9', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 6 }, data: { label: 'Trial User?', description: 'Free trial or paid?', nodeType: 'decision', shape: 'diamond' } },
  { id: 'saas_10', type: 'processNode', position: { x: 0, y: RANK_SEP * 7 }, data: { label: 'Start Trial Timer', description: '14-day countdown begins', nodeType: 'delay', shape: 'circle' } },
  { id: 'saas_11', type: 'processNode', position: { x: NODE_SEP * 1.5, y: RANK_SEP * 7 }, data: { label: 'Activate Subscription', description: 'Full access granted', nodeType: 'action', shape: 'rectangle' } },
  { id: 'saas_12', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 8 }, data: { label: 'User Onboarded', description: 'Ready to use product', nodeType: 'outcome', shape: 'stadium' } },
];

const saasEdges: ProcessEdge[] = [
  { id: 'e_saas_1-2', source: 'saas_1', target: 'saas_2', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_saas_2-3', source: 'saas_2', target: 'saas_3', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_saas_3-4', source: 'saas_3', target: 'saas_4', sourceHandle: 'left', targetHandle: 'top', type: 'animated', data: { label: 'No' } },
  { id: 'e_saas_4-3', source: 'saas_4', target: 'saas_3', sourceHandle: 'right', targetHandle: 'left', type: 'animated', data: { label: 'Retry' } },
  { id: 'e_saas_3-5', source: 'saas_3', target: 'saas_5', sourceHandle: 'right', targetHandle: 'top', type: 'animated', data: { label: 'Yes' } },
  { id: 'e_saas_5-6', source: 'saas_5', target: 'saas_6', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_saas_6-7', source: 'saas_6', target: 'saas_7', sourceHandle: 'left', targetHandle: 'top', type: 'animated', data: { label: 'Skip' } },
  { id: 'e_saas_6-8', source: 'saas_6', target: 'saas_8', sourceHandle: 'right', targetHandle: 'top', type: 'animated', data: { label: 'Complete' } },
  { id: 'e_saas_7-9', source: 'saas_7', target: 'saas_9', sourceHandle: 'bottom', targetHandle: 'left', type: 'animated' },
  { id: 'e_saas_8-9', source: 'saas_8', target: 'saas_9', sourceHandle: 'bottom', targetHandle: 'right', type: 'animated' },
  { id: 'e_saas_9-10', source: 'saas_9', target: 'saas_10', sourceHandle: 'left', targetHandle: 'top', type: 'animated', data: { label: 'Trial' } },
  { id: 'e_saas_9-11', source: 'saas_9', target: 'saas_11', sourceHandle: 'right', targetHandle: 'top', type: 'animated', data: { label: 'Paid' } },
  { id: 'e_saas_10-12', source: 'saas_10', target: 'saas_12', sourceHandle: 'bottom', targetHandle: 'left', type: 'animated' },
  { id: 'e_saas_11-12', source: 'saas_11', target: 'saas_12', sourceHandle: 'bottom', targetHandle: 'right', type: 'animated' },
];

// HR Recruitment Process
const recruitmentNodes: AnyNode[] = [
  { id: 'hr_1', type: 'processNode', position: { x: 0, y: 0 }, data: { label: 'Job Posted', description: 'New position advertised', nodeType: 'trigger', shape: 'stadium' } },
  { id: 'hr_2', type: 'processNode', position: { x: 0, y: RANK_SEP }, data: { label: 'Applications Received', description: 'Candidates apply', nodeType: 'action', shape: 'rectangle' } },
  { id: 'hr_3', type: 'processNode', position: { x: 0, y: RANK_SEP * 2 }, data: { label: 'Screen Resumes', description: 'Initial filtering', nodeType: 'action', shape: 'rectangle' } },
  { id: 'hr_4', type: 'processNode', position: { x: 0, y: RANK_SEP * 3 }, data: { label: 'Meets Requirements?', description: 'Qualifications match?', nodeType: 'decision', shape: 'diamond' } },
  { id: 'hr_5', type: 'processNode', position: { x: -NODE_SEP, y: RANK_SEP * 4 }, data: { label: 'Send Rejection', description: 'Automated rejection email', nodeType: 'integration', shape: 'subroutine' } },
  { id: 'hr_6', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 4 }, data: { label: 'Phone Screen', description: 'Initial phone interview', nodeType: 'action', shape: 'rectangle' } },
  { id: 'hr_7', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 5 }, data: { label: 'Passed Screen?', description: 'Move to next round?', nodeType: 'decision', shape: 'diamond' } },
  { id: 'hr_8', type: 'processNode', position: { x: 0, y: RANK_SEP * 6 }, data: { label: 'Technical Interview', description: 'Skills assessment', nodeType: 'action', shape: 'rectangle' } },
  { id: 'hr_9', type: 'processNode', position: { x: NODE_SEP * 1.5, y: RANK_SEP * 6 }, data: { label: 'Culture Fit Interview', description: 'Team fit assessment', nodeType: 'action', shape: 'rectangle' } },
  { id: 'hr_10', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 7 }, data: { label: 'Final Decision', description: 'Hire or not?', nodeType: 'decision', shape: 'diamond' } },
  { id: 'hr_11', type: 'processNode', position: { x: 0, y: RANK_SEP * 8 }, data: { label: 'Add to Talent Pool', description: 'Keep for future roles', nodeType: 'outcome', shape: 'database' } },
  { id: 'hr_12', type: 'processNode', position: { x: NODE_SEP * 1.5, y: RANK_SEP * 8 }, data: { label: 'Send Offer', description: 'Extend job offer', nodeType: 'action', shape: 'rectangle' } },
  { id: 'hr_13', type: 'processNode', position: { x: NODE_SEP * 1.5, y: RANK_SEP * 9 }, data: { label: 'Candidate Hired', description: 'Onboarding begins', nodeType: 'outcome', shape: 'stadium' } },
];

const recruitmentEdges: ProcessEdge[] = [
  { id: 'e_hr_1-2', source: 'hr_1', target: 'hr_2', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_hr_2-3', source: 'hr_2', target: 'hr_3', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_hr_3-4', source: 'hr_3', target: 'hr_4', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_hr_4-5', source: 'hr_4', target: 'hr_5', sourceHandle: 'left', targetHandle: 'top', type: 'animated', data: { label: 'No' } },
  { id: 'e_hr_4-6', source: 'hr_4', target: 'hr_6', sourceHandle: 'right', targetHandle: 'top', type: 'animated', data: { label: 'Yes' } },
  { id: 'e_hr_6-7', source: 'hr_6', target: 'hr_7', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_hr_7-5', source: 'hr_7', target: 'hr_5', sourceHandle: 'left', targetHandle: 'right', type: 'animated', data: { label: 'No' } },
  { id: 'e_hr_7-8', source: 'hr_7', target: 'hr_8', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated', data: { label: 'Yes' } },
  { id: 'e_hr_7-9', source: 'hr_7', target: 'hr_9', sourceHandle: 'right', targetHandle: 'top', type: 'animated', data: { label: 'Yes' } },
  { id: 'e_hr_8-10', source: 'hr_8', target: 'hr_10', sourceHandle: 'bottom', targetHandle: 'left', type: 'animated' },
  { id: 'e_hr_9-10', source: 'hr_9', target: 'hr_10', sourceHandle: 'bottom', targetHandle: 'right', type: 'animated' },
  { id: 'e_hr_10-11', source: 'hr_10', target: 'hr_11', sourceHandle: 'left', targetHandle: 'top', type: 'animated', data: { label: 'Maybe Later' } },
  { id: 'e_hr_10-12', source: 'hr_10', target: 'hr_12', sourceHandle: 'right', targetHandle: 'top', type: 'animated', data: { label: 'Hire' } },
  { id: 'e_hr_12-13', source: 'hr_12', target: 'hr_13', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
];

// Restaurant Order Processing
const restaurantNodes: AnyNode[] = [
  { id: 'rest_1', type: 'processNode', position: { x: 0, y: 0 }, data: { label: 'Order Placed', description: 'Customer places order', nodeType: 'trigger', shape: 'stadium' } },
  { id: 'rest_2', type: 'processNode', position: { x: 0, y: RANK_SEP }, data: { label: 'Order Type?', description: 'Dine-in, takeout, or delivery?', nodeType: 'decision', shape: 'diamond' } },
  { id: 'rest_3', type: 'processNode', position: { x: -NODE_SEP, y: RANK_SEP * 2 }, data: { label: 'Assign Table', description: 'Seat the customer', nodeType: 'action', shape: 'rectangle' } },
  { id: 'rest_4', type: 'processNode', position: { x: 0, y: RANK_SEP * 2 }, data: { label: 'Prepare Packaging', description: 'Get takeout containers', nodeType: 'action', shape: 'rectangle' } },
  { id: 'rest_5', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 2 }, data: { label: 'Notify Driver', description: 'Alert delivery partner', nodeType: 'integration', shape: 'subroutine' } },
  { id: 'rest_6', type: 'processNode', position: { x: 0, y: RANK_SEP * 3 }, data: { label: 'Send to Kitchen', description: 'Kitchen receives order', nodeType: 'action', shape: 'rectangle' } },
  { id: 'rest_7', type: 'processNode', position: { x: 0, y: RANK_SEP * 4 }, data: { label: 'Prepare Food', description: 'Cooking in progress', nodeType: 'delay', shape: 'circle' } },
  { id: 'rest_8', type: 'processNode', position: { x: 0, y: RANK_SEP * 5 }, data: { label: 'Quality Check', description: 'Verify order accuracy', nodeType: 'action', shape: 'rectangle' } },
  { id: 'rest_9', type: 'processNode', position: { x: 0, y: RANK_SEP * 6 }, data: { label: 'Passed QC?', description: 'Order correct?', nodeType: 'decision', shape: 'diamond' } },
  { id: 'rest_10', type: 'processNode', position: { x: -NODE_SEP, y: RANK_SEP * 7 }, data: { label: 'Remake Item', description: 'Redo incorrect items', nodeType: 'action', shape: 'rectangle' } },
  { id: 'rest_11', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 7 }, data: { label: 'Serve/Dispatch', description: 'Deliver to customer', nodeType: 'action', shape: 'rectangle' } },
  { id: 'rest_12', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 8 }, data: { label: 'Order Complete', description: 'Customer satisfied', nodeType: 'outcome', shape: 'stadium' } },
];

const restaurantEdges: ProcessEdge[] = [
  { id: 'e_rest_1-2', source: 'rest_1', target: 'rest_2', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_rest_2-3', source: 'rest_2', target: 'rest_3', sourceHandle: 'left', targetHandle: 'top', type: 'animated', data: { label: 'Dine-in' } },
  { id: 'e_rest_2-4', source: 'rest_2', target: 'rest_4', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated', data: { label: 'Takeout' } },
  { id: 'e_rest_2-5', source: 'rest_2', target: 'rest_5', sourceHandle: 'right', targetHandle: 'top', type: 'animated', data: { label: 'Delivery' } },
  { id: 'e_rest_3-6', source: 'rest_3', target: 'rest_6', sourceHandle: 'bottom', targetHandle: 'left', type: 'animated' },
  { id: 'e_rest_4-6', source: 'rest_4', target: 'rest_6', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_rest_5-6', source: 'rest_5', target: 'rest_6', sourceHandle: 'bottom', targetHandle: 'right', type: 'animated' },
  { id: 'e_rest_6-7', source: 'rest_6', target: 'rest_7', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_rest_7-8', source: 'rest_7', target: 'rest_8', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_rest_8-9', source: 'rest_8', target: 'rest_9', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_rest_9-10', source: 'rest_9', target: 'rest_10', sourceHandle: 'left', targetHandle: 'top', type: 'animated', data: { label: 'No' } },
  { id: 'e_rest_10-7', source: 'rest_10', target: 'rest_7', sourceHandle: 'right', targetHandle: 'left', type: 'animated' },
  { id: 'e_rest_9-11', source: 'rest_9', target: 'rest_11', sourceHandle: 'right', targetHandle: 'top', type: 'animated', data: { label: 'Yes' } },
  { id: 'e_rest_11-12', source: 'rest_11', target: 'rest_12', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
];

// Customer Support Ticket
const supportNodes: AnyNode[] = [
  { id: 'sup_1', type: 'processNode', position: { x: 0, y: 0 }, data: { label: 'Ticket Created', description: 'Customer submits issue', nodeType: 'trigger', shape: 'stadium' } },
  { id: 'sup_2', type: 'processNode', position: { x: 0, y: RANK_SEP }, data: { label: 'Auto-Categorize', description: 'AI categorizes ticket', nodeType: 'integration', shape: 'subroutine' } },
  { id: 'sup_3', type: 'processNode', position: { x: 0, y: RANK_SEP * 2 }, data: { label: 'Priority Level?', description: 'Urgency assessment', nodeType: 'decision', shape: 'diamond' } },
  { id: 'sup_4', type: 'processNode', position: { x: -NODE_SEP, y: RANK_SEP * 3 }, data: { label: 'Route to L1', description: 'Basic support team', nodeType: 'action', shape: 'rectangle' } },
  { id: 'sup_5', type: 'processNode', position: { x: 0, y: RANK_SEP * 3 }, data: { label: 'Route to L2', description: 'Technical specialists', nodeType: 'action', shape: 'rectangle' } },
  { id: 'sup_6', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 3 }, data: { label: 'Route to L3', description: 'Engineering team', nodeType: 'action', shape: 'rectangle' } },
  { id: 'sup_7', type: 'processNode', position: { x: 0, y: RANK_SEP * 4 }, data: { label: 'Investigate Issue', description: 'Research and diagnose', nodeType: 'action', shape: 'rectangle' } },
  { id: 'sup_8', type: 'processNode', position: { x: 0, y: RANK_SEP * 5 }, data: { label: 'Solution Found?', description: 'Can we fix it?', nodeType: 'decision', shape: 'diamond' } },
  { id: 'sup_9', type: 'processNode', position: { x: -NODE_SEP, y: RANK_SEP * 6 }, data: { label: 'Escalate', description: 'Move to higher tier', nodeType: 'action', shape: 'rectangle' } },
  { id: 'sup_10', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 6 }, data: { label: 'Apply Fix', description: 'Implement solution', nodeType: 'action', shape: 'rectangle' } },
  { id: 'sup_11', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 7 }, data: { label: 'Verify Resolution', description: 'Customer confirms fix', nodeType: 'action', shape: 'rectangle' } },
  { id: 'sup_12', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 8 }, data: { label: 'Ticket Closed', description: 'Issue resolved', nodeType: 'outcome', shape: 'stadium' } },
];

const supportEdges: ProcessEdge[] = [
  { id: 'e_sup_1-2', source: 'sup_1', target: 'sup_2', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_sup_2-3', source: 'sup_2', target: 'sup_3', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_sup_3-4', source: 'sup_3', target: 'sup_4', sourceHandle: 'left', targetHandle: 'top', type: 'animated', data: { label: 'Low' } },
  { id: 'e_sup_3-5', source: 'sup_3', target: 'sup_5', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated', data: { label: 'Medium' } },
  { id: 'e_sup_3-6', source: 'sup_3', target: 'sup_6', sourceHandle: 'right', targetHandle: 'top', type: 'animated', data: { label: 'High' } },
  { id: 'e_sup_4-7', source: 'sup_4', target: 'sup_7', sourceHandle: 'bottom', targetHandle: 'left', type: 'animated' },
  { id: 'e_sup_5-7', source: 'sup_5', target: 'sup_7', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_sup_6-7', source: 'sup_6', target: 'sup_7', sourceHandle: 'bottom', targetHandle: 'right', type: 'animated' },
  { id: 'e_sup_7-8', source: 'sup_7', target: 'sup_8', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_sup_8-9', source: 'sup_8', target: 'sup_9', sourceHandle: 'left', targetHandle: 'top', type: 'animated', data: { label: 'No' } },
  { id: 'e_sup_9-7', source: 'sup_9', target: 'sup_7', sourceHandle: 'right', targetHandle: 'left', type: 'animated' },
  { id: 'e_sup_8-10', source: 'sup_8', target: 'sup_10', sourceHandle: 'right', targetHandle: 'top', type: 'animated', data: { label: 'Yes' } },
  { id: 'e_sup_10-11', source: 'sup_10', target: 'sup_11', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_sup_11-12', source: 'sup_11', target: 'sup_12', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
];

// GHL - Dental Practice Lead Nurture
const ghlDentalNodes: AnyNode[] = [
  { id: 'dental_1', type: 'processNode', position: { x: NODE_SEP, y: 0 }, data: { label: 'New Lead Captured', description: 'Form submission or call', nodeType: 'trigger', shape: 'stadium' } },
  { id: 'dental_ghl', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP }, data: { label: 'GoHighLevel', description: 'CRM & Automation Platform', nodeType: 'tool', toolId: 'gohighlevel', toolDomain: 'gohighlevel.com', shape: 'subroutine' } },
  { id: 'dental_2', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 2 }, data: { label: 'Add to Pipeline', description: 'Create opportunity in GHL', nodeType: 'integration', shape: 'subroutine' } },
  { id: 'dental_3', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 3 }, data: { label: 'Send Welcome SMS', description: 'Instant text message', nodeType: 'integration', shape: 'subroutine' } },
  { id: 'dental_4', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 4 }, data: { label: 'Wait 5 Minutes', description: 'Brief delay', nodeType: 'delay', shape: 'circle' } },
  { id: 'dental_5', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 5 }, data: { label: 'Call Attempt #1', description: 'Staff calls lead', nodeType: 'action', shape: 'rectangle' } },
  { id: 'dental_6', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 6 }, data: { label: 'Answered?', description: 'Did they pick up?', nodeType: 'decision', shape: 'diamond' } },
  { id: 'dental_7', type: 'processNode', position: { x: NODE_SEP * 2, y: RANK_SEP * 7 }, data: { label: 'Book Appointment', description: 'Schedule in calendar', nodeType: 'action', shape: 'rectangle' } },
  { id: 'dental_8', type: 'processNode', position: { x: 0, y: RANK_SEP * 7 }, data: { label: 'Send Voicemail Drop', description: 'Leave pre-recorded VM', nodeType: 'integration', shape: 'subroutine' } },
  { id: 'dental_9', type: 'processNode', position: { x: 0, y: RANK_SEP * 8 }, data: { label: 'Wait 2 Hours', description: 'Time delay', nodeType: 'delay', shape: 'circle' } },
  { id: 'dental_10', type: 'processNode', position: { x: 0, y: RANK_SEP * 9 }, data: { label: 'Send Follow-up Email', description: 'Value-based email', nodeType: 'integration', shape: 'subroutine' } },
  { id: 'dental_11', type: 'processNode', position: { x: 0, y: RANK_SEP * 10 }, data: { label: 'Call Attempt #2', description: 'Second call try', nodeType: 'action', shape: 'rectangle' } },
  { id: 'dental_12', type: 'processNode', position: { x: 0, y: RANK_SEP * 11 }, data: { label: 'Connected?', description: 'Reached lead?', nodeType: 'decision', shape: 'diamond' } },
  { id: 'dental_13', type: 'processNode', position: { x: -NODE_SEP, y: RANK_SEP * 12 }, data: { label: 'Add to Long-term Nurture', description: 'Weekly email sequence', nodeType: 'integration', shape: 'database' } },
  { id: 'dental_14', type: 'processNode', position: { x: NODE_SEP * 2, y: RANK_SEP * 8 }, data: { label: 'Send Confirmation', description: 'SMS + Email confirm', nodeType: 'integration', shape: 'subroutine' } },
  { id: 'dental_15', type: 'processNode', position: { x: NODE_SEP * 2, y: RANK_SEP * 9 }, data: { label: 'Reminder 24hr Before', description: 'Appointment reminder', nodeType: 'delay', shape: 'circle' } },
  { id: 'dental_16', type: 'processNode', position: { x: NODE_SEP * 2, y: RANK_SEP * 10 }, data: { label: 'Reminder 1hr Before', description: 'Final reminder SMS', nodeType: 'integration', shape: 'subroutine' } },
  { id: 'dental_17', type: 'processNode', position: { x: NODE_SEP * 2, y: RANK_SEP * 11 }, data: { label: 'Patient Arrives', description: 'Check-in at office', nodeType: 'outcome', shape: 'stadium' } },
];

const ghlDentalEdges: ProcessEdge[] = [
  { id: 'e_dental_1-ghl', source: 'dental_1', target: 'dental_ghl', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_dental_ghl-2', source: 'dental_ghl', target: 'dental_2', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_dental_2-3', source: 'dental_2', target: 'dental_3', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_dental_3-4', source: 'dental_3', target: 'dental_4', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_dental_4-5', source: 'dental_4', target: 'dental_5', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_dental_5-6', source: 'dental_5', target: 'dental_6', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_dental_6-7', source: 'dental_6', target: 'dental_7', sourceHandle: 'right', targetHandle: 'top', type: 'animated', data: { label: 'Yes' } },
  { id: 'e_dental_6-8', source: 'dental_6', target: 'dental_8', sourceHandle: 'left', targetHandle: 'top', type: 'animated', data: { label: 'No' } },
  { id: 'e_dental_8-9', source: 'dental_8', target: 'dental_9', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_dental_9-10', source: 'dental_9', target: 'dental_10', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_dental_10-11', source: 'dental_10', target: 'dental_11', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_dental_11-12', source: 'dental_11', target: 'dental_12', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_dental_12-13', source: 'dental_12', target: 'dental_13', sourceHandle: 'left', targetHandle: 'top', type: 'animated', data: { label: 'No Answer' } },
  { id: 'e_dental_12-7', source: 'dental_12', target: 'dental_7', sourceHandle: 'right', targetHandle: 'left', type: 'animated', data: { label: 'Connected' } },
  { id: 'e_dental_7-14', source: 'dental_7', target: 'dental_14', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_dental_14-15', source: 'dental_14', target: 'dental_15', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_dental_15-16', source: 'dental_15', target: 'dental_16', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_dental_16-17', source: 'dental_16', target: 'dental_17', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
];

// GHL - HVAC/Home Services Lead Flow
const ghlHvacNodes: AnyNode[] = [
  { id: 'hvac_1', type: 'processNode', position: { x: NODE_SEP, y: 0 }, data: { label: 'Service Request', description: 'Lead from website/ad', nodeType: 'trigger', shape: 'stadium' } },
  { id: 'hvac_ghl', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP }, data: { label: 'GoHighLevel', description: 'CRM & Automation Platform', nodeType: 'tool', toolId: 'gohighlevel', toolDomain: 'gohighlevel.com', shape: 'subroutine' } },
  { id: 'hvac_2', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 2 }, data: { label: 'Tag by Service Type', description: 'AC, Heating, Plumbing', nodeType: 'action', shape: 'rectangle' } },
  { id: 'hvac_3', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 3 }, data: { label: 'Instant SMS Response', description: 'Auto-reply with ETA', nodeType: 'integration', shape: 'subroutine' } },
  { id: 'hvac_4', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 4 }, data: { label: 'Service Type?', description: 'What do they need?', nodeType: 'decision', shape: 'diamond' } },
  { id: 'hvac_5', type: 'processNode', position: { x: 0, y: RANK_SEP * 5 }, data: { label: 'Emergency Queue', description: 'Priority dispatch', nodeType: 'action', shape: 'rectangle' } },
  { id: 'hvac_6', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 5 }, data: { label: 'Same-Day Queue', description: 'Standard scheduling', nodeType: 'action', shape: 'rectangle' } },
  { id: 'hvac_7', type: 'processNode', position: { x: NODE_SEP * 2, y: RANK_SEP * 5 }, data: { label: 'Quote Request', description: 'Estimate needed', nodeType: 'action', shape: 'rectangle' } },
  { id: 'hvac_8', type: 'processNode', position: { x: 0, y: RANK_SEP * 6 }, data: { label: 'Dispatch Tech Now', description: 'Immediate assignment', nodeType: 'integration', shape: 'subroutine' } },
  { id: 'hvac_9', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 6 }, data: { label: 'Book Time Slot', description: 'Schedule appointment', nodeType: 'action', shape: 'rectangle' } },
  { id: 'hvac_10', type: 'processNode', position: { x: NODE_SEP * 2, y: RANK_SEP * 6 }, data: { label: 'Send Quote Email', description: 'Detailed estimate', nodeType: 'integration', shape: 'subroutine' } },
  { id: 'hvac_11', type: 'processNode', position: { x: NODE_SEP * 0.5, y: RANK_SEP * 7 }, data: { label: 'Send Tech ETA', description: 'GPS-based notification', nodeType: 'integration', shape: 'subroutine' } },
  { id: 'hvac_12', type: 'processNode', position: { x: NODE_SEP * 2, y: RANK_SEP * 7 }, data: { label: 'Wait 24 Hours', description: 'Follow-up delay', nodeType: 'delay', shape: 'circle' } },
  { id: 'hvac_13', type: 'processNode', position: { x: NODE_SEP * 2, y: RANK_SEP * 8 }, data: { label: 'Quote Follow-up', description: 'Check if interested', nodeType: 'integration', shape: 'subroutine' } },
  { id: 'hvac_14', type: 'processNode', position: { x: NODE_SEP * 2, y: RANK_SEP * 9 }, data: { label: 'Responded?', description: 'Did they reply?', nodeType: 'decision', shape: 'diamond' } },
  { id: 'hvac_15', type: 'processNode', position: { x: NODE_SEP * 2.5, y: RANK_SEP * 10 }, data: { label: 'Book Service', description: 'Convert to job', nodeType: 'action', shape: 'rectangle' } },
  { id: 'hvac_16', type: 'processNode', position: { x: NODE_SEP * 1.5, y: RANK_SEP * 10 }, data: { label: 'Drip Campaign', description: 'Monthly check-ins', nodeType: 'integration', shape: 'database' } },
  { id: 'hvac_17', type: 'processNode', position: { x: NODE_SEP * 0.5, y: RANK_SEP * 8 }, data: { label: 'Job Completed', description: 'Service finished', nodeType: 'action', shape: 'rectangle' } },
  { id: 'hvac_18', type: 'processNode', position: { x: NODE_SEP * 0.5, y: RANK_SEP * 9 }, data: { label: 'Request Review', description: 'Google review ask', nodeType: 'integration', shape: 'subroutine' } },
  { id: 'hvac_19', type: 'processNode', position: { x: NODE_SEP * 0.5, y: RANK_SEP * 10 }, data: { label: 'Add to Maintenance List', description: 'Annual service reminder', nodeType: 'outcome', shape: 'stadium' } },
];

const ghlHvacEdges: ProcessEdge[] = [
  { id: 'e_hvac_1-ghl', source: 'hvac_1', target: 'hvac_ghl', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_hvac_ghl-2', source: 'hvac_ghl', target: 'hvac_2', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_hvac_2-3', source: 'hvac_2', target: 'hvac_3', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_hvac_3-4', source: 'hvac_3', target: 'hvac_4', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_hvac_4-5', source: 'hvac_4', target: 'hvac_5', sourceHandle: 'left', targetHandle: 'top', type: 'animated', data: { label: 'Emergency' } },
  { id: 'e_hvac_4-6', source: 'hvac_4', target: 'hvac_6', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated', data: { label: 'Repair' } },
  { id: 'e_hvac_4-7', source: 'hvac_4', target: 'hvac_7', sourceHandle: 'right', targetHandle: 'top', type: 'animated', data: { label: 'Quote' } },
  { id: 'e_hvac_5-8', source: 'hvac_5', target: 'hvac_8', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_hvac_6-9', source: 'hvac_6', target: 'hvac_9', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_hvac_7-10', source: 'hvac_7', target: 'hvac_10', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_hvac_8-11', source: 'hvac_8', target: 'hvac_11', sourceHandle: 'bottom', targetHandle: 'left', type: 'animated' },
  { id: 'e_hvac_9-11', source: 'hvac_9', target: 'hvac_11', sourceHandle: 'bottom', targetHandle: 'right', type: 'animated' },
  { id: 'e_hvac_10-12', source: 'hvac_10', target: 'hvac_12', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_hvac_12-13', source: 'hvac_12', target: 'hvac_13', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_hvac_13-14', source: 'hvac_13', target: 'hvac_14', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_hvac_14-15', source: 'hvac_14', target: 'hvac_15', sourceHandle: 'right', targetHandle: 'top', type: 'animated', data: { label: 'Yes' } },
  { id: 'e_hvac_14-16', source: 'hvac_14', target: 'hvac_16', sourceHandle: 'left', targetHandle: 'top', type: 'animated', data: { label: 'No' } },
  { id: 'e_hvac_11-17', source: 'hvac_11', target: 'hvac_17', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_hvac_15-17', source: 'hvac_15', target: 'hvac_17', sourceHandle: 'left', targetHandle: 'right', type: 'animated' },
  { id: 'e_hvac_17-18', source: 'hvac_17', target: 'hvac_18', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_hvac_18-19', source: 'hvac_18', target: 'hvac_19', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
];

// GHL - Real Estate Agent Lead Nurture (Simplified)
const ghlRealEstateNodes: AnyNode[] = [
  { id: 're_1', type: 'processNode', position: { x: NODE_SEP, y: 0 }, data: { label: 'Lead Inquiry', description: 'Zillow/Realtor.com lead', nodeType: 'trigger', shape: 'stadium' } },
  { id: 're_ghl', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP }, data: { label: 'GoHighLevel', description: 'CRM & Automation Platform', nodeType: 'tool', toolId: 'gohighlevel', toolDomain: 'gohighlevel.com', shape: 'subroutine' } },
  { id: 're_2', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 2 }, data: { label: 'Speed to Lead SMS', description: 'Reply within 60 sec', nodeType: 'integration', shape: 'subroutine' } },
  { id: 're_3', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 3 }, data: { label: 'AI Conversation', description: 'Qualify via chatbot', nodeType: 'integration', shape: 'subroutine' } },
  { id: 're_4', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 4 }, data: { label: 'Lead Type?', description: 'Buyer or Seller?', nodeType: 'decision', shape: 'diamond' } },
  { id: 're_5', type: 'processNode', position: { x: 0, y: RANK_SEP * 5 }, data: { label: 'Buyer Qualification', description: 'Pre-approval status', nodeType: 'action', shape: 'rectangle' } },
  { id: 're_6', type: 'processNode', position: { x: NODE_SEP * 2, y: RANK_SEP * 5 }, data: { label: 'Seller Qualification', description: 'Timeline & motivation', nodeType: 'action', shape: 'rectangle' } },
  { id: 're_7', type: 'processNode', position: { x: 0, y: RANK_SEP * 6 }, data: { label: 'Pre-Approved?', description: 'Financing ready?', nodeType: 'decision', shape: 'diamond' } },
  { id: 're_8', type: 'processNode', position: { x: -NODE_SEP, y: RANK_SEP * 7 }, data: { label: 'Send to Lender', description: 'Partner lender intro', nodeType: 'integration', shape: 'subroutine' } },
  { id: 're_9', type: 'processNode', position: { x: NODE_SEP * 0.5, y: RANK_SEP * 7 }, data: { label: 'Send Listings', description: 'MLS property matches', nodeType: 'integration', shape: 'subroutine' } },
  { id: 're_10', type: 'processNode', position: { x: NODE_SEP * 2, y: RANK_SEP * 6 }, data: { label: 'Schedule CMA', description: 'Book home valuation', nodeType: 'action', shape: 'rectangle' } },
  { id: 're_11', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 8 }, data: { label: 'Hot Lead?', description: 'Ready to act now?', nodeType: 'decision', shape: 'diamond' } },
  { id: 're_12', type: 'processNode', position: { x: 0, y: RANK_SEP * 9 }, data: { label: 'Nurture Sequence', description: 'Weekly market updates', nodeType: 'integration', shape: 'database' } },
  { id: 're_13', type: 'processNode', position: { x: NODE_SEP * 2, y: RANK_SEP * 9 }, data: { label: 'Book Showing/Appt', description: 'Calendar booking', nodeType: 'action', shape: 'rectangle' } },
  { id: 're_14', type: 'processNode', position: { x: NODE_SEP * 2, y: RANK_SEP * 10 }, data: { label: 'Appointment Reminder', description: '24hr + 1hr reminders', nodeType: 'delay', shape: 'circle' } },
  { id: 're_15', type: 'processNode', position: { x: NODE_SEP * 2, y: RANK_SEP * 11 }, data: { label: 'Post-Showing Follow-up', description: 'Feedback request', nodeType: 'integration', shape: 'subroutine' } },
  { id: 're_16', type: 'processNode', position: { x: NODE_SEP * 2, y: RANK_SEP * 12 }, data: { label: 'Deal in Progress', description: 'Under contract', nodeType: 'outcome', shape: 'stadium' } },
];

const ghlRealEstateEdges: ProcessEdge[] = [
  { id: 'e_re_1-ghl', source: 're_1', target: 're_ghl', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_re_ghl-2', source: 're_ghl', target: 're_2', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_re_2-3', source: 're_2', target: 're_3', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_re_3-4', source: 're_3', target: 're_4', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_re_4-5', source: 're_4', target: 're_5', sourceHandle: 'left', targetHandle: 'top', type: 'animated', data: { label: 'Buyer' } },
  { id: 'e_re_4-6', source: 're_4', target: 're_6', sourceHandle: 'right', targetHandle: 'top', type: 'animated', data: { label: 'Seller' } },
  { id: 'e_re_5-7', source: 're_5', target: 're_7', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_re_7-8', source: 're_7', target: 're_8', sourceHandle: 'left', targetHandle: 'top', type: 'animated', data: { label: 'No' } },
  { id: 'e_re_7-9', source: 're_7', target: 're_9', sourceHandle: 'right', targetHandle: 'top', type: 'animated', data: { label: 'Yes' } },
  { id: 'e_re_8-9', source: 're_8', target: 're_9', sourceHandle: 'right', targetHandle: 'left', type: 'animated' },
  { id: 'e_re_6-10', source: 're_6', target: 're_10', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_re_9-11', source: 're_9', target: 're_11', sourceHandle: 'bottom', targetHandle: 'left', type: 'animated' },
  { id: 'e_re_10-11', source: 're_10', target: 're_11', sourceHandle: 'bottom', targetHandle: 'right', type: 'animated' },
  { id: 'e_re_11-12', source: 're_11', target: 're_12', sourceHandle: 'left', targetHandle: 'top', type: 'animated', data: { label: 'Not Yet' } },
  { id: 'e_re_11-13', source: 're_11', target: 're_13', sourceHandle: 'right', targetHandle: 'top', type: 'animated', data: { label: 'Yes' } },
  { id: 'e_re_13-14', source: 're_13', target: 're_14', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_re_14-15', source: 're_14', target: 're_15', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_re_15-16', source: 're_15', target: 're_16', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
];

// GHL - Gym/Fitness Studio Lead Flow (Simplified)
const ghlGymNodes: AnyNode[] = [
  { id: 'gym_1', type: 'processNode', position: { x: NODE_SEP, y: 0 }, data: { label: 'Free Trial Signup', description: 'Landing page form', nodeType: 'trigger', shape: 'stadium' } },
  { id: 'gym_ghl', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP }, data: { label: 'GoHighLevel', description: 'CRM & Automation Platform', nodeType: 'tool', toolId: 'gohighlevel', toolDomain: 'gohighlevel.com', shape: 'subroutine' } },
  { id: 'gym_2', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 2 }, data: { label: 'Welcome Text', description: 'Instant confirmation', nodeType: 'integration', shape: 'subroutine' } },
  { id: 'gym_3', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 3 }, data: { label: 'Send Waiver Link', description: 'Digital waiver form', nodeType: 'integration', shape: 'subroutine' } },
  { id: 'gym_4', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 4 }, data: { label: 'Waiver Signed?', description: 'Check completion', nodeType: 'decision', shape: 'diamond' } },
  { id: 'gym_5', type: 'processNode', position: { x: 0, y: RANK_SEP * 5 }, data: { label: 'Reminder SMS', description: 'Sign waiver reminder', nodeType: 'delay', shape: 'circle' } },
  { id: 'gym_6', type: 'processNode', position: { x: NODE_SEP * 2, y: RANK_SEP * 5 }, data: { label: 'Book Trial Class', description: 'Schedule first visit', nodeType: 'action', shape: 'rectangle' } },
  { id: 'gym_7', type: 'processNode', position: { x: NODE_SEP * 2, y: RANK_SEP * 6 }, data: { label: 'Class Reminder', description: '24hr before class', nodeType: 'delay', shape: 'circle' } },
  { id: 'gym_8', type: 'processNode', position: { x: NODE_SEP * 2, y: RANK_SEP * 7 }, data: { label: 'Attended?', description: 'Did they show up?', nodeType: 'decision', shape: 'diamond' } },
  { id: 'gym_9', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 8 }, data: { label: 'No-Show Sequence', description: 'Reschedule offer', nodeType: 'integration', shape: 'subroutine' } },
  { id: 'gym_10', type: 'processNode', position: { x: NODE_SEP * 2.5, y: RANK_SEP * 8 }, data: { label: 'Post-Class Survey', description: 'Experience feedback', nodeType: 'integration', shape: 'subroutine' } },
  { id: 'gym_11', type: 'processNode', position: { x: NODE_SEP * 2.5, y: RANK_SEP * 9 }, data: { label: 'Send Membership Offer', description: 'Special trial pricing', nodeType: 'integration', shape: 'subroutine' } },
  { id: 'gym_12', type: 'processNode', position: { x: NODE_SEP * 2.5, y: RANK_SEP * 10 }, data: { label: 'Responded?', description: 'Interested in joining?', nodeType: 'decision', shape: 'diamond' } },
  { id: 'gym_13', type: 'processNode', position: { x: NODE_SEP * 1.5, y: RANK_SEP * 11 }, data: { label: 'Sales Call', description: 'Phone consultation', nodeType: 'action', shape: 'rectangle' } },
  { id: 'gym_14', type: 'processNode', position: { x: NODE_SEP * 3, y: RANK_SEP * 11 }, data: { label: 'Objection Handling', description: 'Address concerns', nodeType: 'integration', shape: 'subroutine' } },
  { id: 'gym_15', type: 'processNode', position: { x: NODE_SEP * 2.5, y: RANK_SEP * 12 }, data: { label: 'Signed Up?', description: 'Converted to member?', nodeType: 'decision', shape: 'diamond' } },
  { id: 'gym_16', type: 'processNode', position: { x: NODE_SEP * 1.5, y: RANK_SEP * 13 }, data: { label: 'Long-term Nurture', description: 'Monthly promos', nodeType: 'integration', shape: 'database' } },
  { id: 'gym_17', type: 'processNode', position: { x: NODE_SEP * 3, y: RANK_SEP * 13 }, data: { label: 'New Member Onboard', description: 'Welcome sequence', nodeType: 'outcome', shape: 'stadium' } },
];

const ghlGymEdges: ProcessEdge[] = [
  { id: 'e_gym_1-ghl', source: 'gym_1', target: 'gym_ghl', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_gym_ghl-2', source: 'gym_ghl', target: 'gym_2', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_gym_2-3', source: 'gym_2', target: 'gym_3', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_gym_3-4', source: 'gym_3', target: 'gym_4', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_gym_4-5', source: 'gym_4', target: 'gym_5', sourceHandle: 'left', targetHandle: 'top', type: 'animated', data: { label: 'No' } },
  { id: 'e_gym_5-4', source: 'gym_5', target: 'gym_4', sourceHandle: 'right', targetHandle: 'left', type: 'animated' },
  { id: 'e_gym_4-6', source: 'gym_4', target: 'gym_6', sourceHandle: 'right', targetHandle: 'top', type: 'animated', data: { label: 'Yes' } },
  { id: 'e_gym_6-7', source: 'gym_6', target: 'gym_7', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_gym_7-8', source: 'gym_7', target: 'gym_8', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_gym_8-9', source: 'gym_8', target: 'gym_9', sourceHandle: 'left', targetHandle: 'top', type: 'animated', data: { label: 'No' } },
  { id: 'e_gym_8-10', source: 'gym_8', target: 'gym_10', sourceHandle: 'right', targetHandle: 'top', type: 'animated', data: { label: 'Yes' } },
  { id: 'e_gym_9-6', source: 'gym_9', target: 'gym_6', sourceHandle: 'right', targetHandle: 'left', type: 'animated' },
  { id: 'e_gym_10-11', source: 'gym_10', target: 'gym_11', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_gym_11-12', source: 'gym_11', target: 'gym_12', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_gym_12-13', source: 'gym_12', target: 'gym_13', sourceHandle: 'left', targetHandle: 'top', type: 'animated', data: { label: 'Interested' } },
  { id: 'e_gym_12-14', source: 'gym_12', target: 'gym_14', sourceHandle: 'right', targetHandle: 'top', type: 'animated', data: { label: 'Hesitant' } },
  { id: 'e_gym_13-15', source: 'gym_13', target: 'gym_15', sourceHandle: 'bottom', targetHandle: 'left', type: 'animated' },
  { id: 'e_gym_14-15', source: 'gym_14', target: 'gym_15', sourceHandle: 'bottom', targetHandle: 'right', type: 'animated' },
  { id: 'e_gym_15-16', source: 'gym_15', target: 'gym_16', sourceHandle: 'left', targetHandle: 'top', type: 'animated', data: { label: 'No' } },
  { id: 'e_gym_15-17', source: 'gym_15', target: 'gym_17', sourceHandle: 'right', targetHandle: 'top', type: 'animated', data: { label: 'Yes' } },
];

// GHL - Law Firm / Legal Services Lead Flow (Simplified)
const ghlLegalNodes: AnyNode[] = [
  { id: 'legal_1', type: 'processNode', position: { x: NODE_SEP, y: 0 }, data: { label: 'Case Inquiry', description: 'Website form or call', nodeType: 'trigger', shape: 'stadium' } },
  { id: 'legal_ghl', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP }, data: { label: 'GoHighLevel', description: 'CRM & Automation Platform', nodeType: 'tool', toolId: 'gohighlevel', toolDomain: 'gohighlevel.com', shape: 'subroutine' } },
  { id: 'legal_2', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 2 }, data: { label: 'Instant Response', description: 'Auto-text acknowledgment', nodeType: 'integration', shape: 'subroutine' } },
  { id: 'legal_3', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 3 }, data: { label: 'Case Type?', description: 'Practice area routing', nodeType: 'decision', shape: 'diamond' } },
  { id: 'legal_4', type: 'processNode', position: { x: -NODE_SEP * 0.5, y: RANK_SEP * 4 }, data: { label: 'Personal Injury', description: 'PI intake team', nodeType: 'action', shape: 'rectangle' } },
  { id: 'legal_5', type: 'processNode', position: { x: NODE_SEP * 0.5, y: RANK_SEP * 4 }, data: { label: 'Family Law', description: 'Family intake team', nodeType: 'action', shape: 'rectangle' } },
  { id: 'legal_6', type: 'processNode', position: { x: NODE_SEP * 1.5, y: RANK_SEP * 4 }, data: { label: 'Criminal Defense', description: 'Criminal intake team', nodeType: 'action', shape: 'rectangle' } },
  { id: 'legal_7', type: 'processNode', position: { x: NODE_SEP * 2.5, y: RANK_SEP * 4 }, data: { label: 'Business/Other', description: 'General intake', nodeType: 'action', shape: 'rectangle' } },
  { id: 'legal_8', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 5 }, data: { label: 'Intake Specialist Call', description: 'Detailed screening', nodeType: 'action', shape: 'rectangle' } },
  { id: 'legal_9', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 6 }, data: { label: 'Qualified Case?', description: 'Do we take it?', nodeType: 'decision', shape: 'diamond' } },
  { id: 'legal_10', type: 'processNode', position: { x: 0, y: RANK_SEP * 7 }, data: { label: 'Refer Out', description: 'Send to partner firm', nodeType: 'integration', shape: 'subroutine' } },
  { id: 'legal_11', type: 'processNode', position: { x: NODE_SEP * 2, y: RANK_SEP * 7 }, data: { label: 'Schedule Consultation', description: 'Book attorney meeting', nodeType: 'action', shape: 'rectangle' } },
  { id: 'legal_12', type: 'processNode', position: { x: NODE_SEP * 2, y: RANK_SEP * 8 }, data: { label: 'Send Intake Forms', description: 'Digital documents', nodeType: 'integration', shape: 'subroutine' } },
  { id: 'legal_13', type: 'processNode', position: { x: NODE_SEP * 2, y: RANK_SEP * 9 }, data: { label: 'Consultation Reminder', description: 'SMS + Email', nodeType: 'delay', shape: 'circle' } },
  { id: 'legal_14', type: 'processNode', position: { x: NODE_SEP * 2, y: RANK_SEP * 10 }, data: { label: 'Attorney Consult', description: 'Case evaluation', nodeType: 'action', shape: 'rectangle' } },
  { id: 'legal_15', type: 'processNode', position: { x: NODE_SEP * 2, y: RANK_SEP * 11 }, data: { label: 'Retained?', description: 'Client signed?', nodeType: 'decision', shape: 'diamond' } },
  { id: 'legal_16', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 12 }, data: { label: 'Follow-up Sequence', description: 'Nurture to decision', nodeType: 'integration', shape: 'database' } },
  { id: 'legal_17', type: 'processNode', position: { x: NODE_SEP * 3, y: RANK_SEP * 12 }, data: { label: 'Client Onboarding', description: 'Welcome + retainer', nodeType: 'outcome', shape: 'stadium' } },
];

const ghlLegalEdges: ProcessEdge[] = [
  { id: 'e_legal_1-ghl', source: 'legal_1', target: 'legal_ghl', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_legal_ghl-2', source: 'legal_ghl', target: 'legal_2', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_legal_2-3', source: 'legal_2', target: 'legal_3', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_legal_3-4', source: 'legal_3', target: 'legal_4', sourceHandle: 'left', targetHandle: 'top', type: 'animated', data: { label: 'PI' } },
  { id: 'e_legal_3-5', source: 'legal_3', target: 'legal_5', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated', data: { label: 'Family' } },
  { id: 'e_legal_3-6', source: 'legal_3', target: 'legal_6', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated', data: { label: 'Criminal' } },
  { id: 'e_legal_3-7', source: 'legal_3', target: 'legal_7', sourceHandle: 'right', targetHandle: 'top', type: 'animated', data: { label: 'Other' } },
  { id: 'e_legal_4-8', source: 'legal_4', target: 'legal_8', sourceHandle: 'bottom', targetHandle: 'left', type: 'animated' },
  { id: 'e_legal_5-8', source: 'legal_5', target: 'legal_8', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_legal_6-8', source: 'legal_6', target: 'legal_8', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_legal_7-8', source: 'legal_7', target: 'legal_8', sourceHandle: 'bottom', targetHandle: 'right', type: 'animated' },
  { id: 'e_legal_8-9', source: 'legal_8', target: 'legal_9', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_legal_9-10', source: 'legal_9', target: 'legal_10', sourceHandle: 'left', targetHandle: 'top', type: 'animated', data: { label: 'No' } },
  { id: 'e_legal_9-11', source: 'legal_9', target: 'legal_11', sourceHandle: 'right', targetHandle: 'top', type: 'animated', data: { label: 'Yes' } },
  { id: 'e_legal_11-12', source: 'legal_11', target: 'legal_12', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_legal_12-13', source: 'legal_12', target: 'legal_13', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_legal_13-14', source: 'legal_13', target: 'legal_14', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_legal_14-15', source: 'legal_14', target: 'legal_15', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_legal_15-16', source: 'legal_15', target: 'legal_16', sourceHandle: 'left', targetHandle: 'top', type: 'animated', data: { label: 'Not Yet' } },
  { id: 'e_legal_15-17', source: 'legal_15', target: 'legal_17', sourceHandle: 'right', targetHandle: 'top', type: 'animated', data: { label: 'Yes' } },
];

// GHL - Med Spa / Aesthetics Lead Flow (Simplified)
const ghlMedSpaNodes: AnyNode[] = [
  { id: 'spa_1', type: 'processNode', position: { x: NODE_SEP, y: 0 }, data: { label: 'Lead Captured', description: 'Social ad or website', nodeType: 'trigger', shape: 'stadium' } },
  { id: 'spa_ghl', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP }, data: { label: 'GoHighLevel', description: 'CRM & Automation Platform', nodeType: 'tool', toolId: 'gohighlevel', toolDomain: 'gohighlevel.com', shape: 'subroutine' } },
  { id: 'spa_2', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 2 }, data: { label: 'Add to CRM', description: 'Create contact', nodeType: 'integration', shape: 'subroutine' } },
  { id: 'spa_3', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 3 }, data: { label: 'Send Offer SMS', description: 'Special intro pricing', nodeType: 'integration', shape: 'subroutine' } },
  { id: 'spa_4', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 4 }, data: { label: 'Interest Area?', description: 'What treatment?', nodeType: 'decision', shape: 'diamond' } },
  { id: 'spa_5', type: 'processNode', position: { x: 0, y: RANK_SEP * 5 }, data: { label: 'Injectables Track', description: 'Botox/Filler info', nodeType: 'action', shape: 'rectangle' } },
  { id: 'spa_6', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 5 }, data: { label: 'Body Contouring', description: 'CoolSculpting info', nodeType: 'action', shape: 'rectangle' } },
  { id: 'spa_7', type: 'processNode', position: { x: NODE_SEP * 2, y: RANK_SEP * 5 }, data: { label: 'Skin Treatments', description: 'Facials/Laser info', nodeType: 'action', shape: 'rectangle' } },
  { id: 'spa_8', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 6 }, data: { label: 'Send Treatment Guide', description: 'Educational content', nodeType: 'integration', shape: 'subroutine' } },
  { id: 'spa_9', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 7 }, data: { label: 'Wait 1 Hour', description: 'Let them read', nodeType: 'delay', shape: 'circle' } },
  { id: 'spa_10', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 8 }, data: { label: 'Book Consult CTA', description: 'Booking link SMS', nodeType: 'integration', shape: 'subroutine' } },
  { id: 'spa_11', type: 'processNode', position: { x: NODE_SEP, y: RANK_SEP * 9 }, data: { label: 'Booked?', description: 'Did they schedule?', nodeType: 'decision', shape: 'diamond' } },
  { id: 'spa_12', type: 'processNode', position: { x: 0, y: RANK_SEP * 10 }, data: { label: 'Phone Follow-up', description: 'Personal call', nodeType: 'action', shape: 'rectangle' } },
  { id: 'spa_13', type: 'processNode', position: { x: NODE_SEP * 2, y: RANK_SEP * 10 }, data: { label: 'Send Confirmation', description: 'Appointment details', nodeType: 'integration', shape: 'subroutine' } },
  { id: 'spa_14', type: 'processNode', position: { x: 0, y: RANK_SEP * 11 }, data: { label: 'Reached?', description: 'Talked to lead?', nodeType: 'decision', shape: 'diamond' } },
  { id: 'spa_15', type: 'processNode', position: { x: -NODE_SEP, y: RANK_SEP * 12 }, data: { label: 'Drip Sequence', description: 'Weekly beauty tips', nodeType: 'integration', shape: 'database' } },
  { id: 'spa_16', type: 'processNode', position: { x: NODE_SEP * 2, y: RANK_SEP * 11 }, data: { label: 'Pre-Consult Prep', description: 'What to expect', nodeType: 'integration', shape: 'subroutine' } },
  { id: 'spa_17', type: 'processNode', position: { x: NODE_SEP * 2, y: RANK_SEP * 12 }, data: { label: 'Consultation', description: 'In-person meeting', nodeType: 'action', shape: 'rectangle' } },
  { id: 'spa_18', type: 'processNode', position: { x: NODE_SEP * 2, y: RANK_SEP * 13 }, data: { label: 'Treatment Booked', description: 'Procedure scheduled', nodeType: 'outcome', shape: 'stadium' } },
];

const ghlMedSpaEdges: ProcessEdge[] = [
  { id: 'e_spa_1-ghl', source: 'spa_1', target: 'spa_ghl', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_spa_ghl-2', source: 'spa_ghl', target: 'spa_2', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_spa_2-3', source: 'spa_2', target: 'spa_3', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_spa_3-4', source: 'spa_3', target: 'spa_4', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_spa_4-5', source: 'spa_4', target: 'spa_5', sourceHandle: 'left', targetHandle: 'top', type: 'animated', data: { label: 'Injectables' } },
  { id: 'e_spa_4-6', source: 'spa_4', target: 'spa_6', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated', data: { label: 'Body' } },
  { id: 'e_spa_4-7', source: 'spa_4', target: 'spa_7', sourceHandle: 'right', targetHandle: 'top', type: 'animated', data: { label: 'Skin' } },
  { id: 'e_spa_5-8', source: 'spa_5', target: 'spa_8', sourceHandle: 'bottom', targetHandle: 'left', type: 'animated' },
  { id: 'e_spa_6-8', source: 'spa_6', target: 'spa_8', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_spa_7-8', source: 'spa_7', target: 'spa_8', sourceHandle: 'bottom', targetHandle: 'right', type: 'animated' },
  { id: 'e_spa_8-9', source: 'spa_8', target: 'spa_9', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_spa_9-10', source: 'spa_9', target: 'spa_10', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_spa_10-11', source: 'spa_10', target: 'spa_11', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_spa_11-12', source: 'spa_11', target: 'spa_12', sourceHandle: 'left', targetHandle: 'top', type: 'animated', data: { label: 'No' } },
  { id: 'e_spa_11-13', source: 'spa_11', target: 'spa_13', sourceHandle: 'right', targetHandle: 'top', type: 'animated', data: { label: 'Yes' } },
  { id: 'e_spa_12-14', source: 'spa_12', target: 'spa_14', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_spa_14-15', source: 'spa_14', target: 'spa_15', sourceHandle: 'left', targetHandle: 'top', type: 'animated', data: { label: 'No' } },
  { id: 'e_spa_14-13', source: 'spa_14', target: 'spa_13', sourceHandle: 'right', targetHandle: 'left', type: 'animated', data: { label: 'Booked' } },
  { id: 'e_spa_13-16', source: 'spa_13', target: 'spa_16', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_spa_16-17', source: 'spa_16', target: 'spa_17', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_spa_17-18', source: 'spa_17', target: 'spa_18', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
];

export const sampleFlows: SampleFlow[] = [
  // GHL Automation Flows (Featured)
  {
    id: 'ghl-dental',
    name: 'Dental Lead Nurture',
    industry: 'GHL - Dental',
    description: 'Speed-to-lead with appointment booking',
    nodes: ghlDentalNodes,
    edges: ghlDentalEdges,
  },
  {
    id: 'ghl-hvac',
    name: 'Home Services Lead',
    industry: 'GHL - HVAC',
    description: 'Emergency, repair & quote routing',
    nodes: ghlHvacNodes,
    edges: ghlHvacEdges,
  },
  {
    id: 'ghl-realestate',
    name: 'Real Estate Nurture',
    industry: 'GHL - Realty',
    description: 'Buyer & seller qualification flow',
    nodes: ghlRealEstateNodes,
    edges: ghlRealEstateEdges,
  },
  {
    id: 'ghl-gym',
    name: 'Gym Trial Conversion',
    industry: 'GHL - Fitness',
    description: 'Free trial to membership flow',
    nodes: ghlGymNodes,
    edges: ghlGymEdges,
  },
  {
    id: 'ghl-legal',
    name: 'Law Firm Intake',
    industry: 'GHL - Legal',
    description: 'Case routing and consultation booking',
    nodes: ghlLegalNodes,
    edges: ghlLegalEdges,
  },
  {
    id: 'ghl-medspa',
    name: 'Med Spa Leads',
    industry: 'GHL - Med Spa',
    description: 'Treatment interest to consultation',
    nodes: ghlMedSpaNodes,
    edges: ghlMedSpaEdges,
  },
  // General Industry Flows
  {
    id: 'ecommerce',
    name: 'Order Fulfillment',
    industry: 'E-commerce',
    description: 'Complete order processing from payment to delivery',
    nodes: ecommerceNodes,
    edges: ecommerceEdges,
  },
  {
    id: 'healthcare',
    name: 'Patient Intake',
    industry: 'Healthcare',
    description: 'Patient check-in and treatment workflow',
    nodes: healthcareNodes,
    edges: healthcareEdges,
  },
  {
    id: 'saas',
    name: 'User Onboarding',
    industry: 'SaaS',
    description: 'New user signup and activation flow',
    nodes: saasNodes,
    edges: saasEdges,
  },
  {
    id: 'recruitment',
    name: 'Hiring Process',
    industry: 'HR',
    description: 'End-to-end recruitment workflow',
    nodes: recruitmentNodes,
    edges: recruitmentEdges,
  },
  {
    id: 'restaurant',
    name: 'Order Processing',
    industry: 'Restaurant',
    description: 'Kitchen order flow for all order types',
    nodes: restaurantNodes,
    edges: restaurantEdges,
  },
  {
    id: 'support',
    name: 'Support Ticket',
    industry: 'Customer Service',
    description: 'Multi-tier support escalation process',
    nodes: supportNodes,
    edges: supportEdges,
  },
];
