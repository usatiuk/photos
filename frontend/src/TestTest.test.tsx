import * as React from "react";

import { shallow } from "enzyme";
import { TestTest } from "~TestTest";

describe("<TestTest />", () => {
    it("should not crash", () => {
        const wrapper = shallow(<TestTest />);
        expect(wrapper.contains(<div>Hello!</div>)).toBeTruthy();
    });
});
