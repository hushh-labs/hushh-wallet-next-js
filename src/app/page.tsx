'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardMeta, Progress, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface CardData {
  id: string;
  title: string;
  description: string;
  route: string;
  progress: number;
  completed: boolean;
  lastUpdated?: Date;
}

const getStatusText = (progress: number, completed: boolean, lastUpdated?: Date): string => {
  if (completed) return 'Saved';
  if (progress > 0) return 'In progress';
  return 'Not started';
};

const getStatusIcon = (progress: number, completed: boolean): string => {
  if (completed) return '✓';
  if (progress > 0) return '•';
  return '';
};

const ChevronRight = () => (
  <svg className="w-5 h-5 text-g500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export default function Home() {
  const { user, profile, loading, signInAnonymous } = useAuth();

  useEffect(() => {
    // Auto-sign in anonymously if not already signed in
    if (!user && !loading) {
      signInAnonymous().catch(console.error);
    }
  }, [user, loading, signInAnonymous]);

  if (loading) {
    return (
      <div className="min-h-screen bg-g100 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-pulse">
                <div className="w-8 h-8 bg-g300 rounded-full mx-auto mb-4"></div>
                <p className="text-small text-g600">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-g100 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h1 className="text-h2 mb-4">Welcome to HUSHH ID</h1>
              <p className="text-body mb-6">
                Create your secure, scannable digital profile
              </p>
              <Button onClick={signInAnonymous}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const completion = profile?.completion || {
    identity: { completed: false, progress: 0 },
    networth: { completed: false, progress: 0 },
    food: { completed: false, progress: 0 },
    lifestyle: { completed: false, progress: 0 },
    bodyfit: { completed: false, progress: 0 },
    overall: 0
  };

  const cardData: CardData[] = [
    {
      id: 'identity',
      title: 'Identity',
      description: 'Name, birth, contact',
      route: '/identity',
      progress: completion.identity.progress,
      completed: completion.identity.completed,
      lastUpdated: completion.identity.lastUpdated
    },
    {
      id: 'networth',
      title: 'Net Worth (USD)',
      description: 'Assets & liabilities—approx bhi chalega',
      route: '/networth',
      progress: completion.networth.progress,
      completed: completion.networth.completed,
      lastUpdated: completion.networth.lastUpdated
    },
    {
      id: 'food',
      title: 'Food & Allergies',
      description: 'Diet, likes, aur safety flags',
      route: '/food',
      progress: completion.food.progress,
      completed: completion.food.completed,
      lastUpdated: completion.food.lastUpdated
    },
    {
      id: 'lifestyle',
      title: 'Drinking & Smoking',
      description: 'Habits & preferences (optional)',
      route: '/lifestyle',
      progress: completion.lifestyle.progress,
      completed: completion.lifestyle.completed,
      lastUpdated: completion.lifestyle.lastUpdated
    },
    {
      id: 'bodyfit',
      title: 'Body & Fit',
      description: 'Height, sizes, fit',
      route: '/bodyfit',
      progress: completion.bodyfit.progress,
      completed: completion.bodyfit.completed,
      lastUpdated: completion.bodyfit.lastUpdated
    }
  ];

  const overallProgress = completion.overall;

  return (
    <div className="min-h-screen bg-g100 p-4">
      {/* Header */}
      <div className="max-w-md mx-auto">
        <header className="mb-6 pt-4">
          <h1 className="text-h2 mb-2">Build your HUSHH ID</h1>
          <p className="text-body mb-4">
            Ek secure, scannable profile—jitna chahein utna share karein.
          </p>
          <Progress 
            percentage={overallProgress} 
            label="Profile" 
            className="mb-1"
          />
          {profile?.hushhCard?.hushhUid && (
            <p className="text-tiny text-g500 mt-2">
              ID: {profile.hushhCard.hushhUid.slice(0, 8)}...
            </p>
          )}
        </header>

        {/* Cards Grid */}
        <div className="space-y-4">
          {cardData.map((card) => (
            <Link key={card.id} href={card.route} className="block">
              <Card 
                variant="interactive"
                className={cn(
                  "transition-all duration-200",
                  card.completed && "border-g400",
                  card.progress > 0 && card.progress < 100 && "border-g300"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(card.progress, card.completed) && (
                          <span className={cn(
                            "text-sm font-medium",
                            card.completed ? "text-g700" : "text-g500"
                          )}>
                            {getStatusIcon(card.progress, card.completed)}
                          </span>
                        )}
                        <CardTitle className="text-base font-semibold line-clamp-2">
                          {card.title}
                        </CardTitle>
                      </div>
                      <CardMeta className="line-clamp-1 text-sm">
                        {card.description}
                      </CardMeta>
                      <CardMeta className="text-xs mt-1">
                        {getStatusText(card.progress, card.completed, card.lastUpdated)}
                        {card.progress > 0 && !card.completed && ` • ${card.progress}%`}
                      </CardMeta>
                    </CardHeader>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <ChevronRight />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-4 bg-g200 rounded-lg">
          <p className="text-tiny text-center text-g600">
            Your data. Your call. Revoke anytime.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 space-y-3">
          <Link href="/id" className="block">
            <Card variant="interactive" className="text-center">
              <CardHeader>
                <CardTitle className="text-base">My HUSHH ID</CardTitle>
                <CardMeta>View QR, sharing controls</CardMeta>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
