// lib/government/seed.ts
import type { GovernmentNode } from './types'

export const GOVERNMENT_BRANCHES: GovernmentNode[] = [
  {
    id: 'branch-legislative',
    type: 'branch',
    name: 'Legislative Branch',
    description:
      'Responsible for making laws. Includes the House of Representatives and the Senate.',
    jurisdiction: 'United States',
    startDate: '1789-03-04',
  },
  {
    id: 'branch-executive',
    type: 'branch',
    name: 'Executive Branch',
    description:
      'Responsible for enforcing laws. Includes the President, Vice President, and federal agencies.',
    jurisdiction: 'United States',
    startDate: '1789-03-04',
  },
  {
    id: 'branch-judicial',
    type: 'branch',
    name: 'Judicial Branch',
    description:
      'Responsible for interpreting laws. Includes the Supreme Court and lower federal courts.',
    jurisdiction: 'United States',
    startDate: '1789-09-24',
  },
]

export default GOVERNMENT_BRANCHES
