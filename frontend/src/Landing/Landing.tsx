import { Alignment, Button, Navbar } from "@blueprintjs/core";
import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router";

export function LandingComponent(props: RouteComponentProps) {
    function login() {
        props.history.push("/login");
    }
    return (
        <>
            <Navbar>
                <Navbar.Group align={Alignment.LEFT}>
                    <Navbar.Heading>Photos</Navbar.Heading>
                    <Navbar.Divider />
                </Navbar.Group>
                <Navbar.Group align={Alignment.RIGHT}>
                    <Button icon="log-in" minimal={true} onClick={login}>
                        Login
                    </Button>
                </Navbar.Group>
            </Navbar>
        </>
    );
}

export const Landing = withRouter(LandingComponent);
