import { FilterChecklistPage } from './../pages/filter-checklist/filter-checklist';
import { FilterDistancePage } from './../pages/filter-distance/filter-distance';
import { FilterProgramPage } from './../pages/filter-program/filter-program';
import { FilterRangePage } from './../pages/filter-range/filter-range';

export const ALPHABET = [
  `A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`,
  `N`, `O`, `P`, `Q`, `R`, `S`, `T`, `U`, `V`, `W`, `X`, `Y`, `Z`
];

export const ALPHA_CATEGORIES = [
  `Majors`,
  `State`
];

export const SEARCH_EMPTY_STATES = {
  addItems: {
    body: `Try searching for something broad, like Math or Nursing, to find items you are interested in.`,
    imagePath: `general/search`,
    title: `Search to find items.`
  },
  noResults: {
    body: `Try searching for something broad, like Math or Nursing, to ensure search results.`,
    imagePath: `general/search`,
    title: `We couldn't find a match.`
  }
};

export const OPTION_FILTER_TYPES = {
  'default': FilterChecklistPage,
  'filter list': FilterChecklistPage,
  'location': FilterDistancePage,
  'max-value': FilterRangePage,
  'search box': FilterProgramPage
};
