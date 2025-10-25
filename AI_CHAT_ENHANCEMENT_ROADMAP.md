# 🤖 AI Chat Enhancement - Implementation Roadmap

## 🎯 **Phase 1: Foundation (Week 1)**

### **Feature 1: Chat History & Context Memory** ⭐ **Priority 1**

#### **What It Does:**
- Saves all chat conversations to database
- Shows conversation history in sidebar
- Allows users to continue previous conversations
- AI can reference user's past content (hooks, repurposed posts, trends)

#### **Technical Implementation:**

##### **1. Database Schema**
```sql
-- Chat conversations table
CREATE TABLE chat_conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_message_at TIMESTAMP DEFAULT NOW(),
  message_count INTEGER DEFAULT 0
);

-- Chat messages table
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);
```

##### **2. API Routes**
```typescript
// src/app/api/chat/conversations/route.ts
GET  /api/chat/conversations       // List user's conversations
POST /api/chat/conversations       // Create new conversation
DELETE /api/chat/conversations/[id] // Delete conversation

// src/app/api/chat/conversations/[id]/route.ts
GET  /api/chat/conversations/[id]  // Get conversation with messages
PUT  /api/chat/conversations/[id]  // Update conversation title

// src/app/api/chat/conversations/[id]/messages/route.ts
POST /api/chat/conversations/[id]/messages // Add message & get AI response
```

##### **3. Frontend Components**
```typescript
// src/components/chat/chat-history.tsx
- Sidebar showing all conversations
- Search conversations
- Create new conversation
- Delete conversations
- Click to load conversation

// src/components/chat/chat-interface.tsx (ENHANCE EXISTING)
- Add conversation selector
- Add "New Chat" button
- Load messages from selected conversation
- Auto-save messages to DB
- Show conversation title

// src/components/chat/chat-context-panel.tsx (NEW)
- Show user's recent content
- Recent hooks generated
- Recent repurposed posts
- Recent trends viewed
- "Use in Chat" buttons
```

##### **4. Context Integration**
```typescript
// src/lib/chat-context.ts
export async function getUserContext(userId: number) {
  return {
    recentHooks: await getRecentHooks(userId, 5),
    recentPosts: await getRecentRepurposedContent(userId, 5),
    recentTrends: await getRecentTrendViews(userId, 3),
    style: await getUserWritingStyle(userId),
    competitors: await getUserCompetitors(userId, 3)
  };
}

// Include in AI system prompt:
system: `You are assisting ${userName}. Here's their recent activity:
- Recently generated hooks: ${hooks}
- Recently repurposed: ${posts}
- Recently viewed trends: ${trends}
- Writing style: ${style.tone}

When relevant, reference their past work and suggest improvements.`
```

#### **Files to Create:**
- `src/app/api/chat/conversations/route.ts`
- `src/app/api/chat/conversations/[id]/route.ts`
- `src/app/api/chat/conversations/[id]/messages/route.ts`
- `src/components/chat/chat-history.tsx`
- `src/components/chat/chat-context-panel.tsx`
- `src/lib/chat-context.ts`
- `sql-queries/create-chat-tables.sql`

#### **Files to Modify:**
- `src/components/chat/chat-interface.tsx` (add history integration)
- `src/app/dashboard/chat/page.tsx` (add sidebar layout)
- `src/lib/database.ts` (add chat functions)

#### **Estimated Time:** 2-3 days
#### **Complexity:** Medium

---

## 🎯 **Phase 2: Productivity (Week 2)**

### **Feature 2: Prompt Library (Save & Reuse)** ⭐ **Priority 2**

#### **What It Does:**
- Users save effective prompts
- Categorize prompts (Content Ideas, Research, Writing Help, etc.)
- Quick insert saved prompts
- Share prompts across team (future)
- Pre-built template prompts

#### **Technical Implementation:**

##### **1. Database Schema**
```sql
CREATE TABLE prompt_library (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  prompt TEXT NOT NULL,
  category VARCHAR(100), -- 'content_ideas', 'research', 'writing', 'strategy'
  is_favorite BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_prompt_library_user_id ON prompt_library(user_id);
CREATE INDEX idx_prompt_library_category ON prompt_library(category);
```

##### **2. API Routes**
```typescript
// src/app/api/prompts/route.ts
GET  /api/prompts       // List user's prompts
POST /api/prompts       // Create new prompt
PUT  /api/prompts/[id]  // Update prompt
DELETE /api/prompts/[id] // Delete prompt

// src/app/api/prompts/templates/route.ts
GET  /api/prompts/templates // Get system templates (pre-built)
```

