import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a process flow architect. Your job is to convert natural language descriptions of business processes into structured flowchart data.

Analyze the user's description and create a logical flow with appropriate node types:
- trigger: Starting points (form submission, phone call, ad click, etc.)
- action: Things that happen (send email, make call, assign to rep, etc.)
- decision: Yes/No or conditional branches (did they respond? qualified? interested?)
- delay: Time-based waits (wait 24 hours, after 3 days, etc.)
- outcome: End states (converted, lost, cold, completed, etc.)
- integration: External system actions (add to CRM, Slack notification, etc.)

Return ONLY valid JSON with this exact structure:
{
  "nodes": [
    {
      "id": "node_1",
      "type": "trigger|action|decision|delay|outcome|integration",
      "label": "Short label (max 5 words)",
      "description": "Optional longer description"
    }
  ],
  "edges": [
    {
      "source": "node_1",
      "target": "node_2",
      "label": "Optional edge label (e.g., 'Yes', 'No', 'If opened')"
    }
  ]
}

Guidelines:
1. Start with a trigger node
2. End branches with outcome nodes
3. For decisions, create appropriate Yes/No branches
4. Keep labels concise but clear
5. Use delays when time intervals are mentioned
6. Create logical connections between all nodes
7. Ensure node IDs are unique and match in edges
8. Don't include any markdown formatting or code blocks - just pure JSON`;

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      // Return mock data for development without API key
      return NextResponse.json(getMockFlow());
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `${SYSTEM_PROMPT}\n\nUser process description: ${prompt}`,
        },
      ],
    });

    const content = message.content[0];

    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Parse the JSON from Claude's response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const flowData = JSON.parse(jsonMatch[0]);

    return NextResponse.json(flowData);
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate flow' },
      { status: 500 }
    );
  }
}

// Mock data for development without API key
function getMockFlow() {
  return {
    nodes: [
      {
        id: 'node_1',
        type: 'trigger',
        label: 'Lead Submits Form',
        description: 'Customer fills out contact form on website',
      },
      {
        id: 'node_2',
        type: 'action',
        label: 'Send Welcome Email',
        description: 'Automated welcome email sent immediately',
      },
      {
        id: 'node_3',
        type: 'delay',
        label: 'Wait 24 Hours',
        description: 'Allow time for email engagement',
      },
      {
        id: 'node_4',
        type: 'decision',
        label: 'Email Opened?',
        description: 'Check if lead engaged with welcome email',
      },
      {
        id: 'node_5',
        type: 'action',
        label: 'Call Lead',
        description: 'Sales rep makes follow-up call',
      },
      {
        id: 'node_6',
        type: 'delay',
        label: 'Wait 3 Days',
        description: 'Give additional time to respond',
      },
      {
        id: 'node_7',
        type: 'action',
        label: 'Send Follow-up',
        description: 'Send second email with offer',
      },
      {
        id: 'node_8',
        type: 'decision',
        label: 'Interested?',
        description: 'Determine lead interest level',
      },
      {
        id: 'node_9',
        type: 'outcome',
        label: 'Schedule Appointment',
        description: 'Book meeting with sales team',
      },
      {
        id: 'node_10',
        type: 'outcome',
        label: 'Mark as Cold',
        description: 'Add to nurture campaign',
      },
    ],
    edges: [
      { source: 'node_1', target: 'node_2' },
      { source: 'node_2', target: 'node_3' },
      { source: 'node_3', target: 'node_4' },
      { source: 'node_4', target: 'node_5', label: 'Yes' },
      { source: 'node_4', target: 'node_6', label: 'No' },
      { source: 'node_5', target: 'node_8' },
      { source: 'node_6', target: 'node_7' },
      { source: 'node_7', target: 'node_8' },
      { source: 'node_8', target: 'node_9', label: 'Yes' },
      { source: 'node_8', target: 'node_10', label: 'No' },
    ],
  };
}
