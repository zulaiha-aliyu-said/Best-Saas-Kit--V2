# Trends API Integration Setup

## 📦 Required Dependencies

Run this command to install the required packages:

```bash
npm install axios google-trends-api
```

## 🔑 Environment Variables

Add these to your `.env.local` file:

```env
# Reddit API (Get from: https://www.reddit.com/prefs/apps)
REDDIT_CLIENT_ID=your_reddit_client_id_here
REDDIT_CLIENT_SECRET=your_reddit_client_secret_here

# News API (Get from: https://newsapi.org/)
NEWS_API_KEY=your_news_api_key_here
```

## 🚀 How to Get API Keys

### Reddit API
1. Go to https://www.reddit.com/prefs/apps
2. Click "Create App" or "Create Another App"
3. Fill in:
   - **Name**: RepurposeAI
   - **Type**: Select "script"
   - **Description**: Content repurposing tool
   - **Redirect URI**: http://localhost:3000
4. Click "Create app"
5. Copy your **Client ID** (under the app name)
6. Copy your **Client Secret**

### News API
1. Go to https://newsapi.org/register
2. Sign up for a free account
3. Verify your email
4. Copy your API key from the dashboard
5. Free tier: 100 requests/day

### Google Trends
- No API key needed! ✅
- Uses the `google-trends-api` package
- Works out of the box

## 📊 What Each API Provides

### Reddit API
- **Trending discussions** from popular subreddits
- Categories: technology, business, marketing, entrepreneur, startups
- Real-time engagement data
- Community insights

### News API
- **Top headlines** from major news sources
- Categories: technology, business
- Fresh news articles
- High-quality content

### Google Trends
- **Daily trending searches** worldwide
- Real-time search trends
- Popular topics
- Geographic data (US by default)

## ✅ Testing the Integration

After adding the API keys, test the integration:

1. Start your dev server:
```bash
npm run dev
```

2. Navigate to: http://localhost:3000/dashboard/trends

3. Click "Refresh Trends" button

4. Check the console for logs:
   - "Fetching fresh trends from APIs..."
   - "Fetched X real trends"

## 🔄 Fallback Behavior

If any API fails or keys are missing:
- ✅ App continues to work
- ✅ Falls back to curated mock data
- ✅ No errors shown to users
- ⚠️ Console warnings for debugging

## 📝 API Response Structure

Each trend includes:
```typescript
{
  id: string,
  title: string,
  description: string,
  views: string,          // e.g., "2.3M", "500K"
  growth: string,         // e.g., "+347%"
  badge: string,          // e.g., "#1 Trending"
  badgeColor: string,     // e.g., "bg-red-500"
  tags: string[],         // e.g., ["#AI", "#Tech"]
  platforms: string[],    // e.g., ["twitter", "linkedin"]
  category: string,       // e.g., "tech", "business"
  engagement: number,     // 0-100
  source: string          // "reddit", "news", or "google"
}
```

## 🎯 Cache Settings

- **Cache Duration**: 30 minutes
- **Refresh**: Automatic on filter change
- **Manual Refresh**: Click "Refresh Trends" button

## 🔧 Troubleshooting

### "Failed to fetch trends" error
1. Check your `.env.local` file
2. Verify API keys are correct
3. Check API rate limits
4. Review console logs

### No real trends showing
1. Ensure dependencies are installed
2. Restart dev server after adding keys
3. Check API key validity
4. Review network tab for API calls

### Reddit API errors
- Verify both CLIENT_ID and CLIENT_SECRET
- Check app type is "script"
- Ensure redirect URI is set

### News API errors
- Check daily request limit (100/day free)
- Verify API key is active
- Check account status

## 📈 Next Steps

After setup, you can:
1. ✅ View real trending topics
2. ✅ Filter by platform and category
3. ✅ Copy trending hashtags
4. ✅ Use topics in content creation
5. ✅ Track engagement metrics

## 🔮 Future Enhancements

- [ ] Twitter/X API integration
- [ ] Database storage for trends
- [ ] Historical trend analysis
- [ ] Custom trend sources
- [ ] User-specific recommendations
