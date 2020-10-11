import * as React from "react";

import { shallow } from "enzyme";
import { OverviewComponent } from "../Overview";

afterEach(() => {
    jest.restoreAllMocks();
});

describe("<Overview />", () => {
    it("should not crash", () => {
        const wrapper = shallow(<OverviewComponent />);
        expect(wrapper.contains("Overview!")).toBeTruthy();
    });
});
