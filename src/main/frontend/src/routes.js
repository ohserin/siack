import React from 'react';
import Home from './pages/Home';
import Login from './pages/users/Login.jsx';
import Join from './pages/users/Join.jsx';
import Contact from './pages/Contact.jsx';
import UserSettingsPage from './pages/users/settings/UserSettingsPage.jsx';
import DeletedAccount from './pages/users/DeletedAccount.jsx';
import { CreateWorkspace } from './pages/workspace';
import { Workspace } from './pages/workspace';
import { JoinWorkspace } from './pages/workspace';

const routes = [
  { path: '/', element: React.createElement(Home) },
  { path: '/join', element: React.createElement(Join) },
  { path: '/login', element: React.createElement(Login) },
  { path: '/contact', element: React.createElement(Contact) },
  { path: '/user-setting', element: React.createElement(UserSettingsPage) },
  { path: '/account-deleted', element: React.createElement(DeletedAccount) },
  { path: '/workspace/create', element: React.createElement(CreateWorkspace) },
  { path: '/workspace/room/:roomId', element: React.createElement(Workspace) },
  { path: '/workspace/join', element: React.createElement(JoinWorkspace) },
];

export default routes;
