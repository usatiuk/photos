import { shallow } from "enzyme";
import * as React from "react";

import { HomeComponent, IHomeProps } from "../Home";

const defaultHomeProps: IHomeProps = {
    user: { id: 1, username: "test", isAdmin: false },

    darkMode: false,

    logout: jest.fn(),
    dispatchToggleDarkMode: jest.fn(),

    history: { location: { pathname: "/" } } as any,
    location: { pathname: "/" } as any,
    match: {
        params: {
            id: null,
        },
    } as any,
};

describe("<Home />", () => {
    it("should not crash", () => {
        const wrapper = shallow(<HomeComponent {...defaultHomeProps} />);
    });
});
