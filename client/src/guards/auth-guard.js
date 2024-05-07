import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useAuthContext } from "src/contexts/auth-context";

export const AuthGuard = (props) => {
  const { children, requiredPermissions, allowedUserTypes } = props;
  const router = useRouter();
  const { isAuthenticated, user } = useAuthContext();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let isMounted = true;
  
    const checkAccess = async () => {
      if (!isAuthenticated) {
        console.log("Not authenticated, redirecting");
        redirectToLogin();
      } else if (
        (!user) ||  // Check if user or user permissions are not available
        (allowedUserTypes && !isUserTypeAllowed(user, allowedUserTypes))
      ) {
        console.log("Unauthorized, redirecting");
        redirectToUnauthorized();
      } else {
        if (isMounted) {
          setChecked(true);
        }
      }
    };
  
    if (isAuthenticated) {
      checkAccess();
    }
  
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user, requiredPermissions, allowedUserTypes]);  

  const redirectToLogin = () => {
    router
      .replace({
        pathname: "/auth/login",
        query: router.asPath !== "/" ? { continueUrl: router.asPath } : undefined,
      })
      .catch(console.error);
  };

  const redirectToUnauthorized = () => {
    router.replace("/404").catch(console.error);
  };

  const isUserTypeAllowed = (user, allowedUserTypes) => {
    const userType = user?.userType || {};
    const userTypeName = userType.name || '';
    return allowedUserTypes.includes(userTypeName);
  };

  if (!checked) {
    return null;
  }

  return children;
};

AuthGuard.propTypes = {
  children: PropTypes.node,
  allowedUserTypes: PropTypes.array
};
