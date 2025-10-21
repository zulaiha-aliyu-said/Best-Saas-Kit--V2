import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Mock data for caption templates - in a real app, this would come from a database
    const mockTemplates = [
      { 
        id: 'temp1', 
        name: 'Product Launch', 
        content: '🚀 Excited to announce our new product! Check out the features and benefits. #launch #innovation #newproduct' 
      },
      { 
        id: 'temp2', 
        name: 'Behind the Scenes', 
        content: 'Go behind the scenes with us! See how we bring our ideas to life. #bts #makingof #creativeprocess' 
      },
      { 
        id: 'temp3', 
        name: 'Engagement Question', 
        content: 'What\'s your favorite [industry term]? Share your thoughts below! 👇 #question #community #discussion' 
      },
      { 
        id: 'temp4', 
        name: 'Tip of the Day', 
        content: '💡 Quick tip: [Your tip here]. Boost your [area] today! #tipoftheday #advice #productivity' 
      },
      { 
        id: 'temp5', 
        name: 'Event Promotion', 
        content: 'Join us for our upcoming [Event Name] on [Date]! Register now to secure your spot. Link in bio! #event #webinar #conference' 
      },
      { 
        id: 'temp6', 
        name: 'Motivational Monday', 
        content: 'Start your week with motivation! Remember: [motivational message]. What are you working on this week? #motivationmonday #goals #inspiration' 
      },
      { 
        id: 'temp7', 
        name: 'Thank You Post', 
        content: 'Thank you to our amazing community! Your support means everything to us. 🙏 #gratitude #community #thankyou' 
      },
      { 
        id: 'temp8', 
        name: 'Industry Insight', 
        content: 'Interesting fact about [industry]: [insight]. What do you think about this trend? #industryinsights #trends #knowledge' 
      }
    ];

    return NextResponse.json({
      success: true,
      templates: mockTemplates
    });

  } catch (error) {
    console.error('Error loading caption templates:', error);
    return NextResponse.json(
      { error: 'Failed to load caption templates' },
      { status: 500 }
    );
  }
}