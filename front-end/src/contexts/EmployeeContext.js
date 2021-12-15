import React, { useReducer, createContext } from 'react';

import {
  EMPLOYEE_DETAILS_REQUEST,
  EMPLOYEE_DETAILS_SUCCESS,
  EMPLOYEE_DETAILS_FAILED
} from '../constants/EmployeeConstants';

export const teamContext = createContext();

const employeeDetailsReducer = (state, action) => {
  switch (action.type) {
    case EMPLOYEE_DETAILS_REQUEST:
      return {
        loader: true
      };

    case EMPLOYEE_DETAILS_SUCCESS:
      return {
        loader: false,
        employee: action.payload
      };

    case EMPLOYEE_DETAILS_FAILED:
      return {
        loader: false,
        err: action.payload
      };

    default:
      return state;
  }
};

export function EmployeeProvider(props) {
  const [employee, dispatchEmployeeDetails] = useReducer(employeeDetailsReducer, { employee: {} });

  // useEffect(() => {
  //   localStorage.setItem('teamCreate', JSON.stringify(teamCreate));
  // }, [teamCreate]);

  return (
    <employeeContext.Provider value={{ employee, dispatchEmployeeDetails }}>
      {props.children}
    </employeeContext.Provider>
  );
}