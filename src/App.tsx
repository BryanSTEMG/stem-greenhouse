import React, { useContext } from 'react';
import { HashRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Header from './components/Header/Header';
import { AuthContext } from './context/AuthContext';

function App(): JSX.Element {
  const { user } = useContext(AuthContext);

  return (
    <HashRouter>
      {user && <Header />}
      <AppRoutes />
    </HashRouter>
  );
}

export default App;
