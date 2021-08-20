import React, { useContext, useEffect } from "react";
import { MsalProvider, useMsal } from "@azure/msal-react";
import { FORCE_LOGIN } from "../config";
import AppContext from "./AppContext";

const AuthenticationProvider: React.FC = ({ children }: { children:  React.ReactNode }) => {
  const { authService: auth } = useContext(AppContext);

  return (
    <MsalProvider instance={auth.msal}>
      {children}
    </MsalProvider>
  );
};

export const ForceLogin: React.FC = () => {
  const { authService: auth } = useContext(AppContext);
  const { inProgress } = useMsal();

  useEffect(() => {
    if (FORCE_LOGIN && !auth.isAuthenticated() && inProgress === "none") {
      auth.login();
    }
  }, [ inProgress, auth ]);

  return null;
};

export default AuthenticationProvider;