import React from "react";
import { DataService } from "../services/DataService";


export interface IAppError {
  title: string;
  message: string;
  isUncaught: boolean;
}

export interface IAppContext {
  appError: IAppError;
  setError: (title: string, message: string) => void;
  dataService: DataService
}

export const defaultAppContext: IAppContext = {
  appError: null,
  setError: () => { /* Placeholder */ },
  dataService: null,
};


const AppContext = React.createContext<IAppContext>(defaultAppContext);

export default AppContext;
