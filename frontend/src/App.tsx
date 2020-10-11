import * as React from "react";
import { connect } from "react-redux";
import {
    Redirect,
    Route,
    RouteComponentProps,
    Switch,
    withRouter,
} from "react-router";
import { AuthScreen } from "~Auth/AuthScreen";
import { Home } from "~Home/Home";
import { Landing } from "~Landing/Landing";
import { IAppState } from "~redux/reducers";

interface IAppComponentProps extends RouteComponentProps {
    loggedIn: boolean;
}

export function AppComponent(props: IAppComponentProps) {
    const { loggedIn } = props;
    return loggedIn ? (
        <Switch>
            <Route path="/signup" component={AuthScreen} />,
            <Route path="/login" component={AuthScreen} />,
            <Route path="/docs/:id" component={Home} />,
            <Route path="/" component={Home} />,
        </Switch>
    ) : (
        <Switch>
            <Route path="/signup" component={AuthScreen} />
            <Route path="/login" component={AuthScreen} />
            <Route exact={true} path="/" component={Landing} />
            <Route path="/" component={() => <Redirect to="/login" />} />
        </Switch>
    );
}

function mapStateToProps(state: IAppState) {
    return { loggedIn: state.auth.jwt !== null };
}

export const App = withRouter(connect(mapStateToProps)(AppComponent));
