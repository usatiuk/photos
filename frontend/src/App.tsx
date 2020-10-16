import * as React from "react";
import { Route, RouteComponentProps, Switch, withRouter } from "react-router";
import { AuthScreen } from "~Auth/AuthScreen";
import { requireAuth } from "~Auth/AuthWrapper";
import { Home } from "~Home/Home";

// Somehow, if we do it like this then App doesn't rerender every time
// the route changes, and animations work
const protectedHome = requireAuth(Home);

export const AppComponent: React.FunctionComponent<RouteComponentProps> = () => {
    return (
        <Switch>
            <Route path="/signup" component={AuthScreen} />,
            <Route path="/login" component={AuthScreen} />,
            <Route path="/" component={protectedHome} />,
        </Switch>
    );
};

export const App = withRouter(AppComponent);
