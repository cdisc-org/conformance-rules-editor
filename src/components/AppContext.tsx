import React from "react";
import { AuthService } from "../services/AuthService";
import { APIAuthService } from "../services/APIAuthService";
import { DataService } from "../services/DataService";


export interface IAppError {
  title: string;
  message: string;
  isUncaught: boolean;
}

export interface IAppContext {
  appError: IAppError;
  setError: (title: string, message: string) => void;
  authService: AuthService
  apiAuthService: APIAuthService
  dataService: DataService
}

export const defaultAppContext: IAppContext = {
  appError: null,
  setError: () => { /* Placeholder */ },
  authService: null,
  apiAuthService: null,
  dataService: null,
};


const AppContext = React.createContext<IAppContext>(defaultAppContext);

export default AppContext;