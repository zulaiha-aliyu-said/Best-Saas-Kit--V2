import RedeemForm from './RedeemForm';
import { Gift } from 'lucide-react';

export const metadata = {
  title: 'Redeem Your LTD Code | repurposely',
};

export default function RedeemPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 mb-4">
            <Gift className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Redeem Your LTD Code
          </h1>
          <p className="text-lg text-muted-foreground">
            Unlock lifetime access to repurposely
          </p>
        </div>
        <RedeemForm />
      </div>
    </div>
  );
}
