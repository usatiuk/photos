import * as React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import { webRoot } from "~env";
import { IAppState } from "~redux/reducers";

interface IAuthWrapperComponentProps {
    loggedIn: boolean;
}

export const AuthWrapperComponent: React.FunctionComponent<IAuthWrapperComponentProps> = (
    props,
) => {
    if (!props.children) {
        return <Redirect to={webRoot} />;
    }
    if (props.loggedIn) {
        return <div>{props.children}</div>;
    } else {
        return <Redirect to={"/login"} />;
    }
};

function mapStateToProps(state: IAppState): IAuthWrapperComponentProps {
    return { loggedIn: state.auth.jwt !== null };
}

export const AuthWrapper = connect(mapStateToProps)(AuthWrapperComponent);

export function requireAuth(Component: React.ComponentType): () => JSX.Element {
    const wrapped = () => {
        return (
            <AuthWrapper>
                <Component />
            </AuthWrapper>
        );
    };
    return wrapped;
}
