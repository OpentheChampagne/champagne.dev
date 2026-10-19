/** A headline number for a case study. With `before`, it also draws a two-bar chart (labelled by `compare`, default Before/After) and counts from it. */
export type CaseStat = { value: number; label: string; prefix?: string; suffix?: string; decimals?: number; before?: number; compare?: [string, string]; note?: string };

export const caseStudies = [
  {
    id: 'adweek-homepage', beforeImage: '/assets/adweek-homepage-before.png', beforeSource: 'https://archive.is/Q9Ihu', title: 'ADWEEK.com homepage',
    description: 'A fresh front page for ADWEEK, built to move with the newsroom and keep readers exploring.',
    context: [
      'The homepage is ADWEEK’s front door. It brings breaking news, featured stories, video, and sponsored content into one editorial experience.',
      'Editors reshape it throughout the day, so the layout has to hold up whatever lands in each slot: a long headline, a story without art, an ad that doesn’t fill. And it has to stay fast while it does.',
    ],
    contribution: [
      'I rebuilt the homepage in React around reusable modules that editors can arrange as the news changes. Story feeds, video, events, navigation, and advertising all had to feel like parts of the same page. The new homepage launched in June 2025.',
      'The work continued after launch. I reworked The Latest block, fixed caching, and optimized queries to make the page faster behind the scenes. The 95th-percentile server response time dropped from 3.25 seconds to 0.95 seconds, bringing 95% of responses under a second.',
      'In the first full summer after launch, the homepage saw 68% more views and 81% more engaged minutes year over year. Those July–August 2025 figures compared with 11% growth in views across the site.',
    ],
    image: '/assets/adweek-homepage.webp', imageAlt: 'ADWEEK homepage with its vertical wordmark and featured editorial stories',
    caption: 'The live homepage. Headlines change with the news.',
    url: 'https://www.adweek.com/', theme: 'home',
    stats: [
      { value: 68, prefix: '+', suffix: '%', label: 'Homepage views, year over year', note: 'July–August 2025 vs. 2024. The site overall grew 11%.' },
      { value: 81, prefix: '+', suffix: '%', label: 'Homepage engaged minutes', note: 'Same period, year over year.' },
      { value: 6.9, before: 4.6, decimals: 1, suffix: '%', compare: ['2024', '2025'], label: 'Share of all site views', note: 'July–August.' },
      { value: 0.95, before: 3.25, decimals: 2, suffix: 's', label: '95th-percentile response time', note: 'Origin response time, before and after the performance improvements.' },
    ] as CaseStat[],
  },
  {
    id: 'adweek-live', motionMedia: [
      { src: '/assets/adweek-live-motion.gif', still: '/assets/adweek-live-motion-poster.jpg', alt: 'Live-blog cards wave as updates arrive and the timeline pulses', caption: 'Live-blog motion recorded during development, using sample text.' },
    ], title: 'Super Bowl live blog',
    description: 'Keeping readers close to the action on one of ADWEEK’s biggest nights.',
    context: [
      'For an advertising publication, the Super Bowl is the biggest night of the year. The ads are the story, and readers want the reaction as it happens.',
      'The live blog brings the newsroom’s reactions and coverage into a single running feed as the game unfolds, so readers can stay on one page for the whole night.',
    ],
    contribution: [
      'I helped build the live blog and its homepage widget for ADWEEK’s Super Bowl 2026 coverage. The widget brought readers into the feed as the newsroom posted updates. We shipped on a deadline that kickoff doesn’t move.',
      'I wanted new coverage to feel like an arrival. My work included a wave through the update cards and a pulse along the timeline, giving readers a small visual cue to what had just changed.',
      'Across 26 newsroom updates, the live blog gave readers a reason to keep coming back. It recorded 95% more views and 128% more readers than the previous year’s live blog, with engaged time at 1.56 times the site average.',
    ],
    video: '/assets/adweek-live-motion.mp4', poster: '/assets/adweek-live-motion-poster.jpg',
    image: '/assets/adweek-liveblog.webp', imageAlt: 'ADWEEK Super Bowl LX Live Blog page',
    caption: 'Super Bowl LX live blog on ADWEEK.com.',
    url: 'https://www.adweek.com/brand-marketing/super-bowl-lx-live-blog/', theme: 'live',
    stats: [
      { value: 95, prefix: '+', suffix: '%', label: 'Views vs. last year', note: 'Super Bowl LX live blog vs. LIX.' },
      { value: 128, prefix: '+', suffix: '%', label: 'Readers vs. last year' },
      { value: 1.56, before: 1, decimals: 2, suffix: '×', compare: ['Site average', 'Live blog'], label: 'Engaged time vs. site average' },
    ] as CaseStat[],
  },
  {
    id: 'adweek-edo', title: 'ADWEEK × EDO',
    description: 'Giving Super Bowl ad rankings a clearer home—and addressing the bug that had taken the site down.',
    context: [
      'Every Super Bowl ad gets judged the morning after. EDO’s TV Outcomes rankings add data to that conversation, measuring which spots actually drove consumer engagement.',
      'The year before I took over, scrolling the page could trigger thousands of video requests from a single visitor. A React bug was causing the component to re-render on every scroll. With a Super Bowl audience, those repeated requests were enough to take the site down.',
    ],
    contribution: [
      'I started with the rendering bug behind that request flood, then made sure the page could reuse work it had already done. That meant caching both the generated markup and the data coming from EDO.',
      'PHP generates the markup used by the React component, so I cached that output on the server. I also cached the file fetched from EDO’s partner API. Together, those changes let requests share the prepared markup and partner data instead of rebuilding and fetching them each time.',
      'With that foundation in place, I redesigned the rankings page for Super Bowl 2026 and connected it to the wider coverage through the Super Bowl hub. Readers spent 1.8 times as long on the page as the site average.',
    ],
    image: '', imageAlt: '', caption: '',
    url: 'https://www.adweek.com/brand-marketing/the-top-ads-of-super-bowl-lx/', theme: 'edo',
    stats: [
      { value: 1.8, before: 1, decimals: 1, suffix: '×', compare: ['Site average', 'EDO page'], label: 'Engaged time vs. site average' },
    ] as CaseStat[],
  },
];
