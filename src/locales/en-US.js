import localeAntd from 'ant-design-vue/lib/locale-provider/en_US'

const messages = {
  topBar: {
    issuesHistory: 'Issues History',
    typeToSearch: 'Start typing to search...',
    actions: 'Actions',
    status: 'Status',
    profileMenu: {
      hello: 'Hello',
      company: 'Company',
      role: 'Role',
      email: 'Email',
      phone: 'Phone',
      editProfile: 'Edit Profile',
      logout: 'Logout',
    },
  },
  dashboard: {
    document: {
      extractions: 'Your extractions',
      upload: 'Upload Documents',
      validate: 'Validate Smelted',
      loading: 'Loading...',
      bulkDownload: 'Bulk Download',
      resetSettings: 'Reset Settings',
      view: 'View',
      remove: 'Remove',
      filterSettings: 'Filter Settings',
      name: 'Name',
      template: 'Template',
      client: 'Client',
      status: 'Status',
      dateAdded: 'Date Added',
      action: 'Action',
      placeholder: {
        name: `Type the Document's name`,
        template: 'Select a Template',
        status: 'Select a Status',
      },
      states: {
        pending: 'Pending',
        smelted: 'Smelted',
        validated: 'Validated',
      },
    },
  },
}

export default {
  locale: 'en-US',
  localeAntd,
  messages,
}
