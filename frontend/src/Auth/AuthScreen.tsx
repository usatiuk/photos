import * as React from "react";
import { connect } from "react-redux";
import {
    Redirect,
    Route,
    RouteComponentProps,
    Switch,
    withRouter,
} from "react-router";
import { animated, Transition } from "react-spring/renderprops";
import { IAppState } from "~redux/reducers";

import { Login } from "./Login";
import { Signup } from "./Signup";

interface IAuthScreenProps extends RouteComponentProps {
    loggedIn: boolean;
}

export class AuthScreenComponent extends React.PureComponent<IAuthScreenProps> {
    constructor(props: IAuthScreenProps) {
        super(props);
    }
    public render() {
        const { location } = this.props.history;
        const { from } = this.props.location.state || { from: "/" };
        const { loggedIn } = this.props;
        return loggedIn ? (
            <Redirect to={from} />
        ) : (
            <div className="animationWrapper">
                <Transition
                    native={true}
                    items={location}
                    keys={location.pathname}
                    from={{
                        opacity: 0,
                        transform: "translate3d(-400px,0,0)",
                    }}
                    enter={{
                        opacity: 1,
                        transform: "translate3d(0,0,0)",
                    }}
                    leave={{
                        opacity: 0,
                        transform: "translate3d(400px,0,0)",
                    }}
                >
                    {(_location: any) => (style: any) => (
                        <animated.div style={style}>
                            <Switch location={_location}>
                                <Route path="/login" component={Login} />
                                <Route path="/signup" component={Signup} />
                            </Switch>
                        </animated.div>
                    )}
                </Transition>
            </div>
        );
    }
}

function mapStateToProps(state: IAppState) {
    return { loggedIn: !(state.auth.jwt === null) };
}

export const AuthScreen = withRouter(
    connect(mapStateToProps)(AuthScreenComponent),
);
