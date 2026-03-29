/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  uid: string;
  name: string;
  email: string;
  photo: string;
}

export interface AuditResult {
  id: string;
  type: 'profile' | 'content' | 'duel';
  input: string;
  score: number;
  evidence: string[];
  details: {
    original?: string;
    imposter?: string;
    isAI?: boolean;
    isDuplicate?: boolean;
    bothFake?: boolean;
  };
  timestamp: string;
}
