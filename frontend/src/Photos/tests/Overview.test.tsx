import * as React from "react";

import { shallow } from "enzyme";
import { IOverviewComponentProps, OverviewComponent } from "../Overview";

afterEach(() => {
    jest.restoreAllMocks();
});

const overviewComponentDefaultProps: IOverviewComponentProps = {
    photos: null,
    fetching: false,
    fetchingError: null,
    fetchingSpinner: false,

    fetchPhotos: jest.fn(),
};

describe("<Overview />", () => {
    it("should not crash", () => {
        const wrapper = shallow(
            <OverviewComponent {...overviewComponentDefaultProps} />,
        );
        expect(wrapper.contains("Overview!")).toBeTruthy();
    });
});
