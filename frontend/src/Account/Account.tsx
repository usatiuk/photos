import { Button, Card, FormGroup, H2, InputGroup } from "@blueprintjs/core";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IAppState } from "../redux/reducers";
import { userPassChange } from "../redux/user/actions";

export interface IAccountComponentProps {
    username: string | undefined;
    changePass: (password: string) => void;
}

export function AccountComponent(props: IAccountComponentProps) {
    const [pass, setPass] = React.useState("");

    return (
        <Card className="AuthForm" elevation={2}>
            <form
                onSubmit={(e: React.FormEvent<any>) => {
                    e.preventDefault();
                    if (pass.trim()) {
                        props.changePass(pass);
                    }
                }}
            >
                <div className="header">
                    <H2>Account</H2>
                </div>
                <FormGroup label="Username">
                    <InputGroup
                        name="username"
                        leftIcon="person"
                        disabled={true}
                        value={props.username}
                    />
                </FormGroup>
                <FormGroup label="Password">
                    <InputGroup
                        name="password"
                        type="password"
                        leftIcon="key"
                        value={pass}
                        onChange={(e: React.FormEvent<HTMLInputElement>) =>
                            setPass(e.currentTarget.value)
                        }
                    />
                </FormGroup>
                <div className="footer">
                    <Button
                        className="submit"
                        intent="primary"
                        icon="floppy-disk"
                        type="submit"
                    >
                        Save
                    </Button>
                </div>
            </form>
        </Card>
    );
}

function mapStateToProps(state: IAppState) {
    return { username: state?.user?.user?.username };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        changePass: (password: string) => dispatch(userPassChange(password)),
    };
}

export const Account = connect(
    mapStateToProps,
    mapDispatchToProps,
)(AccountComponent);
