import { IListTile } from '@nte/interfaces/list-tile.interface';

const dir = `assets/image`;

export const SCHOLARSHIP_TILES: IListTile[] = [
  {
    colSpan: 4,
    iconUrl: `${dir}/college/tile_saved.svg`,
    isLocked: true,
    name: `Saved`,
    order: 0,
    serviceVariable: `saved$`
  },
  {
    colSpan: 4,
    iconUrl: `${dir}/college/tile_recommended.svg`,
    isLocked: true,
    name: `Recommended`,
    order: 1,
    serviceVariable: `recommended$`
  },
  {
    colSpan: 4,
    iconUrl: `${dir}/scholarship/tile_applying.svg`,
    isLocked: true,
    name: `Applying`,
    order: 2,
    phase: `Senior`,
    serviceVariable: `applying$`
  },
  {
    colSpan: 6,
    iconUrl: `${dir}/scholarship/tile_search.svg`,
    isLocked: true,
    name: `Search All`,
    order: 3,
    serviceVariable: `scholarships$`
  },
  {
    colSpan: 6,
    iconUrl: `${dir}/college/tile_create.svg`,
    inverse: true,
    isLocked: true,
    name: `Create Your Own List!`,
    order: 4,
    serviceVariable: null
  }
];

export const ENROLLMENT_LEVEL_ORDER = {
  'College freshman': 4,
  'College junior': 6,
  'College senior': 7,
  'College sophomore': 5,
  'Doctoral-level study': 9,
  'High school freshman': 0,
  'High school junior': 2,
  'High school senior': 3,
  'High school sophomore': 1,
  'Master\'s-level study': 8,
  'Not currently enrolled': -1,
  'Other postgraduate-level study': 10
};

export const SCHOLARSHIP_FILTERS = [
  {
    name: `Demographic`,
    subCategories: [
      {
        displayName: `Ethnicity`,
        options: [],
        queryName: `race`
      },
      {
        displayName: `Religion`,
        options: [],
        queryName: `religion`
      },
      {
        displayName: `Location`,
        options: [],
        queryName: `state`
      }
    ]
  },
  {
    name: `Extracurricular`,
    subCategories: [
      {
        displayName: `Interests`,
        options: [],
        queryName: `interest`
      },
      {
        displayName: `Sports`,
        options: [],
        queryName: `sport`
      }
    ]
  },
  {
    name: `Academic`,
    subCategories: [
      {
        displayName: `Majors`,
        options: [],
        queryName: `major`,
        type_settings: {
          type: {
            name: `search box`
          }
        }
      },
      {
        displayName: `Institutions`,
        options: [{
          id: `none`,
          value: `None`
        }],
        queryName: `institution`,
        type_settings: {
          type: {
            name: `default`
          }
        }
      },
      {
        config: {
          max: 4,
          min: 0,
          step: 0.5,
          valueType: `GPA`
        },
        displayName: `GPA`,
        queryName: `max_gpa`,
        type_settings: {
          type: {
            name: `max-value`
          }
        }
      }
    ]
  },
  {
    config: {
      max: 60000,
      min: 0
    },
    displayName: `Award Amount`,
    queryName: `award_amount_min`,
    type_settings: {
      type: {
        name: `max-value`
      }
    }
  }
];

export const EMPTY_STATES = {
  Applying: {
    body: `With over 23,000 scholarships on NextTier, there must be something worth applying to!`,
    imagePath: `task/tile_all`,
    title: `You haven't indicated that you're applying to any scholarships.`
  },
  Recommended: {
    body: `Reach out to your connections and ask for their help in your search to find the right scholarship!`,
    imagePath: `college/tile_recommended`,
    title: `You don't have any recommendations.`
  },
  Saved: {
    body: `With over 23,000 scholarships on NextTier, there must be something worth saving!`,
    imagePath: `college/tile_saved`,
    title: `You haven't saved any scholarships.`
  },
  'Search All': {
    body: `Try searching for something broad like Writing or filter by Interests to ensure search results.`,
    imagePath: `general/search`,
    title: `We couldn't find a match.`
  }
};
