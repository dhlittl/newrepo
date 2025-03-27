// constants/itunesMedia.js - Media type and entity options for iTunes API

export const MEDIA_TYPES = [
    { value: 'all', label: 'All Types' },
    { value: 'movie', label: 'Movies' },
    { value: 'podcast', label: 'Podcasts' },
    { value: 'music', label: 'Music' },
    { value: 'musicVideo', label: 'Music Videos' },
    { value: 'audiobook', label: 'Audiobooks' },
    { value: 'shortFilm', label: 'Short Films' },
    { value: 'tvShow', label: 'TV Shows' },
    { value: 'software', label: 'Software' },
    { value: 'ebook', label: 'eBooks' }
  ];
  
  export const ENTITY_OPTIONS = {
    movie: [
      { value: 'movieArtist', label: 'Movie Artist' },
      { value: 'movie', label: 'Movie' }
    ],
    podcast: [
      { value: 'podcastAuthor', label: 'Podcast Author' },
      { value: 'podcast', label: 'Podcast' }
    ],
    music: [
      { value: 'musicArtist', label: 'Music Artist' },
      { value: 'musicTrack', label: 'Song' },
      { value: 'album', label: 'Album' },
      { value: 'musicVideo', label: 'Music Video' },
      { value: 'mix', label: 'Mix' }
    ],
    audiobook: [
      { value: 'audiobookAuthor', label: 'Audiobook Author' },
      { value: 'audiobook', label: 'Audiobook' }
    ],
    tvShow: [
      { value: 'tvEpisode', label: 'TV Episode' },
      { value: 'tvSeason', label: 'TV Season' }
    ],
    software: [
      { value: 'software', label: 'Software' },
      { value: 'iPadSoftware', label: 'iPad App' },
      { value: 'macSoftware', label: 'Mac App' }
    ],
    ebook: [
      { value: 'ebook', label: 'eBook' }
    ]
  };
  
  export const SORT_OPTIONS = [
    { value: 'default', label: 'Default Sort' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A-Z' },
    { value: 'name-desc', label: 'Name: Z-A' },
    { value: 'date-newest', label: 'Release Date: Newest First' },
    { value: 'date-oldest', label: 'Release Date: Oldest First' }
  ];