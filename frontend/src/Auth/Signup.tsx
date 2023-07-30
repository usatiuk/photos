import "./Auth.scss";

import { Button, Card, FormGroup, H2, InputGroup } from "@blueprintjs/core";
import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router";
import { Dispatch } from "redux";
import { signupStart } from "../redux/auth/actions";
import { IAppState } from "../redux/reducers";

interface ISignupComponentProps extends RouteComponentProps {
    inProgress: boolean;
    error: string | null;
    spinner: boolean;
    signup: (username: string, password: string, email: string) => void;
}

interface ISignupComponentState {
    username: string;
    password: string;
    email: string;
}

export class SignupComponent extends React.PureComponent<
    ISignupComponentProps,
    ISignupComponentState
> {
    constructor(props: ISignupComponentProps) {
        super(props);
        this.submit = this.submit.bind(this);
        this.change = this.change.bind(this);
        this.updateFields = this.updateFields.bind(this);
        this.state = { username: "", password: "", email: "" };
    }

    public change() {
        this.props.history.push("/login");
    }

    public submit<T extends React.FormEvent>(e: T) {
        e.preventDefault();
        const { username, password, email } = this.state;
        if (!this.props.inProgress) {
            this.props.signup(username, password, email);
        }
    }

    public updateFields(e: React.FormEvent<HTMLInputElement>) {
        const { value, name } = e.currentTarget;
        this.setState({ ...this.state, [name]: value });
    }

    public render() {
        return (
            <>
                <Card className="AuthForm" elevation={2}>
                    <form onSubmit={this.submit}>
                        <div className="header">
                            <H2>Signup</H2>
                            <Button
                                icon="log-in"
                                minimal={true}
                                onClick={this.change}
                                className="change"
                            >
                                Login
                            </Button>
                        </div>
                        <FormGroup label="Username">
                            <InputGroup
                                name="username"
                                value={this.state.username}
                                onChange={this.updateFields}
                                leftIcon="person"
                            />
                        </FormGroup>
                        <FormGroup label="Email">
                            <InputGroup
                                name="email"
                                value={this.state.email}
                                onChange={this.updateFields}
                                type="email"
                                leftIcon="envelope"
                            />
                        </FormGroup>
                        <FormGroup label="Password">
                            <InputGroup
                                name="password"
                                value={this.state.password}
                                onChange={this.updateFields}
                                type="password"
                                leftIcon="key"
                            />
                        </FormGroup>

                        <div className="footer">
                            <div id="error">{this.props.error}</div>
                            <Button
                                loading={this.props.spinner}
                                icon="new-person"
                                className="submit"
                                intent="primary"
                                type="submit"
                                onClick={this.submit}
                                disabled={this.props.spinner}
                            >
                                Signup
                            </Button>
                        </div>
                    </form>
                </Card>
            </>
        );
    }
}

function mapStateToProps(state: IAppState) {
    return {
        inProgress: state.auth.inProgress,
        error: state.auth.formError,
        spinner: state.auth.formSpinner,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        signup: (username: string, password: string, email: string) =>
            dispatch(signupStart(username, password, email)),
    };
}

export const Signup = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(SignupComponent),
);
