export const COLLEGE_NON_PROFIT_QUERY = `&sector=1&sector=2&sector=4&sector=5`;

export const COLLEGE_TILES: any[] = [
  {
    colSpan: 4,
    isLocked: true,
    name: `Saved`,
    order: 0,
    serviceVariable: `savedColleges$`
  },
  {
    colSpan: 4,
    isLocked: true,
    name: `Recommended`,
    order: 1,
    serviceVariable: `recommendations$`
  },
  {
    colSpan: 4,
    isLocked: true,
    name: `Matching`,
    order: 2,
    serviceVariable: `matchingColleges$`,
    stakeholder_type: `Student`
  },
  {
    colSpan: 6,
    filter: COLLEGE_NON_PROFIT_QUERY,
    isLocked: true,
    name: `Search All`,
    order: 3,
    serviceVariable: `all$`
  },
  {
    colSpan: 6,
    inverse: true,
    isLocked: true,
    name: `Create Your Own List!`,
    order: 4
  },
  {
    colSpan: 4,
    filter: COLLEGE_NON_PROFIT_QUERY,
    isLocked: false,
    name: `Top Colleges`,
    order: 5,
    serviceVariable: `all$`
  },
  {
    colSpan: 4,
    filter: COLLEGE_NON_PROFIT_QUERY,
    isLocked: false,
    name: `Near You`,
    order: 6,
    serviceVariable: `nearbyColleges$`
  },
  {
    colSpan: 4,
    filter: COLLEGE_NON_PROFIT_QUERY,
    isLocked: false,
    name: `Great Value`,
    order: 7,
    serviceVariable: `all$`
  },
  {
    colSpan: 4,
    filter: COLLEGE_NON_PROFIT_QUERY,
    isLocked: false,
    name: `Balanced Life`,
    order: 8,
    serviceVariable: `all$`
  }
];

const createListImages = [
  `college/tile-custom_create.svg`,
  `college/tile-custom_camera.svg`,
  `college/tile-custom_planet.svg`,
  `college/tile-custom_lightbulb.svg`,
  `college/tile-custom_drama.svg`,
  `college/tile-custom_sunshine.svg`,
  `college/tile-custom_stars.svg`,
  `college/tile-custom_gaming.svg`,
  `college/tile-custom_drafting.svg`,
  `college/tile-custom_pizza.svg`,
  `contact/website.svg`,
  `college/detail_airport.svg`,
  `college/tile-custom_location.svg`,
  `college/detail_pre-law.svg`,
  `college/setting_rural.svg`,
  `college/setting_suburb.svg`,
  `college/setting_town.svg`,
  `college/setting_city.svg`
];
export const CREATE_LIST_IMAGES = createListImages.map(img => `assets/image/${img}`);

export const DETAIL_TOOLTIPS = {
  debt: `The median annual loan payment amount, based on the median of the student loan debt incurred
     by students who graduated in 2011-2015`,
  earnings: `Mean 2014-2015 annual earnings of students who graduated in 2011-2015`,
  income: `Median 2014 earnings of students who were born from 1980-1984 \n(graduated in 2002-2004)`,
  lowIncome: `Percent of admitted student’s parents who were in the lowest quintile, i.e. bottom 20%,
    of the income distribution`,
  mobility: `Percent of students who had parents in the Bottom 20% of the income distribution and
    reached the Top 20% of the income distribution 15 years after graduation`,
  ratio: `Average Annual Earnings divided by Average Annual Debt Payment`
};

export const EMPTY_STATES = {
  Default: {
    body: `Try searching for something broad, like Chicago, or filter by Setting to ensure search results.`,
    title: `We couldn't find a match.`
  },
  Matching: {
    body: `Matching colleges are based on your profile. For better results, complete more sections of your profile`,
    title: `You don't have any matching colleges.`
  },
  Recommended: {
    Parent: {
      body: `Reach out to your connections and help in their search to find the right college`, // TODO
      title: `You haven't recommended any colleges.`
    },
    Student: {
      body: `Reach out to your connections and ask for their help in your search to find the right college`,
      title: `You don't have any recommendations.`
    }
  },
  Saved: {
    body: `With over 3,500 colleges on NextTier, there must be something worth saving!`,
    title: `You haven't saved any colleges.`
  }
};
