const actionSchema = {
  type: 'object',
  properties: {
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'When action record created.',
    },
    actionCode: {
      type: 'string',
      description: 'Type of action.',
    },
    userKey: {
      type: 'string',
      description: 'Public key of the actor.',
    },
    details: {
      type: 'string',
      description: 'Details of the action.',
    },
  },
}

const postActionBody = {
  type: 'object',
  properties: {
    actionCode: {
      type: 'string',
      description: 'Type of action.',
    },
    details: {
      type: 'string',
      description: 'Details of the action.',
    },
  },
}

const actionFilters = {
  type: 'object',
  properties: {
    start: {},
    end: {},
    user: {},
    action: {},
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
  actionSchema,
  postActionBody,
  actionFilters,
}
