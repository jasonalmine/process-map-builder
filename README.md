# FlowCraft

A free, open-source visual flowchart editor powered by Mermaid syntax. Create beautiful process maps, export them in multiple formats, and share them with anyone.

![FlowCraft Screenshot](./docs/screenshot.png)

## Features

### Core Features
- **Visual Editor** - Drag-and-drop nodes to build flowcharts with snap-to-grid alignment
- **Mermaid Syntax** - Write or import Mermaid code directly
- **AI Assist** - Generate flowcharts using ChatGPT, Claude, or Gemini (free, no API key needed)
- **Multiple Export Formats** - PNG, SVG, PDF, Mermaid code, Markdown
- **Share Links** - Share flowcharts via short URLs with optional password protection
- **Templates** - 12+ pre-built workflow templates for common use cases
- **Dark/Light Mode** - Multiple color themes (Ocean, Forest, Sunset, Wood, Lavender)
- **Offline Support** - Works without internet (PWA)
- **100% Free** - No paywalls, no premium tiers

### Cloud Features (Optional)
- **User Authentication** - Sign up with email/password, magic link, or Google OAuth
- **Cloud Sync** - Save diagrams to the cloud and access from anywhere
- **User Data Isolation** - Your diagrams are private and secure

## Tech Stack

- **Framework**: Next.js 16 (React 19)
- **Flow Visualization**: React Flow (@xyflow/react)
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Code Editor**: CodeMirror
- **Storage**: IndexedDB (local), Supabase (cloud - optional)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/flowcraft.git
cd flowcraft

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Configuration

### Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL (for cloud features) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anonymous key |

**Note**: The app works fully offline without Supabase. Cloud features are optional.

### Supabase Setup (Optional)

If you want cloud features, set up Supabase with:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Enable Row Level Security (RLS) on `user_diagrams` and `shared_diagrams` tables
3. Configure authentication providers (Email, Google OAuth)
4. Add your Supabase URL and anon key to `.env.local`

See [docs/supabase-setup.md](./docs/supabase-setup.md) for detailed instructions.

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── page.tsx           # Main page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── FlowCanvas.tsx     # Main canvas with React Flow
│   ├── MermaidEditor.tsx  # Code editor panel
│   ├── AIAssistPanel.tsx  # AI generation helper
│   ├── TemplatesPanel.tsx # Workflow templates
│   ├── CheatSheet.tsx     # Mermaid syntax reference
│   └── nodes/             # Custom node components
├── store/                 # Zustand stores
│   ├── flowStore.ts       # Flow state management
│   ├── themeStore.ts      # Theme preferences
│   └── diagramStore.ts    # Saved diagrams (IndexedDB)
├── lib/                   # Utilities
│   ├── parseMermaid.ts    # Mermaid parser
│   ├── exportFlow.ts      # Export functions
│   └── layoutFlow.ts      # Auto-layout with dagre
└── types/                 # TypeScript types
```

## Usage

### Creating a Flowchart

1. **AI Assist**: Describe your process in plain English, click an AI button, paste the generated Mermaid code
2. **Templates**: Click "Templates" tab and select a pre-built workflow
3. **Manual**: Drag nodes from the palette or write Mermaid code directly

### Sharing

1. Click the **Share** button in the top-right
2. The link is copied to your clipboard
3. Recipients see a view-only version

### Exporting

Click **Export** and choose:
- **Copy Mermaid** - Copy code to clipboard
- **Download .mmd** - Mermaid file
- **Copy Markdown** - Mermaid in markdown code block
- **Download PNG** - High-resolution image
- **Download SVG** - Vector format
- **Download PDF** - PDF document

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Quick Start for Contributors

```bash
# Fork and clone the repo
git clone https://github.com/yourusername/flowcraft.git

# Create a branch
git checkout -b feature/your-feature-name

# Make your changes and commit
git commit -m "Add: your feature description"

# Push and create a PR
git push origin feature/your-feature-name
```

## Roadmap

- [x] Supabase integration for cloud storage
- [x] Shorter share links
- [x] User authentication (email, magic link, Google OAuth)
- [x] Password-protected sharing
- [x] More node types and shapes (rectangle, stadium, diamond, circle, database, subroutine)
- [x] Custom themes (Ocean, Forest, Sunset, Wood, Lavender)
- [x] Node resizing and advanced editing
- [ ] Real-time collaboration
- [ ] Sequence diagram support
- [ ] Keyboard shortcuts customization
- [ ] Mobile-responsive editor

## Security

FlowCraft implements multiple security measures:

- **User Data Isolation** - All database queries filter by authenticated user ID
- **Row Level Security (RLS)** - Supabase enforces access control at the database level
- **Open Redirect Prevention** - OAuth callbacks validate redirect URLs
- **Ownership Verification** - Delete operations verify resource ownership
- **Password-Protected Sharing** - Optional password protection for shared diagrams

To report security vulnerabilities, please email security@example.com or open a private security advisory on GitHub.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Acknowledgments

- [React Flow](https://reactflow.dev/) - Powerful flow visualization
- [Mermaid](https://mermaid.js.org/) - Diagram syntax inspiration
- [Dagre](https://github.com/dagrejs/dagre) - Graph layout algorithm
- [Lucide](https://lucide.dev/) - Beautiful icons

## Support

- Report bugs via [GitHub Issues](https://github.com/yourusername/flowcraft/issues)
- Join discussions in [GitHub Discussions](https://github.com/yourusername/flowcraft/discussions)

---

Made with love for the community. Free forever.
