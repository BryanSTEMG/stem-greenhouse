import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

interface PrivateRouteProps {
  children: JSX.Element;
}

const PrivateRoute = ({ children }: PrivateRouteProps): JSX.Element => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (user === null) {
    console.log('PrivateRoute: User is not authenticated, redirecting to /signin');
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  console.log('PrivateRoute: User is authenticated, rendering child component');
  return children;
};

export default PrivateRoute;
