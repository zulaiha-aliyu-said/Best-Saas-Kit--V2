# Ayrshare Social Media API Integration

This document outlines the complete integration of Ayrshare Social Media API into the Best SaaS Kit V2 application for social media scheduling and management.

## Overview

Ayrshare is a comprehensive social media management platform that allows you to:
- Connect multiple social media accounts
- Schedule posts across platforms
- Analyze post performance
- Manage hashtags and media
- Automate social media workflows

## Setup Instructions

### 1. Environment Variables

Add the following environment variable to your `.env.local` file:

```bash
AYRSHARE_API_KEY="your-ayrshare-api-key"
```

You can get your API key by:
1. Signing up at [Ayrshare](https://ayrshare.com)
2. Going to your dashboard
3. Navigating to API settings
4. Generating a new API key

### 2. Supported Platforms

The integration supports the following social media platforms:
- **Twitter/X** (`twitter`)
- **Instagram** (`instagram`)
- **LinkedIn** (`linkedin`)
- **Facebook** (`facebook`)
- **Pinterest** (`pinterest`)
- **YouTube** (`youtube`)
- **TikTok** (`tiktok`)
- **Reddit** (`reddit`)
- **Telegram** (`telegram`)
- **Snapchat** (`snapchat`)
- **Threads** (`threads`)
- **Bluesky** (`bluesky`)
- **Google Business** (`google_business`)

## API Endpoints

### Account Management

#### Get Connected Accounts
```http
GET /api/ayrshare/accounts
```

Returns a list of connected social media accounts.

**Response:**
```json
{
  "success": true,
  "accounts": [
    {
      "id": "account_id",
      "platform": "twitter",
      "username": "username",
      "handle": "@username",
      "name": "Display Name",
      "avatar": "profile_picture_url",
      "isActive": true,
      "ayrshareId": "ayrshare_account_id"
    }
  ],
  "count": 1
}
```

#### Connect New Account
```http
POST /api/ayrshare/accounts
```

Initiates OAuth flow for connecting a new social media account.

**Request Body:**
```json
{
  "platform": "twitter",
  "redirectUrl": "https://yourapp.com/dashboard/schedule"
}
```

**Response:**
```json
{
  "success": true,
  "authUrl": "https://app.ayrshare.com/api/oauth/twitter?redirect_uri=...",
  "message": "Redirect to twitter for authentication"
}
```

#### Disconnect Account
```http
DELETE /api/ayrshare/accounts?accountId=account_id
```

Disconnects a social media account.

### Post Management

#### Schedule a Post
```http
POST /api/ayrshare/posts
```

Schedules a post to be published at a specific time.

**Request Body:**
```json
{
  "platforms": ["twitter", "instagram"],
  "content": "Your post content here",
  "scheduledAt": "2024-01-15T10:00:00Z",
  "timezone": "UTC",
  "mediaUrls": ["https://example.com/image.jpg"],
  "hashtags": ["marketing", "socialmedia"],
  "link": "https://example.com",
  "location": {
    "name": "New York, NY",
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

**Response:**
```json
{
  "success": true,
  "post": {
    "id": "post_id",
    "platforms": ["twitter", "instagram"],
    "text": "Your post content here",
    "scheduleDate": "2024-01-15T10:00:00Z",
    "status": "scheduled",
    "createdAt": "2024-01-01T12:00:00Z",
    "updatedAt": "2024-01-01T12:00:00Z"
  },
  "message": "Post scheduled successfully"
}
```

#### Get Scheduled Posts
```http
GET /api/ayrshare/posts
```

Retrieves all scheduled posts.

**Response:**
```json
{
  "success": true,
  "posts": [
    {
      "id": "post_id",
      "platforms": ["twitter"],
      "text": "Post content",
      "scheduleDate": "2024-01-15T10:00:00Z",
      "status": "scheduled",
      "createdAt": "2024-01-01T12:00:00Z",
      "updatedAt": "2024-01-01T12:00:00Z"
    }
  ],
  "count": 1
}
```

#### Update Scheduled Post
```http
PUT /api/ayrshare/posts/[postId]
```

Updates an existing scheduled post.

#### Delete Scheduled Post
```http
DELETE /api/ayrshare/posts/[postId]
```

Deletes a scheduled post.

#### Pause/Resume Post
```http
PATCH /api/ayrshare/posts/[postId]?action=pause
PATCH /api/ayrshare/posts/[postId]?action=resume
```

Pauses or resumes a scheduled post.

### Analytics

#### Get Post Analytics
```http
GET /api/ayrshare/analytics?postId=post_id
```

Retrieves analytics data for a specific post.

**Response:**
```json
{
  "success": true,
  "analytics": [
    {
      "postId": "post_id",
      "platform": "twitter",
      "metrics": {
        "likes": 150,
        "comments": 25,
        "shares": 10,
        "views": 1000,
        "clicks": 50,
        "impressions": 2000
      },
      "date": "2024-01-15T10:00:00Z"
    }
  ],
  "count": 1
}
```

### Hashtag Management

#### Get Hashtag Suggestions
```http
GET /api/ayrshare/hashtags?keyword=marketing&platform=twitter
```

Retrieves hashtag suggestions based on a keyword and platform.

**Response:**
```json
{
  "success": true,
  "hashtags": ["marketing", "digitalmarketing", "socialmedia"],
  "count": 3
}
```

### Media Management

#### Upload Media
```http
POST /api/ayrshare/media
```

Uploads media files (images/videos) for use in posts.

**Request:** Multipart form data with `file` field

**Response:**
```json
{
  "success": true,
  "mediaUrl": "https://ayrshare.com/media/uploaded_file.jpg",
  "message": "Media uploaded successfully"
}
```

## Frontend Integration

### Scheduling Page Features

The scheduling page (`/dashboard/schedule`) now includes:

1. **Real-time Account Connection**: Connect/disconnect social media accounts
2. **Advanced Post Scheduling**: Schedule posts with media, hashtags, and location
3. **Hashtag Suggestions**: AI-powered hashtag recommendations
4. **Media Upload**: Drag-and-drop media upload functionality
5. **Post Management**: Edit, delete, pause, and resume scheduled posts
6. **Analytics Integration**: View post performance metrics

### Key Components

#### Connected Accounts Section
- Shows all connected social media accounts
- Displays connection status and account details
- Provides quick connect/disconnect functionality

#### Advanced Scheduler
- Multi-platform posting
- Media upload with drag-and-drop
- Hashtag suggestion and selection
- Location tagging
- Optimal timing suggestions

#### Post Management
- List view of all scheduled posts
- Filter by platform
- Bulk actions (pause, resume, delete)
- Real-time status updates

## Error Handling

The integration includes comprehensive error handling:

1. **API Errors**: Graceful fallback to local storage
2. **Network Issues**: Retry mechanisms and offline support
3. **Authentication**: Clear error messages for OAuth failures
4. **Validation**: Input validation for all API calls

## Security Considerations

1. **API Key Protection**: API keys are stored securely in environment variables
2. **OAuth Flow**: Secure OAuth 2.0 implementation for account connections
3. **Data Validation**: All inputs are validated before API calls
4. **Rate Limiting**: Respects Ayrshare API rate limits

## Testing

### Manual Testing Checklist

- [ ] Connect social media accounts
- [ ] Schedule posts with different content types
- [ ] Upload and attach media files
- [ ] Use hashtag suggestions
- [ ] Edit scheduled posts
- [ ] Delete scheduled posts
- [ ] Pause/resume posts
- [ ] View analytics data
- [ ] Test error handling

### API Testing

Use tools like Postman or curl to test the API endpoints:

```bash
# Test account connection
curl -X GET "http://localhost:3000/api/ayrshare/accounts" \
  -H "Authorization: Bearer your-session-token"

# Test post scheduling
curl -X POST "http://localhost:3000/api/ayrshare/posts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-session-token" \
  -d '{
    "platforms": ["twitter"],
    "content": "Test post",
    "scheduledAt": "2024-01-15T10:00:00Z"
  }'
```

## Troubleshooting

### Common Issues

1. **API Key Invalid**: Verify your Ayrshare API key is correct
2. **Account Connection Failed**: Check OAuth redirect URLs
3. **Post Scheduling Failed**: Verify account permissions
4. **Media Upload Issues**: Check file size and format limits

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=ayrshare:*
```

## Future Enhancements

1. **Bulk Operations**: Schedule multiple posts at once
2. **Content Templates**: Pre-defined post templates
3. **Auto-posting**: AI-powered content suggestions
4. **Advanced Analytics**: Detailed performance insights
5. **Team Collaboration**: Multi-user account management

## Support

For issues related to:
- **Ayrshare API**: Contact Ayrshare support
- **Integration**: Check the application logs and error messages
- **Authentication**: Verify OAuth configuration

## Resources

- [Ayrshare API Documentation](https://docs.ayrshare.com/)
- [Ayrshare Dashboard](https://app.ayrshare.com/)
- [OAuth 2.0 Guide](https://oauth.net/2/)
- [Social Media Best Practices](https://blog.ayrshare.com/)
