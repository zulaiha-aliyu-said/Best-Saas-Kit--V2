# 🚀 Prompt Library - Quick Start Guide

## ⚡ **5-Minute Setup**

### **Step 1: Database Migration** (2 minutes)

```bash
# Copy SQL to Neon console and run
cat sql-queries/18-create-prompt-library.sql

# Or run setup script
node setup-prompt-library.js
```

### **Step 2: Verify Setup** (1 minute)

```sql
-- Check tables created
SELECT COUNT(*) FROM prompt_library; -- Should be 0
SELECT COUNT(*) FROM prompt_templates; -- Should be 17

-- Check template categories
SELECT category, COUNT(*)
FROM prompt_templates
GROUP BY category;
```

Expected output:
```
content_ideas | 3
research      | 3
writing       | 4
strategy      | 3
hooks         | 3
general       | 3
```

### **Step 3: Access in App** (1 minute)

1. Go to **Dashboard → Chat**
2. See **Prompt Library** panel on right
3. Click **"Templates"** tab
4. Browse 17 pre-built templates!

### **Step 4: Try It Out** (1 minute)

1. Click any template (e.g., "Brainstorm 10 Ideas")
2. Prompt loads into chat input
3. Customize and send!
4. Click **"Save Prompt"** to save your own

---

## 💡 **Quick Tips**

### **Use Templates**
- Click **"Templates"** tab
- Click any template to load
- Replace `[PLACEHOLDERS]` with your content
- Send to AI

### **Save Prompts**
1. Type your prompt in chat
2. Click **"Save Prompt"** button
3. Add title & category
4. Mark as favorite (optional)
5. Save!

### **Find Prompts Fast**
- Use **category filters** (💡🔍✍️🎯🪝⚡)
- Toggle **"Favorites Only"**
- Type in **search bar**

### **Organize**
- ⭐ Star favorites for quick access
- 📊 Track which prompts you use most
- 🗂️ Use categories to stay organized

---

## 🎯 **Template Categories**

| Icon | Category | Examples |
|------|----------|----------|
| 💡 | Content Ideas | Brainstorm, Calendar, Trends |
| 🔍 | Research | Deep Dive, Competitor, Audience |
| ✍️ | Writing | Improve, Hooks, Expand |
| 🎯 | Strategy | Content Plan, Engagement, Cross-Platform |
| 🪝 | Hooks | Viral, Problem-Solution, Curiosity |
| ⚡ | General | Summary, CTAs, SEO |

---

## 🔥 **Popular Templates**

### **1. Brainstorm 10 Ideas** (💡 Content Ideas)
```
Give me 10 unique and engaging content ideas about [TOPIC]
for [PLATFORM]. Make them actionable and specific to my audience.
```

### **2. Write Hook** (✍️ Writing)
```
Write 5 compelling hooks for this topic: [TOPIC].
Make them attention-grabbing and suitable for [PLATFORM].
```

### **3. Competitor Analysis** (🔍 Research)
```
Analyze this competitor content and tell me:
1) What works well
2) Content gaps they're missing
3) Opportunities for me:

[PASTE CONTENT]
```

### **4. Content Strategy** (🎯 Strategy)
```
Create a 30-day content strategy for [NICHE] focused on [GOAL].
Include content themes, posting frequency, and growth tactics.
```

### **5. Viral Hook Generator** (🪝 Hooks)
```
Generate 10 viral hook variations for this topic: [TOPIC].
Use proven patterns like questions, statistics, controversies, and stories.
```

---

## 📱 **User Interface**

```
┌─────────────────────────────────────────────────────┐
│  📚 Prompt Library              [+ Save]            │
├─────────────────────────────────────────────────────┤
│  Stats: 15 prompts | 5 favorites | 47 uses         │
├─────────────────────────────────────────────────────┤
│  🔍 Search prompts...                               │
├─────────────────────────────────────────────────────┤
│  [My Prompts] [✨ Templates]                        │
├─────────────────────────────────────────────────────┤
│  [📚 All] [💡] [🔍] [✍️] [🎯] [🪝] [⚡]            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌────────────────────────────────────────┐       │
│  │ ⭐ Brainstorm 10 Ideas                  │       │
│  │ Generate content ideas for any topic    │       │
│  │ "Give me 10 unique and engaging..."     │       │
│  │ [💡 content_ideas] [brainstorm] [ideas] │       │
│  └────────────────────────────────────────┘       │
│                                                     │
│  [More templates...]                                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## ⚡ **Keyboard Shortcuts**

- **Ctrl/Cmd + K** - Focus search
- **Enter** - Use selected prompt
- **Ctrl/Cmd + S** - Save current prompt
- **Delete** - Delete selected prompt

---

## 🎨 **Best Practices**

### **1. Use Descriptive Titles**
✅ "LinkedIn Post Ideas for SaaS"
❌ "Ideas"

### **2. Add Context to Prompts**
✅ "Generate 10 LinkedIn post ideas for B2B SaaS focused on AI and automation"
❌ "Give me ideas"

### **3. Organize by Category**
- Content Ideas → 💡
- Research → 🔍
- Writing Help → ✍️
- Strategy → 🎯
- Hooks → 🪝
- Quick Tasks → ⚡

### **4. Star Your Favorites**
- Click ⭐ on frequently used prompts
- They appear at the top
- Quick access to best prompts

### **5. Track What Works**
- Check usage stats
- See which prompts you use most
- Refine based on results

---

## 🚨 **Common Issues**

### **Templates Not Showing?**
```sql
-- Run in Neon console
SELECT COUNT(*) FROM prompt_templates;

-- If 0, re-run the SQL file
```

### **Can't Save Prompts?**
- Check you're logged in
- Verify title is not empty
- Check database connection
- View browser console for errors

### **Prompts Not Loading?**
- Refresh page
- Check network tab for API errors
- Verify API routes are working

---

## 📊 **Usage Stats**

View your prompt statistics:
- **Total Prompts** - How many you've saved
- **Favorites** - Starred prompts
- **Total Uses** - Across all prompts
- **Most Used Category** - Your favorite type
- **Recent Activity** - Uses in last 7 days

---

## 🎓 **Pro Tips**

### **1. Create Prompt Templates**
Save prompts with `[PLACEHOLDERS]` for reuse:
```
Generate [NUMBER] [CONTENT_TYPE] ideas about [TOPIC]
for [PLATFORM] targeting [AUDIENCE]
```

### **2. Build Prompt Collections**
Group related prompts by category:
- Monday content → Content Ideas
- Research day → Research
- Writing sprints → Writing
- Planning → Strategy

### **3. Refine Over Time**
- Start with system templates
- Customize based on results
- Save variations that work
- Delete prompts that don't

### **4. Share with Team**
- Export your best prompts
- Share categories that work
- Build team prompt libraries
- Standardize content quality

---

## 🔗 **Quick Links**

- **Full Documentation**: `PROMPT_LIBRARY_IMPLEMENTATION.md`
- **Database Schema**: `sql-queries/18-create-prompt-library.sql`
- **API Routes**: `src/app/api/prompts/`
- **UI Components**: `src/components/chat/prompt-library-panel.tsx`

---

## ✅ **You're Ready!**

1. ✅ Database setup complete
2. ✅ 17 templates loaded
3. ✅ UI integrated
4. ✅ Start using prompts!

**Go to Dashboard → Chat and start using templates!** 🚀

---

**Questions?** Check `PROMPT_LIBRARY_IMPLEMENTATION.md` for detailed docs!
