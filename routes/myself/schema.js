const profileSchema = {
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

const contextSchema = {
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
    accountStatus: {
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

const settingsSchema = {
  type: 'object',
  properties: {
    acceptCookies: {
      type: 'boolean',
      description: 'Indicates when user agrees to our use of cookies.',
    },
    acceptEmailComms: {
      type: 'boolean',
      description: 'Indicates when user agrees to receive email from us.',
    },
  },
}

const profileUpdateSchema = {
  type: 'object',
  properties: {
    alias: {
      type: 'string',
      description: 'Public identity within Power Up.',
    },
  },
}

const authorSchema = {
  type: 'object',
  properties: {
    penName: {
      type: 'string',
      description: 'Name to use on published writing.',
    },
    status: {
      type: 'string',
      description: 'Publishing status of author',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'When user become an author.',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      description: 'Time of latest change.',
    },
  },
}

const authorUpdateSchema = {
  type: 'object',
  properties: {
    penName: {
      type: 'string',
      description: 'Name to use on published writing.',
    },
  },
}

const inquirySchema = {
  type: 'object',
  parameters: {
    id: { type: 'integer' },
    createdAt: { type: 'string', format: 'date-time' },
    articleId: { type: 'string' },
    purpose: { type: 'string' },
    message: { type: 'string' },
  },
}

module.exports = {
  profileSchema,
  contextSchema,
  profileUpdateSchema,
  settingsSchema,
  authorSchema,
  authorUpdateSchema,
  inquirySchema,
}
