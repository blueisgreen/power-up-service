const accountStatus = { enum: ['active', 'suspended', 'canceled', 'archived'] }
const authorStatus = { enum: ['entrusted', 'trusted', 'blocked'] }

const userRefSchema = {
  type: 'object',
  properties: {
    userKey: {
      type: 'string',
      description: 'Public unique key of user',
    },
    alias: {
      type: 'string',
      description: 'How user wants to be known.',
    },
    accountStatus,
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'When user record was created.',
    },
  },
}

const userSchema = {
  type: 'object',
  properties: {
    ...userRefSchema.properties,
    email: {
      type: 'string',
      format: 'email',
      description: 'Verified email address.',
    },
    avatarUrl: {
      type: 'string',
      format: 'uri',
      description: 'URL of image for user.',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      description: 'Time of latest change.',
    },
    termsAcceptedAt: {
      type: 'string',
      format: 'date-time',
      description: 'When user accepted terms of use.',
    },
    cookiesAcceptedAt: {
      type: 'string',
      format: 'date-time',
      description: 'When user agreed to use of cookies.',
    },
    emailCommsAcceptedAt: {
      type: 'string',
      format: 'date-time',
      description: 'When user agreed to receive email from Power Up Magazine.',
    },
  },
}

const userContextSchema = {
  type: 'object',
  properties: {
    userKey: {
      type: 'string',
      description: 'Public unique key of user',
    },
    alias: {
      type: 'string',
      description: 'How user wants to be known.',
    },
    accountStatus,
    penName: {
      type: 'string',
      description: 'Name to use for articles.',
    },
    authorStatus,
    hasRole: {
      type: 'object',
      description: 'Makes it easy to check for roles',
      properties: {
        admin: { type: 'boolean' },
        author: { type: 'boolean' },
        editor: { type: 'boolean' },
        member: { type: 'boolean' },
        moderator: { type: 'boolean' },
        producer: { type: 'boolean' },
        support: { type: 'boolean' },
      },
    },
  },
}

const userUpdateSchema = {
  type: 'object',
  properties: {
    alias: {
      type: 'string',
      description: 'Public identity within Power Up.',
    },
  },
}

const userRoleSchema = {
  type: 'array',
  items: {
    type: 'string',
  },
}

const publicKeyParam = {
  type: 'object',
  properties: {
    userKey: {
      type: 'string',
      description: 'Public unique key of user',
    },
  },
}

const userFilters = {
  type: 'object',
  properties: {
    role: {
      type: 'string',
      description: 'Users having specified role',
    },
    accountStatus,
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
  userRefSchema,
  userSchema,
  userContextSchema,
  userUpdateSchema,
  userRoleSchema,
  publicKeyParam,
  userFilters,
}
