# 🎯 Predictive Performance Score Feature

## Overview

The Predictive Performance Score is an AI-powered feature that analyzes social media content and predicts its performance potential before posting. This feature helps users optimize their content for better engagement, reach, and overall performance across different social media platforms.

## ✨ Key Features

### 🧠 AI-Powered Analysis
- **Multi-factor Scoring**: Analyzes content quality, engagement potential, algorithm optimization, timing trends, and audience fit
- **Platform-Specific Insights**: Tailored analysis for Instagram, X (Twitter), LinkedIn, Facebook, TikTok, and Email
- **Real-time Predictions**: Instant analysis using OpenRouter AI models
- **Fallback System**: Mock predictions when AI services are unavailable
- **AI Content Generation**: Automatically generates improved content when scores are low (≤50%)

### 📊 Comprehensive Scoring System
- **Overall Score**: 0-100 performance rating
- **Detailed Breakdown**: Individual scores for 5 key factors
- **Actionable Insights**: Key strengths and opportunities
- **Risk Assessment**: Potential issues and recommendations
- **Predicted Metrics**: Expected likes, comments, shares, and reach
- **Smart Recommendations**: AI-generated alternative content for low-performing posts

### 🔄 Integration Points
- **Repurpose Page**: Analyze repurposed content across all platforms
- **Trends Page**: Predict performance of trending content
- **Schedule Modal**: Optional performance check before scheduling
- **Content Creation**: Real-time feedback during content creation

## 🏗️ Technical Implementation

### API Endpoints

#### Performance Prediction
**`POST /api/ai/predict-performance`**

**Request Body:**
```json
{
  "content": "Your social media content here",
  "platform": "x|linkedin|instagram|facebook|tiktok|email",
  "tone": "professional|casual|motivational|educational",
  "hashtags": ["hashtag1", "hashtag2"],
  "scheduledTime": "2024-01-01T12:00:00Z",
  "contentType": "post|story|thread|newsletter"
}
```

#### Content Improvement
**`POST /api/ai/generate-improved-content`**

**Request Body:**
```json
{
  "originalContent": "Your original content here",
  "platform": "x|linkedin|instagram|facebook|tiktok|email",
  "tone": "professional|casual|motivational|educational",
  "currentScore": 45,
  "improvementType": "general|engagement|viral|professional"
}
```

**Response:**
```json
{
  "success": true,
  "improvements": {
    "suggestions": [
      {
        "title": "Compelling headline/title",
        "content": "Full improved content with specific advice",
        "predictedScore": 85,
        "improvements": ["Specific improvement 1", "Specific improvement 2"]
      }
    ],
    "analysis": {
      "mainIssues": ["Issue 1", "Issue 2"],
      "keyImprovements": ["Improvement 1", "Improvement 2"],
      "platformOptimization": "Platform-specific advice"
    }
  },
  "model": "qwen/qwen3-235b-a22b-2507",
  "usage": { "total_tokens": 200 },
  "credits": 8
}
```

### Database Schema

