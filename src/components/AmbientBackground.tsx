/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface AmbientBackgroundProps {
  imageUrl?: string;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ imageUrl }) => (
  <>
    <div 
      className="ambient-bg" 
      style={imageUrl ? { backgroundImage: `linear-gradient(rgba(253, 245, 230, 0.9), rgba(253, 245, 230, 0.9)), url(${imageUrl})` } : {}} 
    />
    <div className="bg-image-overlay" />
    <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-black/5 rounded-full blur-[120px] animate-float" />
    <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-white/40 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-5s' }} />
  </>
);
