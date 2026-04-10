// ─── Module Definitions ──────────────────────────────────────────────────────
// Updated with questions derived from Travis Brown's GPT Frameworks

export const MODULES = [
  {
    id: 'mission',
    title: 'Mission Architect',
    subtitle: 'Foundation · Layer 1',
    tagline: 'Why you exist',
    description: 'Craft a clear, simple mission statement that defines your organization\'s purpose and impact.',
    color: '#9B1A30',
    glow: 'rgba(155,26,48,0.25)',
    icon: '◎',
    questions: [
      {
        id: 'purpose',
        label: 'Purpose',
        prompt: 'Let\'s start your **Clarity Pass**. First — **Purpose.**\n\nWhat is the real reason your organization is here? What problem do you exist to solve?',
      },
      {
        id: 'promise',
        label: 'Promise',
        prompt: 'Good. Now — **What We Do.**\n\nWhat is the practical outcome you deliver through your work? What is your promise to the world?',
      },
      {
        id: 'people',
        label: 'People',
        prompt: '**Who We Serve.**\n\nWho is the specific person or group you exist to help?',
      },
      {
        id: 'approach',
        label: 'Approach',
        prompt: '**How We Do It.**\n\nWhat is your unique philosophy or operating standard while doing the work?',
      },
      {
        id: 'impact',
        label: 'Impact',
        prompt: 'Last one — **Our Impact.**\n\nWhat is different in the world because you exist? What changes for people over time?',
      },
    ],
    summaryKeys: ['purpose', 'promise'],
    completionMessage: 'Your Mission is set. This is the foundation of your Operating System.',
  },
  {
    id: 'vision',
    title: 'Vision Architect',
    subtitle: 'Foundation · Layer 2',
    tagline: 'Where you\'re going',
    description: 'Define the 3-5 year picture of your future. A vivid, concrete vision that pulls your team forward.',
    color: '#A8855A',
    glow: 'rgba(168,133,90,0.25)',
    icon: '◈',
    questions: [
      {
        id: 'future_state',
        label: 'Future State',
        prompt: 'Imagine it\'s 3 years from today and everything has gone right. What does the company look like? Describe the scale, reach, and feeling.',
      },
      {
        id: 'big_goal',
        label: 'Big Goal',
        prompt: '**The Big Audacious Goal.**\n\nWhat is the one bold, measurable target that captures your ambition? (e.g., "$10M Revenue" or "10,000 Lives Impacted")',
      },
      {
        id: 'market_position',
        label: 'Market Position',
        prompt: '**Market Reputation.**\n\nWhen people talk about your company in the future, what are the three things you want to be known for?',
      },
      {
        id: 'team_culture',
        label: 'Team & Culture',
        prompt: '**Future Team.**\n\nWhat kind of people are on the journey with you, and what is the "vibe" of your headquarters (physical or digital)?',
      },
    ],
    summaryKeys: ['big_goal', 'future_state'],
    completionMessage: 'Your Vision is articulated. Now we build the strategy to get there.',
  },
  {
    id: 'strategy',
    title: 'Strategy Architect',
    subtitle: 'Execution · Layer 3',
    tagline: 'How you\'ll win',
    description: 'Define your strategic anchors and top priorities to turn your vision into reality.',
    color: '#6D4C8C',
    glow: 'rgba(109,76,140,0.25)',
    icon: '◇',
    questions: [
      {
        id: 'strategic_anchors',
        label: 'Strategic Anchors',
        prompt: 'Let\'s define your **Strategic Anchors**.\n\nWhat are the 2-3 non-negotiable things that must be true for you to win? (e.g. "Premium Experience," "High Speed," "Zero Friction")',
      },
      {
        id: 'priorities',
        label: 'Top Priorities',
        prompt: '**12-Month Focus.**\n\nGiven your anchors, what are the 3 big things that must happen in the next year to stay on track?',
      },
      {
        id: 'advantage',
        label: 'Advantage',
        prompt: '**Your Competitive Edge.**\n\nWhy do clients choose you specifically over everyone else? What is your "unfair" advantage?',
      },
    ],
    summaryKeys: ['strategic_anchors', 'priorities'],
    completionMessage: 'Strategy defined. Next, we ensure the right people are in the right seats to execute.',
  },
  {
    id: 'accountability',
    title: 'Accountability Architect',
    subtitle: 'People · Layer 4',
    tagline: 'Right seats, right outcomes',
    description: 'Build your accountability chart and map clear outcomes for every role in the business.',
    color: '#3B5281',
    glow: 'rgba(59,82,129,0.25)',
    icon: '◐',
    questions: [
      {
        id: 'core_functions',
        label: 'Structure',
        prompt: 'Let\'s build your **Accountability Chart**.\n\nWhat are the core functions of your business? (e.g., Sales, Ops, Finance, Product)',
      },
      {
        id: 'key_outcomes',
        label: 'Roles',
        prompt: '**Key Outcomes.**\n\nFor each function, what is the single most important outcome they are responsible for delivering?',
      },
      {
        id: 'metrics',
        label: 'Metrics',
        prompt: '**Role Success.**\n\nWhat is the "one number" for each role that tells you they are succeeding?',
      },
    ],
    summaryKeys: ['core_functions', 'key_outcomes'],
    completionMessage: 'Accountability chart complete. Now, let\'s look at the framework for execution.',
  },
  {
    id: 'framework',
    title: 'Business Framework',
    subtitle: 'Rhythm · Layer 5',
    tagline: 'Execution & Scoreboards',
    description: 'Establish the scoreboard and meeting rhythm that drives disciplined execution.',
    color: '#4C8C77',
    glow: 'rgba(76,140,119,0.25)',
    icon: '◆',
    questions: [
      {
        id: 'scoreboard',
        label: 'Scoreboard',
        prompt: 'Let\'s build your **Company Scoreboard**.\n\nWhat are the 3-5 high-level metrics that truly define success for the whole organization?',
      },
      {
        id: 'meeting_rhythm',
        label: 'Rhythm',
        prompt: '**Meeting System.**\n\nHow often does your leadership team meet to review the scoreboard? (e.g., Weekly L10, Monthly Review)',
      },
      {
        id: 'commitments',
        label: 'Weekly Commitments',
        prompt: '**Execution Tracking.**\n\nHow do you currently track who is doing what, and by when? What happens when a teammate is stuck?',
      },
    ],
    summaryKeys: ['scoreboard', 'meeting_rhythm'],
    completionMessage: 'Your Operating System is online. You can view the full dashboard now.',
  },
  {
    id: 'values',
    title: 'Values Architect',
    subtitle: 'Culture · Layer 6',
    tagline: 'How you behave',
    description: 'Identify the 3-5 core values that define your culture and guide every decision.',
    color: '#A8855A',
    glow: 'rgba(168,133,90,0.25)',
    icon: '◈',
    comingSoon: true,
  },
];

export const getModule = (id) => MODULES.find(m => m.id === id);

export const getUnlockStatus = (completedIds) => {
  const status = {};
  MODULES.forEach((mod, idx) => {
    if (mod.comingSoon) {
      status[mod.id] = 'coming_soon';
    } else if (completedIds.includes(mod.id)) {
      status[mod.id] = 'complete';
    } else if (idx === 0 || completedIds.includes(MODULES[idx - 1]?.id)) {
      status[mod.id] = 'unlocked';
    } else {
      status[mod.id] = 'locked';
    }
  });
  return status;
};
