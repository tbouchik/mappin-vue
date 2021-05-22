export const getMenuData = [
  {
    category: true,
    title: 'Tableau de bord',
  },
  {
    title: 'Documents',
    key: 'processedDocuments',
    icon: 'fe fe-file-text',
    url: '/dashboard/documents',
  },
  {
    title: 'Clients',
    key: 'clients',
    icon: 'fe fe-users',
    url: '/dashboard/clients',
  },
  {
    title: 'Templates',
    key: 'filters',
    icon: 'fe fe-layers',
    url: '/dashboard/filters',
  },
  {
    title: 'Archive',
    key: 'archive',
    icon: 'fe fe-archive',
    url: '/dashboard/archive',
  },
  {
    category: true,
    title: 'Actions',
  },
  {
    title: 'Upload Bank Statements',
    key: 'bankupload',
    icon: 'fe fe-upload',
    url: '/smelter/bankupload',
  },
  {
    title: 'Upload Invoices',
    key: 'upload',
    icon: 'fe fe-upload',
    url: '/smelter/upload',
  },
]
