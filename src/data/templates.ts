export type RepurposeTemplate = {
  id: string
  name: string
  description: string
  category: "Social" | "Launch" | "Community" | "Education" | "Creator"
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  badge?: string
  supportedPlatforms: ("x" | "linkedin" | "instagram" | "email" | "tiktok" | "youtube" | "blog" | "podcast" | "shorts")[]
  recommendedTone: "professional" | "casual" | "motivational" | "funny"
  recommendedLength: "short" | "medium" | "long" | "detailed"
  includeHashtags: boolean
  includeEmojis: boolean
  includeCTA: boolean
  hooks: string[]
  talkingPoints: string[]
  ctaSuggestions: string[]
  hashtagPacks: string[]
  preview: {
    headline: string
    sample: string
    keyTakeaway: string
  }
}

export const REPURPOSE_TEMPLATES: RepurposeTemplate[] = [
  {
    id: "blog-to-social",
    name: "Blog Post → Social Media",
    description: "Transform long-form blog posts into a package of threads, LinkedIn updates, and Instagram carousels.",
    category: "Social",
    difficulty: "Beginner",
    badge: "Popular",
    supportedPlatforms: ["x", "linkedin", "instagram"],
    recommendedTone: "professional",
    recommendedLength: "medium",
    includeHashtags: true,
    includeEmojis: false,
    includeCTA: true,
    hooks: [
      "Here’s the core insight from today’s post…",
      "Ever wondered why [pain point]? Let’s break it down.",
      "Swipe to unpack the 5 biggest lessons from our latest article."
    ],
    talkingPoints: [
      "Summarize top 3 takeaways",
      "Share a quote or data point",
      "Invite conversation with a question"
    ],
    ctaSuggestions: [
      "Read the full post",
      "Drop your experience",
      "Share with someone who needs this"
    ],
    hashtagPacks: [
      "#contentmarketing #growth #digitalstrategy",
      "#saas #startup #marketing"
    ],
    preview: {
      headline: "From blog depth to social punch",
      sample: "Thread intro: ‘We just published a deep dive on [topic]. Here are the 5 most actionable insights in 120 seconds.’",
      keyTakeaway: "Great starting point for every new article."
    }
  },
  {
    id: "youtube-to-thread",
    name: "YouTube → Twitter Thread",
    description: "Convert video chapters into a skimmable, high-impact Twitter/X thread.",
    category: "Social",
    difficulty: "Intermediate",
    badge: "New",
    supportedPlatforms: ["x", "linkedin", "shorts"],
    recommendedTone: "casual",
    recommendedLength: "short",
    includeHashtags: true,
    includeEmojis: true,
    includeCTA: true,
    hooks: [
      "I watched [creator]’s latest video so you don’t have to…",
      "15 minutes = 7 powerful lessons. Let’s go.",
      "The most underrated moment comes at [timestamp]."
    ],
    talkingPoints: [
      "Summarize each chapter",
      "Call out surprising stats",
      "Link to video with UTM"
    ],
    ctaSuggestions: [
      "Watch the full breakdown",
      "Comment your favorite insight",
      "Retweet to save the checklist"
    ],
    hashtagPacks: [
      "#creator #youtube #thread #buildinpublic"
    ],
    preview: {
      headline: "Video threads that pull views back to your channel",
      sample: "Hook: ‘Just took notes on [video]. The best parts aren’t where you’d expect. Here’s the breakdown:’",
      keyTakeaway: "Best for growing social + video simultaneously."
    }
  },
  {
    id: "article-to-newsletter",
    name: "Article → Newsletter",
    description: "Turn dense analysis into a clean, sectioned email with subject line options.",
    category: "Education",
    difficulty: "Beginner",
    badge: "Pro",
    supportedPlatforms: ["email", "blog", "linkedin"],
    recommendedTone: "professional",
    recommendedLength: "detailed",
    includeHashtags: false,
    includeEmojis: false,
    includeCTA: true,
    hooks: [
      "This week’s insight in 90 seconds",
      "Inside the playbook for [result]",
      "What you’ll learn today"
    ],
    talkingPoints: [
      "Key takeaway summary",
      "Featured stat or quote",
      "Action steps + resource links"
    ],
    ctaSuggestions: [
      "Forward to a teammate",
      "Reply with your question",
      "Book a demo"
    ],
    hashtagPacks: [""],
    preview: {
      headline: "Inbox-ready digest",
      sample: "Subject: ‘3 signals that [trend] is accelerating’ → Intro paragraph → 3 bullet insights → CTA block.",
      keyTakeaway: "Great for retaining readers and nurturing leads."
    }
  },
  {
    id: "product-countdown",
    name: "Product Drop Countdown",
    description: "Plan teaser, launch, and follow-up content for a new product release.",
    category: "Launch",
    difficulty: "Advanced",
    badge: "Campaign",
    supportedPlatforms: ["x", "instagram", "email", "tiktok"],
    recommendedTone: "motivational",
    recommendedLength: "medium",
    includeHashtags: true,
    includeEmojis: true,
    includeCTA: true,
    hooks: [
      "T minus [days] until [product] lands.",
      "Here’s what early testers are saying…",
      "Behind the scenes: why we built this."
    ],
    talkingPoints: [
      "Teaser benefits",
      "Launch-day offer",
      "Post-launch social proof"
    ],
    ctaSuggestions: [
      "Join the waitlist",
      "Set a reminder",
      "Claim the launch promo"
    ],
    hashtagPacks: [
      "#launch #productdrop #comingsoon",
      "#saaslaunch #newfeature"
    ],
    preview: {
      headline: "Countdown content that builds momentum",
      sample: "Day -5: Teaser reel script. Day 0: Launch email hero copy. Day +3: Customer testimonial thread.",
      keyTakeaway: "Ideal for orchestrated rollouts."
    }
  },
  {
    id: "feature-announcement",
    name: "Feature Announcement Remix",
    description: "Convert changelog bullet points into customer-centric narratives.",
    category: "Launch",
    difficulty: "Intermediate",
    supportedPlatforms: ["x", "linkedin", "email", "blog"],
    recommendedTone: "professional",
    recommendedLength: "medium",
    includeHashtags: false,
    includeEmojis: false,
    includeCTA: true,
    hooks: [
      "We just shipped [feature] for [audience].",
      "What this update unlocks for you",
      "Before vs after: [metric]"
    ],
    talkingPoints: [
      "Problem addressed",
      "Key capability",
      "Step-by-step on getting started"
    ],
    ctaSuggestions: [
      "Update now",
      "Explore the docs",
      "Book a walkthrough"
    ],
    hashtagPacks: [
      "#productupdate #saas #roadmap"
    ],
    preview: {
      headline: "Human-centric changelog",
      sample: "LinkedIn post: ‘You asked for more automation in [workflow]. Here’s how the new update saves you 3 hours a week.’",
      keyTakeaway: "Makes releases resonate with users."
    }
  },
  {
    id: "offer-blitz",
    name: "Offer Blitz Sequence",
    description: "Repurpose promos into multi-channel bursts with scarcity messaging.",
    category: "Launch",
    difficulty: "Intermediate",
    supportedPlatforms: ["x", "instagram", "email", "tiktok"],
    recommendedTone: "motivational",
    recommendedLength: "short",
    includeHashtags: true,
    includeEmojis: true,
    includeCTA: true,
    hooks: [
      "48 hours left to claim [offer]",
      "See what customers unlocked with this deal",
      "This bonus disappears at midnight"
    ],
    talkingPoints: [
      "Offer details",
      "Use-case spotlight",
      "Urgency reminder"
    ],
    ctaSuggestions: [
      "Redeem the offer",
      "DM for the code",
      "Share with a friend"
    ],
    hashtagPacks: [
      "#limitedtime #flashsale #bonus"
    ],
    preview: {
      headline: "Promo cadence that converts",
      sample: "Email subject: ‘⏰ Flash Offer: 30% off ends tonight’ → Social captions and story prompts to match.",
      keyTakeaway: "Maintains energy without sounding spammy."
    }
  },
  {
    id: "ama-kit",
    name: "Ask-Me-Anything Kit",
    description: "Run an AMA from invite to recap with cohesive messaging.",
    category: "Community",
    difficulty: "Beginner",
    supportedPlatforms: ["x", "linkedin", "instagram", "email"],
    recommendedTone: "casual",
    recommendedLength: "short",
    includeHashtags: true,
    includeEmojis: true,
    includeCTA: true,
    hooks: [
      "Let’s hang out live and talk about [topic]",
      "Drop your questions below",
      "Here’s everything we covered in the AMA"
    ],
    talkingPoints: [
      "Intro + credentials",
      "Question prompts",
      "Recap highlights"
    ],
    ctaSuggestions: [
      "Submit your question",
      "Join the session",
      "Catch the replay"
    ],
    hashtagPacks: [
      "#AMA #community #liveevent"
    ],
    preview: {
      headline: "Community-driven conversations",
      sample: "Invite tweet + Instagram story stickers + post-event summary email template.",
      keyTakeaway: "Boosts engagement and captures user questions."
    }
  },
  {
    id: "testimonial-amplifier",
    name: "Testimonial Amplifier",
    description: "Turn customer stories into social proof sequences and press snippets.",
    category: "Community",
    difficulty: "Intermediate",
    supportedPlatforms: ["x", "linkedin", "instagram", "email", "blog"],
    recommendedTone: "professional",
    recommendedLength: "medium",
    includeHashtags: true,
    includeEmojis: false,
    includeCTA: true,
    hooks: [
      "Customer spotlight: how [name] achieved [result] with [product]",
      "The quote that stopped us in our tracks",
      "Here’s how a real team uses us daily"
    ],
    talkingPoints: [
      "Customer background",
      "Pain vs solution",
      "Measurable outcome"
    ],
    ctaSuggestions: [
      "See the case study",
      "Book a demo",
      "Share your story"
    ],
    hashtagPacks: [
      "#customerstory #testimonial #socialproof"
    ],
    preview: {
      headline: "Social proof, everywhere",
      sample: "Carousel outline + press release paragraph + LinkedIn quote post.",
      keyTakeaway: "Builds trust fast across channels."
    }
  },
  {
    id: "event-recap",
    name: "Event Recap Storyboard",
    description: "Package webinar or conference notes into digestible highlights.",
    category: "Community",
    difficulty: "Beginner",
    supportedPlatforms: ["x", "linkedin", "email", "blog", "instagram"],
    recommendedTone: "professional",
    recommendedLength: "medium",
    includeHashtags: true,
    includeEmojis: false,
    includeCTA: true,
    hooks: [
      "Missed the event? Here’s the TL;DR.",
      "Top 5 insights from [event]",
      "Replay link + key timestamps"
    ],
    talkingPoints: [
      "Speaker highlights",
      "Audience questions",
      "Resources shared"
    ],
    ctaSuggestions: [
      "Watch the replay",
      "Grab the slides",
      "Register for the next event"
    ],
    hashtagPacks: [
      "#webinar #eventrecap #community"
    ],
    preview: {
      headline: "Turn events into evergreen assets",
      sample: "LinkedIn post outline + email recap + Instagram carousel talking points.",
      keyTakeaway: "Extends the life of your events."
    }
  },
  {
    id: "playbook-builder",
    name: "Playbook Builder",
    description: "Transform tutorials into multi-step guides, checklists, and nurture emails.",
    category: "Education",
    difficulty: "Advanced",
    supportedPlatforms: ["blog", "email", "linkedin", "x"],
    recommendedTone: "professional",
    recommendedLength: "detailed",
    includeHashtags: false,
    includeEmojis: false,
    includeCTA: true,
    hooks: [
      "Step-by-step playbook for [outcome]",
      "Here’s the framework we use",
      "Save this checklist for your next sprint"
    ],
    talkingPoints: [
      "Overview",
      "Step breakdown",
      "Pitfall warnings"
    ],
    ctaSuggestions: [
      "Download the full playbook",
      "Save for later",
      "Share with your team"
    ],
    hashtagPacks: [
      "#playbook #howto #framework"
    ],
    preview: {
      headline: "Reusable SOP content",
      sample: "Guided outline for blog + email cadence + mini thread summarizing the steps.",
      keyTakeaway: "Perfect for education-led growth."
    }
  },
  {
    id: "insights-digest",
    name: "Weekly Insights Digest",
    description: "Compile key findings into newsletters, social teasers, and RSS recaps.",
    category: "Education",
    difficulty: "Intermediate",
    supportedPlatforms: ["email", "blog", "x", "linkedin"],
    recommendedTone: "professional",
    recommendedLength: "medium",
    includeHashtags: true,
    includeEmojis: false,
    includeCTA: true,
    hooks: [
      "This week’s 3 biggest shifts",
      "Numbers you need to know",
      "What’s next in [industry]"
    ],
    talkingPoints: [
      "Top insights",
      "Quick commentary",
      "What to watch"
    ],
    ctaSuggestions: [
      "Read the full analysis",
      "Subscribe for updates",
      "Share with a colleague"
    ],
    hashtagPacks: [
      "#newsletter #insights #weekly"
    ],
    preview: {
      headline: "Consistent thought leadership",
      sample: "Newsletter format + LinkedIn teaser + short thread summary.",
      keyTakeaway: "Keeps audiences informed and engaged."
    }
  },
  {
    id: "data-story",
    name: "Data Story Spotlight",
    description: "Turn reports and dashboards into compelling narratives.",
    category: "Education",
    difficulty: "Advanced",
    supportedPlatforms: ["linkedin", "blog", "email", "x"],
    recommendedTone: "professional",
    recommendedLength: "medium",
    includeHashtags: true,
    includeEmojis: false,
    includeCTA: true,
    hooks: [
      "The data says [trend] is real",
      "3 charts that caught our attention",
      "Here’s the insight behind the numbers"
    ],
    talkingPoints: [
      "Key metrics",
      "Interpretation",
      "Action plan"
    ],
    ctaSuggestions: [
      "Download the report",
      "Explore the dashboard",
      "Request a custom analysis"
    ],
    hashtagPacks: [
      "#datastorytelling #analytics #insights"
    ],
    preview: {
      headline: "Stories that make metrics memorable",
      sample: "LinkedIn post: ‘We analyzed 10,000 campaigns. These 3 levers move the needle the most.’",
      keyTakeaway: "Ideal for analysts and growth teams."
    }
  },
  {
    id: "youtube-to-podcast",
    name: "YouTube → Podcast Companion",
    description: "Generate show notes, timestamps, and recap posts from your video episodes.",
    category: "Creator",
    difficulty: "Intermediate",
    supportedPlatforms: ["podcast", "blog", "email", "x"],
    recommendedTone: "casual",
    recommendedLength: "medium",
    includeHashtags: true,
    includeEmojis: false,
    includeCTA: true,
    hooks: [
      "Episode companion guide",
      "Highlights + timestamps",
      "Why this episode matters"
    ],
    talkingPoints: [
      "Episode overview",
      "Key segments",
      "Guest quotes"
    ],
    ctaSuggestions: [
      "Listen now",
      "Subscribe on [platform]",
      "Share with your co-host"
    ],
    hashtagPacks: [
      "#podcast #shownotes #episode"
    ],
    preview: {
      headline: "Stretch video content into audio assets",
      sample: "Show notes intro + bullet timestamps + CTA to subscribe.",
      keyTakeaway: "Supports multi-format publishing."
    }
  },
  {
    id: "podcast-to-blog",
    name: "Podcast → Blog & Social",
    description: "Turn audio transcripts into long-form articles, quote graphics, and thread starters.",
    category: "Creator",
    difficulty: "Advanced",
    supportedPlatforms: ["blog", "x", "linkedin", "instagram"],
    recommendedTone: "professional",
    recommendedLength: "detailed",
    includeHashtags: true,
    includeEmojis: false,
    includeCTA: true,
    hooks: [
      "Best quotes from this episode",
      "The story behind [topic]",
      "5 lessons from our conversation with [guest]"
    ],
    talkingPoints: [
      "Episode synopsis",
      "Quote cards",
      "Action items"
    ],
    ctaSuggestions: [
      "Read the full blog",
      "Share your takeaway",
      "Tag a colleague"
    ],
    hashtagPacks: [
      "#podcast #blogpost #contentrepurpose"
    ],
    preview: {
      headline: "Audio to text powerhouse",
      sample: "Blog intro + pull-quote highlight + Twitter carousel copy.",
      keyTakeaway: "Maximize creator reach across formats."
    }
  },
  {
    id: "livestream-clips",
    name: "Livestream → Multi-Clip Kit",
    description: "Slice live sessions into highlight clips, caption ideas, and distribution plan.",
    category: "Creator",
    difficulty: "Intermediate",
    supportedPlatforms: ["shorts", "tiktok", "instagram", "x"],
    recommendedTone: "casual",
    recommendedLength: "short",
    includeHashtags: true,
    includeEmojis: true,
    includeCTA: true,
    hooks: [
      "Clip this moment",
      "Best quote from the live",
      "You won’t believe what happened at [timestamp]"
    ],
    talkingPoints: [
      "Clip summaries",
      "Context captions",
      "Cross-posting schedule"
    ],
    ctaSuggestions: [
      "Subscribe for the next live",
      "Comment your favorite moment",
      "Share this clip"
    ],
    hashtagPacks: [
      "#livestream #shorts #contentclips"
    ],
    preview: {
      headline: "Extend your live show’s lifespan",
      sample: "Clip lineup + caption starters + suggested hashtag sets.",
      keyTakeaway: "Keeps the momentum going after the live ends."
    }
  }
]
