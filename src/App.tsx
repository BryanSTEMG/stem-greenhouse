import React, { useContext } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Header from './components/Header/Header';
import { AuthContext } from './context/AuthContext';

function App(): JSX.Element {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      {user && <Header />}
      <AppRoutes />
    </Router>
  );
}

export default App;