#### `performance_predictions` Table
```sql
CREATE TABLE performance_predictions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    platform VARCHAR(50) NOT NULL,
    tone VARCHAR(50) DEFAULT 'professional',
    content_type VARCHAR(50) DEFAULT 'post',
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    breakdown JSONB NOT NULL,
    insights TEXT[] DEFAULT '{}',
    recommendations TEXT[] DEFAULT '{}',
    risk_factors TEXT[] DEFAULT '{}',
    predicted_metrics JSONB DEFAULT '{}',
    model_name VARCHAR(255),
    model_version VARCHAR(100),
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### `performance_feedback` Table
```sql
CREATE TABLE performance_feedback (
    id SERIAL PRIMARY KEY,
    prediction_id INTEGER NOT NULL REFERENCES performance_predictions(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    actual_likes INTEGER DEFAULT 0,
    actual_comments INTEGER DEFAULT 0,
    actual_shares INTEGER DEFAULT 0,
    actual_reach INTEGER DEFAULT 0,
    actual_engagement_rate DECIMAL(5,2) DEFAULT 0.00,
    feedback_notes TEXT,
    accuracy_rating INTEGER CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### React Components

#### `PredictivePerformanceModal`
```tsx
interface PredictivePerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  platform: string;
  tone?: string;
  hashtags?: string[];
  scheduledTime?: Date;
  contentType?: string;
}
```

**Features:**
- Clean, modern modal design with BETA badge
- Real-time score visualization with progress bars
- Detailed breakdown with color-coded metrics
- Actionable insights and recommendations
- Risk factor identification
- Predicted performance metrics
- Regenerate functionality
- Error handling with retry options

## 🎨 User Experience

### Visual Design
- **Score Display**: Large, color-coded score (0-100) with performance labels
- **Progress Bars**: Individual factor breakdowns with visual progress indicators
- **Color Coding**: Green (80+), Yellow (60-79), Red (<60)
- **Icons**: Platform-specific icons and intuitive UI elements
- **Responsive**: Works seamlessly on desktop and mobile

### User Flow
1. **Content Creation**: User creates content in repurpose or trends page
2. **Prediction Request**: User clicks "Predict Performance" button
3. **AI Analysis**: System analyzes content using AI models
4. **Results Display**: Modal shows comprehensive prediction results
5. **Action Items**: User can regenerate, schedule, or optimize content
6. **Feedback Loop**: Optional feedback collection for accuracy improvement

## 🔧 Configuration

### Environment Variables
```env
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=qwen/qwen3-235b-a22b-2507
GROQ_API_KEY=your_groq_api_key
DATABASE_URL=your_database_connection_string
```

### AI Model Configuration
- **Primary Model**: OpenRouter with configurable model selection
- **Fallback**: Groq AI (llama-3.1-8b-instant) for reliability
- **Final Fallback**: Mock prediction system for guaranteed functionality
- **Temperature**: 0.3 for consistent scoring
- **Max Tokens**: 1000 for comprehensive analysis

## 📈 Analytics & Insights

### User Statistics
- Total predictions made
- Average performance scores
- Platform usage breakdown
- Recent activity tracking

### Accuracy Tracking
- Prediction vs. actual performance comparison
- User feedback collection
- Model performance analytics
- Continuous improvement metrics

### Admin Dashboard Integration
- Prediction volume analytics
- Model performance metrics
- User engagement statistics
- Accuracy trend analysis

## 🚀 Deployment

### Database Setup
1. Run the SQL migration: `sql-queries/08-create-performance-predictions-schema.sql`
2. Verify table creation and indexes
3. Test database functions

### API Deployment
1. Ensure OpenRouter API key is configured
2. Test API endpoint functionality
3. Verify credit deduction system
4. Monitor error handling

### Frontend Integration
1. Import components in target pages
2. Add prediction buttons to content sections
3. Test modal functionality
4. Verify responsive design

## 🔒 Security & Privacy

### Data Protection
- User authentication required for all predictions
- Content is stored securely in database
- No sensitive data exposure in logs
- GDPR-compliant data handling

### Rate Limiting
- Credit-based usage system
- Prevents API abuse
- Fair usage across all users
- Admin monitoring capabilities

## 🎯 Future Enhancements

### Planned Features
- **A/B Testing**: Compare multiple content versions
- **Historical Analysis**: Track performance trends over time
- **Advanced Analytics**: Deeper insights and recommendations
- **Integration APIs**: Connect with social media platforms for real metrics
- **Custom Models**: Platform-specific AI models
- **Batch Analysis**: Analyze multiple posts simultaneously

### Performance Optimizations
- **Caching**: Cache predictions for similar content
- **Batch Processing**: Handle multiple requests efficiently
- **Model Optimization**: Fine-tune AI models for better accuracy
- **Real-time Updates**: Live performance tracking

## 📚 Usage Examples

### Basic Usage
```tsx
// In your component
const [performanceModalOpen, setPerformanceModalOpen] = useState(false);
const [performanceContent, setPerformanceContent] = useState("");

const handlePerformancePrediction = (content: string, platform: string) => {
  setPerformanceContent(content);
  setPerformancePlatform(platform);
  setPerformanceModalOpen(true);
};

// In your JSX
<Button onClick={() => handlePerformancePrediction(content, 'x')}>
  <BarChart3 className="h-4 w-4 mr-2" />
  Predict Performance
</Button>

<PredictivePerformanceModal
  isOpen={performanceModalOpen}
  onClose={() => setPerformanceModalOpen(false)}
  content={performanceContent}
  platform="x"
  tone="professional"
/>
```

### API Usage
```javascript
const response = await fetch('/api/ai/predict-performance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: "Your content here",
    platform: "x",
    tone: "professional"
  })
});

const data = await response.json();
console.log('Prediction Score:', data.prediction.score);
```

## 🎉 Benefits

### For Users
- **Better Content**: Optimize posts before publishing
- **Time Savings**: Avoid trial-and-error posting
- **Confidence**: Data-driven content decisions
- **Learning**: Understand what makes content perform well

### For Business
- **User Engagement**: Increased platform usage
- **Retention**: Valuable feature keeps users active
- **Analytics**: Rich data for product improvement
- **Competitive Edge**: Unique AI-powered feature

### For Platform
- **Differentiation**: Stand out from competitors
- **User Value**: Clear ROI for users
- **Data Collection**: Valuable insights for AI improvement
- **Monetization**: Premium feature potential

---

## 🎯 Summary

The Predictive Performance Score feature transforms your SaaS app from a simple content creation tool into an intelligent content strategy platform. By leveraging AI to predict social media performance, users can make data-driven decisions, optimize their content, and achieve better results.

This feature positions your app as a strategic partner rather than just a tool, increasing user engagement, retention, and satisfaction while providing valuable insights for continuous improvement.
