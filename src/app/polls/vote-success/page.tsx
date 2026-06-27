import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface VoteSuccessPageProps {
  searchParams: {
    pollTitle?: string;
    pollId?: string;
  };
}

export default function VoteSuccessPage({ searchParams }: VoteSuccessPageProps) {
  const { pollTitle = 'this poll', pollId } = searchParams;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            {/* Success Animation */}
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <div className="text-6xl mb-4">🎉</div>
            </div>

            {/* Success Message */}
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Vote Submitted Successfully!
            </h1>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Thank you for participating in <strong>{pollTitle}</strong>. 
              Your vote has been recorded and will help shape our community decisions.
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                asChild 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Link href="/polls">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Polls
                </Link>
              </Button>
              
              {pollId && (
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full"
                >
                  <Link href={`/polls/${pollId}`}>
                    View Poll Results
                  </Link>
                </Button>
              )}
              
              <Button 
                asChild 
                variant="outline" 
                className="w-full"
              >
                <Link href="/polls">
                  Browse All Polls
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="ghost" 
                className="w-full text-gray-500"
              >
                <Link href="/">
                  Go to Homepage
                </Link>
              </Button>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Your vote has been securely recorded and is anonymous as requested.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