##### **3. Frontend Components**
```typescript
// src/components/chat/prompt-library-panel.tsx
- Show saved prompts
- Category tabs
- Search prompts
- Click to insert
- Edit/Delete prompts
- Mark as favorite

// src/components/chat/save-prompt-modal.tsx
- Save current prompt
- Add title & category
- Quick save button

// src/components/chat/prompt-templates.tsx
- Pre-built templates
- One-click use
- Category filters
```

##### **4. Pre-built Templates**
```typescript
// src/data/prompt-templates.ts
export const PROMPT_TEMPLATES = [
  {
    category: 'content_ideas',
    title: 'Brainstorm 10 Ideas',
    prompt: 'Give me 10 unique content ideas about [TOPIC] for [PLATFORM]. Make them engaging and actionable.',
  },
  {
    category: 'research',
    title: 'Topic Deep Dive',
    prompt: 'Research [TOPIC] and give me: key trends, expert opinions, statistics, and content angles.',
  },
  {
    category: 'writing',
    title: 'Improve My Draft',
    prompt: 'Improve this draft. Make it more engaging, fix grammar, and enhance clarity:\n\n[PASTE DRAFT]',
  },
  {
    category: 'strategy',
    title: 'Content Calendar',
    prompt: 'Create a 7-day content calendar for [NICHE] on [PLATFORM]. Include post ideas, hashtags, and posting times.',
  },
  {
    category: 'competitor',
    title: 'Competitor Analysis',
    prompt: 'Analyze this competitor content and tell me: what works, content gaps, and opportunities:\n\n[PASTE CONTENT]',
  }
];
```

#### **Files to Create:**
- `src/app/api/prompts/route.ts`
- `src/app/api/prompts/[id]/route.ts`
- `src/app/api/prompts/templates/route.ts`
- `src/components/chat/prompt-library-panel.tsx`
- `src/components/chat/save-prompt-modal.tsx`
- `src/components/chat/prompt-templates.tsx`
- `src/data/prompt-templates.ts`
- `sql-queries/create-prompt-library.sql`

#### **Files to Modify:**
- `src/components/chat/chat-interface.tsx` (add prompt insertion)
- `src/app/dashboard/chat/page.tsx` (add prompt library panel)
- `src/lib/database.ts` (add prompt functions)

#### **Estimated Time:** 1-2 days
#### **Complexity:** Low-Medium

---

## 🎯 **Phase 3: Action-Oriented (Week 2-3)**

### **Feature 3: Content Action Buttons** ⭐ **Priority 3**

#### **What It Does:**
- "Turn This Into a Post" button on AI responses
- "Generate Hooks from This" button
- "Schedule This Content" button
- "Save to Library" button
- Quick actions make chat immediately actionable

#### **Technical Implementation:**

##### **1. Action Detection**
```typescript
// src/lib/chat-actions.ts
export function detectActionableContent(message: string) {
  const actions = [];

  // Detect if message contains content ideas
  if (containsContentIdeas(message)) {
    actions.push({
      type: 'repurpose',
      label: 'Turn into Posts',
      icon: 'Sparkles'
    });
  }

  // Detect if message contains hooks
  if (containsHooks(message)) {
    actions.push({
      type: 'save_hooks',
      label: 'Save Hooks',
      icon: 'Save'
    });
  }

  // Detect if message is strategy/plan
  if (containsStrategy(message)) {
    actions.push({
      type: 'create_calendar',
      label: 'Create Calendar',
      icon: 'Calendar'
    });
  }

  return actions;
}
```

##### **2. Action Handlers**
```typescript
// src/components/chat/chat-actions.tsx
export function ChatActionButtons({ message, conversationId }) {
  const actions = detectActionableContent(message.content);

  const handleRepurpose = () => {
    // Pre-fill repurpose page with chat content
    router.push(`/dashboard/repurpose?prefill=${encodeURIComponent(message.content)}`);
  };

  const handleSaveHooks = () => {
    // Extract hooks and save to database
    const hooks = extractHooks(message.content);
    saveBulkHooks(hooks);
  };

  const handleSchedule = () => {
    // Open schedule modal with content
    setScheduleContent(message.content);
    setScheduleModalOpen(true);
  };

  return (
    <div className="flex gap-2 mt-2">
      {actions.map(action => (
        <Button
          key={action.type}
          size="sm"
          variant="outline"
          onClick={() => handleAction(action.type)}
        >
          <action.icon className="w-3 h-3 mr-1" />
          {action.label}
        </Button>
      ))}
    </div>
  );
}
```

##### **3. Quick Templates in Chat**
```typescript
// src/components/chat/quick-actions.tsx
export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-2 p-4">
      <Button onClick={() => sendMessage("Give me 5 content ideas about AI")}>
        💡 Content Ideas
      </Button>
      <Button onClick={() => sendMessage("Analyze this trend: [paste trend]")}>
        📊 Analyze Trend
      </Button>
      <Button onClick={() => sendMessage("Create hooks for: [topic]")}>
        🎣 Generate Hooks
      </Button>
      <Button onClick={() => sendMessage("Help me repurpose: [content]")}>
        ♻️ Repurpose Help
      </Button>
    </div>
  );
}
```

