import localeAntd from 'ant-design-vue/lib/locale-provider/ru_RU'

const messages = {
  topBar: {
    issuesHistory: 'История заданий',
    typeToSearch: 'Поиск...',
    actions: 'Действия',
    status: 'Статус',
    profileMenu: {
      hello: 'Привет',
      billingPlan: 'Тарифный план',
      role: 'Роль',
      email: 'Емайл',
      phone: 'Телефон',
      editProfile: 'Редактировать профиль',
      logout: 'Выйти',
    },
  },
}

export default {
  locale: 'zh-CN',
  localeAntd,
  messages,
}
