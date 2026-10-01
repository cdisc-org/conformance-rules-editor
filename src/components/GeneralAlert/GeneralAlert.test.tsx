import React from "react";
import { render, screen } from "@testing-library/react";
import AppContext, { defaultAppContext } from "../AppContext";
import GeneralAlert, { AlertState } from "./GeneralAlert";

const withAlert = (alertState: AlertState) => (
  <AppContext.Provider
    value={{ ...defaultAppContext, alertState, setAlertState: jest.fn() }}
  >
    <GeneralAlert anchorOrigin={{ vertical: "bottom", horizontal: "center" }} />
  </AppContext.Provider>
);

describe("GeneralAlert", () => {
  it("shows the current alert", () => {
    render(withAlert({ message: "Saved 3 Rules", severity: "success" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Saved 3 Rules");
  });

  it("keeps the last alert while closing instead of flashing an empty error", () => {
    const { rerender } = render(
      withAlert({ message: "Saved 3 Rules", severity: "success" })
    );

    rerender(withAlert(null));

    // The Snackbar is still playing its exit transition at this point.
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Saved 3 Rules");
    expect(alert).toHaveClass("MuiAlert-standardSuccess");
    expect(alert).not.toHaveClass("MuiAlert-standardError");
  });
});
