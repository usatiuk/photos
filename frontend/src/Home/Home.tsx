import "./Home.scss";

import {
    Alignment,
    Breadcrumbs,
    Button,
    Classes,
    IBreadcrumbProps,
    Icon,
    Menu,
    Navbar,
    Popover,
    Spinner,
} from "@blueprintjs/core";
import * as React from "react";
import { connect } from "react-redux";
import { Route, RouteComponentProps, Switch, withRouter } from "react-router";
import { animated, config, Transition } from "react-spring/renderprops";
import { Dispatch } from "redux";
import { IUserJSON } from "../../../src/entity/User";
import { Account } from "../Account/Account";
import { Overview } from "../Photos/Overview";
import { toggleDarkMode } from "../redux/localSettings/actions";
import { IAppState } from "../redux/reducers";
import { logoutUser } from "../redux/user/actions";
import { Photo } from "../Photos/Photo";
import { PhotoRoute } from "../Photos/PhotoRoute";
import { UploadStatus } from "./UploadStatus";

export interface IHomeProps extends RouteComponentProps {
    user: IUserJSON | null;

    darkMode: boolean;

    logout: () => void;
    dispatchToggleDarkMode: () => void;
}

export class HomeComponent extends React.PureComponent<IHomeProps> {
    constructor(props: IHomeProps) {
        super(props);
    }

    public render() {
        const { location } = this.props.history;
        return (
            this.props.user && (
                <div
                    id="mainContainer"
                    className={this.props.darkMode ? Classes.DARK : undefined}
                >
                    <Navbar fixedToTop={true}>
                        <Navbar.Group align={Alignment.LEFT}>
                            <Button
                                minimal={true}
                                onClick={() => this.props.history.push("/")}
                            >
                                Photos
                            </Button>
                            <Navbar.Divider />
                        </Navbar.Group>
                        <Navbar.Group align={Alignment.RIGHT}>
                            <UploadStatus />
                            <Popover
                                target={
                                    <Button id="userButton">
                                        {this.props.user.username}
                                    </Button>
                                }
                                content={this.menu()}
                            />
                        </Navbar.Group>
                    </Navbar>
                    <div id="MainScreen" className="animationWrapper">
                        <Transition
                            native={true}
                            config={{
                                ...config.default,
                                clamp: true,
                                precision: 0.1,
                            }}
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
                                <animated.div
                                    style={style}
                                    className="viewComponent"
                                >
                                    <Switch location={_location}>
                                        <Route
                                            path="/account"
                                            component={Account}
                                        />
                                        <Route
                                            path="/photos/:id"
                                            component={PhotoRoute}
                                        />
                                        <Route path="/" component={Overview} />
                                    </Switch>
                                </animated.div>
                            )}
                        </Transition>
                    </div>
                </div>
            )
        );
    }

    private menu() {
        return (
            <Menu>
                <Menu.Item
                    icon="user"
                    text="Account"
                    onClick={() => this.props.history.push("/account")}
                />
                <Menu.Item
                    icon="log-out"
                    text="Logout"
                    onClick={this.props.logout}
                />
                {this.props.darkMode ? (
                    <Menu.Item
                        icon="flash"
                        text="Light Mode"
                        onClick={this.props.dispatchToggleDarkMode}
                    />
                ) : (
                    <Menu.Item
                        icon="moon"
                        text="Dark Mode"
                        onClick={this.props.dispatchToggleDarkMode}
                    />
                )}
            </Menu>
        );
    }
}

function mapStateToProps(state: IAppState) {
    return {
        user: state.user.user,
        darkMode: state.localSettings.darkMode,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        logout: () => dispatch(logoutUser()),
        dispatchToggleDarkMode: () => dispatch(toggleDarkMode()),
    };
}

export const Home = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(HomeComponent),
);
