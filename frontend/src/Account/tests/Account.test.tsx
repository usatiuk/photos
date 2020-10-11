import * as React from "react";

import { shallow } from "enzyme";
import { AccountComponent } from "../Account";

describe("<Account />", () => {
    it("should not crash", () => {
        const wrapper = shallow(
            <AccountComponent
                username="user"
                changePass={(pass: string) => {
                    return null;
                }}
            />,
        );
    });
});
