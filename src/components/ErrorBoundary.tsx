/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  error: Error;
  reset: () => void;
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ error, reset }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
    <div className="glass p-10 rounded-[2.5rem] max-w-md w-full">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
      <h2 className="text-2xl font-display font-bold mb-4 text-black">System Error</h2>
      <p className="text-black/60 mb-8">
        {error.message}
      </p>
      <button 
        onClick={reset}
        className="w-full py-4 rounded-2xl bg-black text-white font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        Restart System
      </button>
    </div>
  </div>
);
