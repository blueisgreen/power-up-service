const articleCover = {
  type: 'object',
  required: ['articleKey', 'headline'],
  properties: {
    articleKey: {
      type: 'string',
      description: 'Unique identifier for the article.',
    },
    headline: {
      type: 'string',
      description: 'Description that draws readers attention.',
    },
    byline: {
      type: 'string',
      description: 'Who gets credit for writing the article.',
    },
    synopsis: {
      type: 'string',
      description: 'Brief summary of what the article is about.',
    },
    coverArtUrl: {
      type: 'string',
      format: 'uri',
      description: 'Where to find the cover art.',
    },
    publishedAt: {
      type: 'string',
      format: 'date-time',
      description: 'When the article became generally available to readers.',
    },
  },
}

const articleContent = {
  type: 'object',
  properties: {
    articleKey: {
      type: 'string',
      description: 'Unique identifier for the article.',
    },
    content: {
      type: 'string',
      description: 'The content of the article (usually quite large).',
    },
  },
}

const articleAllMeta = {
  type: 'object',
  properties: {
    ...articleCover.properties,
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'When the article was created.',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      description: 'When the article was last modified.',
    },
    archivedAt: {
      type: 'string',
      format: 'date-time',
      description: 'When the article was removed from public view.',
    },
    requestedToPublishAt: {
      type: 'string',
      format: 'date-time',
      description: 'When an untrusted author last tried to publish.',
    },
  },
}

const articleAll = {
  type: 'object',
  properties: {
    ...articleAllMeta.properties,
    ...articleContent.properties,
  },
}

const articleAllPublic = {
  type: 'object',
  properties: {
    ...articleCover.properties,
    ...articleContent.properties,
  },
}

const articleNewIn = {
  type: 'object',
  required: ['headline'],
  properties: {
    headline: {
      type: 'string',
      description: 'Description that draws readers attention.',
    },
    byline: {
      type: 'string',
      description: 'Who gets credit for writing the article.',
    },
    synopsis: {
      type: 'string',
      description: 'Brief summary of what the article is about.',
    },
  },
}

const articleUpdateIn = {
  type: 'object',
  properties: {
    ...articleNewIn.properties,
    content: {
      type: 'string',
      description: 'The content of the article (usually quite large).',
    },
  },
}

const articleDenialIn = {
  type: 'object',
  properties: {
    message: {
      type: 'string',
      description: 'Explanation of reason for denying request to publish.',
    },
  },
}

const publicKeyParam = {
  type: 'object',
  properties: {
    articleKey: { type: 'string' },
  },
}

const articleActionParams = {
  type: 'object',
  properties: {
    articleKey: { type: 'string' },
    action: { enum: ['publish', 'retract', 'archive', 'revive'] },
  },
}

const articleFilters = {
  type: 'object',
  properties: {
    status: { enum: ['pending', 'published', 'archived'] },
    limit: {
      type: 'integer',
      description: 'Maximum number of results to return.',
      minimum: 0,
    },
    offset: {
      type: 'integer',
      description:
        'Number of results to skip over; combine with limit for paging.',
      minimum: 0,
    },
  },
}

module.exports = {
  articleCover,
  articleContent,
  articleAllMeta,
  articleAll,
  articleAllPublic,
  articleNewIn,
  articleUpdateIn,
  articleDenialIn,
  publicKeyParam,
  articleActionParams,
  articleFilters,
}
