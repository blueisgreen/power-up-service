const userSchema = {
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
    statusKey: {
      type: 'string',
      description: 'Status of the user account.',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'When user record was created.',
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
    statusKey: {
      type: 'string',
      description: 'Status of the user account.',
    },
    penName: {
      type: 'string',
      description: 'How user wants to be known.',
    },
    authorStatus: {
      type: 'string',
      description: 'Status of the user account.',
    },
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

module.exports = {
  userSchema,
  userContextSchema,
}
