import React, { useState } from "react";
import { DataService } from "../services/DataService";
import AppContext,  { IAppError } from "./AppContext";

const AppContextProvider: React.FC = ({ children }: { children: React.ReactNode }) => {
    const [ dataService ] = useState<DataService>(() => new DataService());
    const [ appError, setAppError ] = useState<IAppError>();

    const clearError = () => appError ? setAppError(null) : undefined;

    const setError = (title: string, message: string, isUncaught = false) => {
    if (!appError || (appError && (title !== appError.title || message !== appError.message))) {
      setAppError({
        title, message, isUncaught
      });
    }
  }

    const appContext = {
         appError, clearError, setError, dataService
    };

    return (
      <AppContext.Provider value={appContext}>
        {children}
      </AppContext.Provider>
    )
  }

  export default AppContextProvider;
  