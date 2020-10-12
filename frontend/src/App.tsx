import * as React from "react";
import { Route, RouteComponentProps, Switch, withRouter } from "react-router";
import { AuthScreen } from "~Auth/AuthScreen";
import { requireAuth } from "~Auth/AuthWrapper";
import { Home } from "~Home/Home";

export const AppComponent: React.FunctionComponent<RouteComponentProps> = () => {
    return (
        <Switch>
            <Route path="/signup" component={AuthScreen} />,
            <Route path="/login" component={AuthScreen} />,
            <Route path="/" component={requireAuth(Home)} />,
        </Switch>
    );
};

export const App = withRouter(AppComponent);
