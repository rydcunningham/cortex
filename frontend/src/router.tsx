import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import ExploreLayout from './components/explore/ExploreLayout';
import { ExploreTable } from './components/explore/ExploreTable';
import ExploreGraph from './components/explore/ExploreGraph';
import ExploreEntities from './components/explore/ExploreEntities';
import ExploreConnectome from './components/explore/ExploreConnectome';
import EntitiesLayout from './components/entities/EntitiesLayout';
import EntityList from './components/entities/EntityList';
import AddEntity from './components/entities/AddEntity';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <div>Home Page</div> },
      { path: 'commit', element: <div>Commit Page</div> },
      {
        path: 'explore',
        element: <ExploreLayout />,
        children: [
          { index: true, element: <Navigate to="table" replace /> },
          { path: 'table', element: <ExploreTable /> },
          { path: 'documents', element: <Navigate to="/explore/table" replace /> },
          { path: 'graph', element: <ExploreGraph /> },
          { path: 'topics', element: <Navigate to="/explore/graph" replace /> },
          { path: 'entities', element: <ExploreEntities /> },
          { path: 'connectome', element: <ExploreConnectome /> },
        ],
      },
      {
        path: 'entities',
        element: <EntitiesLayout />,
        children: [
          { index: true, element: <Navigate to="companies" replace /> },
          { path: 'companies', element: <EntityList type="company" /> },
          { path: 'organizations', element: <EntityList type="organization" /> },
          { path: 'people', element: <EntityList type="person" /> },
          { path: 'add', element: <AddEntity /> },
        ],
      },
    ],
  },
]); 