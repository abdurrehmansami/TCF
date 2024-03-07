import React from 'react'
import CIcon from '@coreui/icons-react'

const _nav =  [
  {
    _tag: 'CSidebarNavDropdown',
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon name="cil-speedometer" customClasses="c-sidebar-nav-icon"/>,
    _children: [
      {
        _tag: 'CSidebarNavItem',
        name: 'Region',
        to: '/regions',
      },
      {
        _tag: 'CSidebarNavItem',
        name: 'Agency',
        to: '/agencies',
      },
      {
        _tag: 'CSidebarNavItem',
        name: 'Employee',
        to: '/employees',
      },
      
      {
        _tag: 'CSidebarNavItem',
        name: 'EmployeeRanking',
        to: '/employeeranking',
      },

     
      {
        _tag: 'CSidebarNavItem',
        name: 'Teams',
        to: '/teams',
      },
      {
        _tag: 'CSidebarNavItem',
        name: 'Partners',
        to: '/partners',
      },
      {
        _tag: 'CSidebarNavItem',
        name: 'Roles',
        to: '/roles',
      },
      {
        _tag: 'CSidebarNavItem',
        name: 'Contracts',
        to: '/contracts',
      },
      {
        _tag: 'CSidebarNavItem',
        name: 'Call',
        to: '/calls',
      },
      {
        _tag: 'CSidebarNavItem',
        name: 'CRM',
        to: '/crm',
      },
      {
        _tag: 'CSidebarNavItem',
        name: 'Clients',
        to: '/clients',
      },
      {
        _tag: 'CSidebarNavItem',
        name: 'MyProfile',
        to: '/myprofile',
      },
      {
        _tag: 'CSidebarNavItem',
        name: 'Password',
        to: '/changepassword',
      }
    ],
  },
  {
    _tag: 'CSidebarNavDivider',
    className: 'm-2'
  }
]

export default _nav