#### **Files to Create:**
- `src/lib/chat-actions.ts`
- `src/components/chat/chat-action-buttons.tsx`
- `src/components/chat/quick-actions.tsx`
- `src/components/chat/export-chat-modal.tsx`

#### **Files to Modify:**
- `src/components/chat/chat-message.tsx` (add action buttons)
- `src/components/chat/chat-interface.tsx` (add quick actions)

#### **Estimated Time:** 2 days
#### **Complexity:** Medium

---

## 🎯 **Phase 4: Advanced Features (Week 3-4)**

### **Feature 4: Multi-Model Switching** ⭐ **Priority 4**

#### **What It Does:**
- Choose between GPT-4, Claude, Gemini, etc.
- Different models for different tasks
- Cost comparison
- Quality comparison

#### **Implementation:**
```typescript
// src/lib/ai-models.ts
export const AI_MODELS = [
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    costPer1M: 10,
    strengths: ['Creative', 'Detailed'],
    speed: 'Medium'
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    costPer1M: 15,
    strengths: ['Analytical', 'Precise'],
    speed: 'Fast'
  },
  {
    id: 'qwen3-235b',
    name: 'Qwen3-235B',
    provider: 'OpenRouter',
    costPer1M: 0.5,
    strengths: ['Fast', 'Affordable'],
    speed: 'Very Fast'
  }
];
```

**Estimated Time:** 2-3 days

---

### **Feature 5: Knowledge Base Upload** ⭐ **Priority 5**

#### **What It Does:**
- Upload brand guidelines (PDF, DOCX)
- Upload product documentation
- AI references uploaded documents
- Context-aware responses

**Estimated Time:** 3-4 days (requires vector database/embeddings)

---

## 📊 **Implementation Priority Matrix**

| Feature | User Value | Dev Effort | ROI | Start Date |
|---------|------------|------------|-----|------------|
| Chat History & Context | ⭐⭐⭐⭐⭐ | Medium | Very High | Day 1 |
| Prompt Library | ⭐⭐⭐⭐ | Low | Very High | Day 4 |
| Content Actions | ⭐⭐⭐⭐⭐ | Medium | Very High | Day 6 |
| Multi-Model | ⭐⭐⭐ | Medium | Medium | Day 9 |
| Knowledge Base | ⭐⭐⭐⭐ | High | Medium | Day 12 |

---

## 🚀 **Quick Start: Week 1 Sprint**

### **Day 1-2: Database & Backend**
- ✅ Create chat tables (conversations, messages)
- ✅ Create prompt library table
- ✅ Build API routes
- ✅ Add database functions

### **Day 3-4: Chat History UI**
- ✅ Conversation sidebar
- ✅ Message persistence
- ✅ Context panel (recent content)
- ✅ New chat / Load chat

### **Day 5-6: Prompt Library**
- ✅ Prompt library panel
- ✅ Save/edit/delete prompts
- ✅ Pre-built templates
- ✅ Quick insert

### **Day 7: Testing & Polish**
- ✅ Test all features
- ✅ Fix bugs
- ✅ Add loading states
- ✅ Improve UX

---

## 🎯 **Expected Outcomes**

After Phase 1-3 (Weeks 1-2), users will be able to:

1. **Have ongoing conversations** that save automatically
2. **Reference their past work** (hooks, posts, trends) in chat
3. **Save and reuse prompts** for common tasks
4. **Take immediate action** on AI responses
5. **Turn conversations into content** with one click

This transforms chat from a **simple Q&A tool** into a **powerful content creation workspace**.

---

## 💡 **Success Metrics**

Track these to measure impact:

- Chat engagement rate (% of users using chat)
- Messages per conversation (should increase with history)
- Prompt library usage (saved prompts used)
- Action button clicks (chat → content conversion)
- Time saved per user
- Content quality improvement

---

## 🔧 **Technical Requirements**

### **Dependencies:**
- ✅ PostgreSQL (already using)
- ✅ NextAuth session (already set up)
- ✅ OpenRouter API (already integrated)
- ✅ Existing repurpose/hooks APIs

### **New Dependencies:**
- None required for Phase 1-3!
- Phase 4+ may need: Pinecone (vector DB), PDF parser

---

## 📝 **Documentation to Create**

1. `AI_CHAT_USER_GUIDE.md` - How to use enhanced chat
2. `CHAT_API_REFERENCE.md` - API endpoints documentation
3. `PROMPT_TEMPLATES_GUIDE.md` - How to create effective prompts

---

**Ready to start? Let's begin with Phase 1: Chat History & Context Memory! 🚀**
